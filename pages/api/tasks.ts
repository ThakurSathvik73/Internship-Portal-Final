import { connectDB } from "@/data/database/mangodb";
import AnnouncementModel from "@/data/models/announcement";
import TaskModel from "@/data/models/task";
import type { NextApiRequest, NextApiResponse } from "next";

type Task = {
  _id?: string;
  title: string;
  description: string;
  course: string;
  college?: string;
  createdBy: string;
  assignedTo?: string;
  assignedStudents?: string[];
  dueDate: string;
  status: "created" | "assigned" | "in-progress" | "completed";
  createdAt: Date;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const { role, email } = req.query;
      const userRole = String(role || "");
      const userEmail = String(email || "").toLowerCase().trim();

      const query: Record<string, any> = {};

      if (userRole === "Faculty") {
        query.assignedTo = userEmail;
      } else if (userRole === "Student") {
        query.assignedStudents = userEmail;
      }

      const tasks = await TaskModel.find(query).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, tasks });
    }

    if (req.method === "POST") {
      const { title, description, course, college, createdBy, assignedTo, dueDate, role } = req.body;

      if (role !== "Superadmin" && role !== "Admin") {
        return res.status(403).json({ error: "Only Admin and Superadmin can create tasks" });
      }

      if (!title || !course || !createdBy) {
        return res.status(400).json({ error: "Title, course, and createdBy are required" });
      }

      const assignedFaculty = String(assignedTo || "").toLowerCase().trim();
      const newTask: Task = {
        title,
        description: description || "",
        course,
        college: college || "",
        createdBy: String(createdBy).toLowerCase().trim(),
        assignedTo: assignedFaculty,
        dueDate: dueDate || new Date().toISOString(),
        status: assignedFaculty ? "assigned" : "created",
        createdAt: new Date(),
      };

      const task = await TaskModel.create(newTask);
      await AnnouncementModel.create({
        title: "New task assigned",
        description: assignedFaculty
          ? `${title} has been assigned to ${assignedFaculty}.`
          : `${title} has been created.`,
        type: "task",
        targetRoles: assignedFaculty ? ["Faculty"] : ["Admin", "Superadmin"],
        targetEmails: assignedFaculty ? [assignedFaculty] : [],
        createdBy: String(createdBy).toLowerCase().trim(),
        sourceType: "task",
        sourceId: String(task._id),
        important: true,
      });
      return res.status(201).json({ success: true, task });
    }

    if (req.method === "PUT") {
      const { id, assignedTo, assignedStudents, status, college } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      const update: Record<string, any> = {};

      if (assignedTo !== undefined) {
        update.assignedTo = String(assignedTo).toLowerCase().trim();
        update.status = "assigned";
      }

      if (assignedStudents !== undefined) {
        update.assignedStudents = Array.isArray(assignedStudents)
          ? assignedStudents.map((email) => String(email).toLowerCase().trim()).filter(Boolean)
          : [];
        update.status = "in-progress";
      }

      if (status !== undefined) {
        update.status = status;
      }

      if (college !== undefined) {
        update.college = college;
      }

      const task = await TaskModel.findByIdAndUpdate(id, update, { new: true });
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (assignedTo !== undefined || assignedStudents !== undefined) {
        await AnnouncementModel.create({
          title: assignedStudents !== undefined ? "Task assigned to students" : "Task assigned to faculty",
          description:
            assignedStudents !== undefined
              ? `${task.title} has been assigned to students.`
              : `${task.title} has been assigned to ${update.assignedTo}.`,
          type: "task",
          targetRoles: assignedStudents !== undefined ? ["Student"] : ["Faculty"],
          targetEmails:
            assignedStudents !== undefined
              ? update.assignedStudents || []
              : update.assignedTo
                ? [update.assignedTo]
                : [],
          createdBy: "",
          sourceType: "task",
          sourceId: String(task._id),
          important: true,
        });
      }

      return res.status(200).json({ success: true, task });
    }

    if (req.method === "DELETE") {
      const { id, role } = req.body;
      if (role !== "Superadmin" && role !== "Admin") {
        return res.status(403).json({ error: "Only Admin and Superadmin can delete tasks" });
      }

      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }
      const deletedTask = await TaskModel.findByIdAndDelete(id);
      if (!deletedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      await AnnouncementModel.deleteMany({
        $or: [
          { sourceType: "task", sourceId: String(id) },
          {
            type: "task",
            description: {
              $in: [
                `${deletedTask.title} has been created.`,
                `${deletedTask.title} has been assigned to ${deletedTask.assignedTo}.`,
                `${deletedTask.title} has been assigned to students.`,
              ],
            },
          },
        ],
      });
      return res.status(200).json({ success: true, message: "Task deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling task request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
