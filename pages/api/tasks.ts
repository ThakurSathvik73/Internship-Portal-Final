import { connectDB } from "@/data/database/mangodb";
import AnnouncementModel from "@/data/models/announcement";
import TaskModel from "@/data/models/task";
import { requireRoles } from "@/utils/apiAuth";
import type { NextApiRequest, NextApiResponse } from "next";

const normalizeEmail = (value: unknown) => String(value || "").trim().toLowerCase();

const normalizeEmailList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.map(normalizeEmail).filter(Boolean);
};

const taskAnnouncementDescription = (task: any) => {
  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US")
    : "";

  return [
    task.title,
    task.course ? `Course: ${task.course}` : "",
    dueDate ? `Due: ${dueDate}` : "",
    task.description || "",
  ]
    .filter(Boolean)
    .join(" | ");
};

const syncTaskAnnouncement = async (task: any, createdBy: string) => {
  await AnnouncementModel.findOneAndUpdate(
    { sourceType: "task", sourceId: String(task._id) },
    {
      title: "New task created",
      description: taskAnnouncementDescription(task),
      type: "task",
      targetRoles: [],
      targetEmails: [],
      createdBy,
      sourceType: "task",
      sourceId: String(task._id),
      important: true,
    },
    { upsert: true, new: true },
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    const currentUser = requireRoles(req, res, [
      "Superadmin",
      "Admin",
      "Faculty",
      "Student",
    ]);
    if (!currentUser) return;

    if (req.method === "GET") {
      const scope = String(req.query.scope || "");
      let query: Record<string, any> = {};

      if (scope === "dashboard") {
        query = { status: { $ne: "completed" } };
      } else if (currentUser.role === "Faculty") {
        query = { assignedTo: currentUser.email };
      } else if (currentUser.role === "Student") {
        query = { assignedStudents: currentUser.email };
      }

      const tasks = await TaskModel.find(query).sort({ createdAt: -1 }).lean();

      return res.status(200).json({ success: true, tasks });
    }

    if (req.method === "POST") {
      if (!requireRoles(req, res, ["Superadmin", "Admin"])) return;

      const { title, description, course, college, assignedTo, dueDate } = req.body;
      const normalizedAssignedTo = normalizeEmail(assignedTo);

      if (!title || !course) {
        return res.status(400).json({ error: "Title and course are required" });
      }

      const task = await TaskModel.create({
        title: String(title).trim(),
        description: String(description || "").trim(),
        course: String(course).trim(),
        college: String(college || "").trim(),
        createdBy: currentUser.email,
        assignedTo: normalizedAssignedTo,
        dueDate: dueDate || new Date(),
        status: normalizedAssignedTo ? "assigned" : "created",
      });

      await syncTaskAnnouncement(task, currentUser.email);

      return res.status(201).json({ success: true, task });
    }

    if (req.method === "PUT") {
      const { id, assignedTo, assignedStudents, status } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      const task = await TaskModel.findById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (assignedTo !== undefined) {
        if (!requireRoles(req, res, ["Superadmin", "Admin"])) return;
        task.assignedTo = normalizeEmail(assignedTo);
        task.status = "assigned";
      }

      if (assignedStudents !== undefined) {
        if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;
        if (
          currentUser.role === "Faculty" &&
          task.assignedTo !== currentUser.email
        ) {
          return res.status(403).json({ error: "Faculty can only assign their own tasks" });
        }
        task.assignedStudents = normalizeEmailList(assignedStudents);
        task.status = "in-progress";
      }

      if (status !== undefined) {
        if (
          currentUser.role === "Student" &&
          !task.assignedStudents?.includes(currentUser.email)
        ) {
          return res.status(403).json({ error: "Students can only update their own assigned tasks" });
        }
        task.status = status;
      }

      await task.save();
      await syncTaskAnnouncement(task, task.createdBy || currentUser.email);

      return res.status(200).json({ success: true, task });
    }

    if (req.method === "DELETE") {
      if (!requireRoles(req, res, ["Superadmin", "Admin"])) return;

      const { id } = req.body;
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
          { type: "task", sourceId: String(id) },
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
