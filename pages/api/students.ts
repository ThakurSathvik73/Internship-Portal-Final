import { connectDB } from "@/data/database/mangodb";
import UserModel from "@/data/models/users";
import TaskModel from "@/data/models/task";
import type { NextApiRequest, NextApiResponse } from "next";

const formatStudent = (student: any, tasks: any[]) => {
  const completed = tasks.filter((task) => task.status === "completed").length;

  return {
    id: student._id?.toString(),
    name: student.name,
    email: student.email,
    course: tasks[0]?.course || "Not assigned",
    college: tasks[0]?.college || "",
    gpa: "N/A",
    assignmentsCompleted: completed,
    assignmentsTotal: tasks.length,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    await connectDB();

    const facultyEmail = String(req.query.faculty || "").toLowerCase().trim();
    const students = await UserModel.find({ role: "student", status: "active" })
      .select("name email")
      .sort({ name: 1 })
      .lean();

    const studentEmails = students.map((student) => student.email);
    const taskQuery: Record<string, any> = { assignedStudents: { $in: studentEmails } };

    if (facultyEmail) {
      taskQuery.assignedTo = facultyEmail;
    }

    const tasks = await TaskModel.find(taskQuery)
      .select("assignedStudents status course college")
      .lean();

    const tasksByStudent = tasks.reduce<Record<string, any[]>>((acc, task) => {
      for (const email of task.assignedStudents || []) {
        acc[email] = acc[email] || [];
        acc[email].push(task);
      }
      return acc;
    }, {});

    const mappedStudents = students.map((student) =>
      formatStudent(student, tasksByStudent[student.email] || []),
    );

    return res.status(200).json({ success: true, students: mappedStudents });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
