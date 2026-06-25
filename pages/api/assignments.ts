import { connectDB } from "@/data/database/mangodb";
import assignment from "@/data/models/assignment";
import { requireRoles } from "@/utils/apiAuth";
import type { NextApiRequest, NextApiResponse } from "next";

type Assignment = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: "Pending" | "Progress" | "Done";
  students: string[];
  submission?: { url: string; submittedAt: Date; fileName: string };
  grade?: number;
};

type ResponseData = {
  success?: boolean;
  data?: Assignment | Assignment[];
  error?: string;
};

// In-memory storage (replace with database in production)
let assignments: Assignment[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    await connectDB();
    const currentUser = requireRoles(req, res, ["Superadmin", "Admin", "Faculty", "Student"]);
    if (!currentUser) return;

    if (req.method === "GET") {
      assignments = await assignment.find();

      const filteredAssignments =
        currentUser.role === "Student"
          ? assignments.filter((item) => item.students?.includes(currentUser.email))
          : assignments;

      return res.status(200).json({ success: true, data: filteredAssignments });
    } else if (req.method === "POST") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { title, course, dueDate, students } = req.body;

      if (!title || !course || !dueDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      assignments = await assignment.create({
        id: assignments.length
          ? Math.max(...assignments.map((a) => a.id)) + 1
          : 1,
        title,
        course,
        dueDate,
        status: "Pending",
        students: Array.isArray(students) ? students : [],
      });

      res.status(201).json({ success: true, data: assignments });
    } else if (req.method === "PUT") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty", "Student"])) return;

      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Assignment ID is required" });
      }

      if (currentUser.role === "Student") {
        const existingAssignment = await assignment.findOne({ id });
        if (!existingAssignment?.students?.includes(currentUser.email)) {
          return res.status(403).json({ error: "Students can only update their own assignments" });
        }
      }

      const updateAssignment = await assignment.findOneAndUpdate(
        { id: id },
        updateData,
        {
          new: true,
        },
      );

      res.status(200).json({ success: true, data: updateAssignment });
    } else if (req.method === "DELETE") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Assignment ID is required" });
      }

      const DeleteAssignment = await assignment.findOneAndDelete({ id: id });

      res.status(200).json({ success: true, data: DeleteAssignment });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling assignment request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
