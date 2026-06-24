import { connectDB } from "@/data/database/mangodb";
import AnnouncementModel from "@/data/models/announcement";
import TaskModel from "@/data/models/task";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const existingTasks = await TaskModel.find({}, { _id: 1, title: 1 }).lean();
      const taskIds = existingTasks.map((task) => String(task._id));
      const taskTitles = existingTasks
        .map((task) => String(task.title || "").trim())
        .filter(Boolean);

      const taskAnnouncements = await AnnouncementModel.find(
        { type: "task" },
        { _id: 1, sourceId: 1, description: 1 },
      ).lean();

      const orphanTaskAnnouncementIds = taskAnnouncements
        .filter((announcement) => {
          const sourceId = String(announcement.sourceId || "");
          if (sourceId) {
            return !taskIds.includes(sourceId);
          }

          const description = String(announcement.description || "");
          return !taskTitles.some((title) => description.startsWith(title));
        })
        .map((announcement) => announcement._id);

      if (orphanTaskAnnouncementIds.length > 0) {
        await AnnouncementModel.deleteMany({
          _id: { $in: orphanTaskAnnouncementIds },
        });
      }

      const email = String(req.query.email || "").toLowerCase().trim();
      const role = String(req.query.role || "");
      const query =
        role === "Superadmin" || role === "Admin"
          ? {}
          : {
              $or: [
                { targetRoles: { $size: 0 } },
                { targetRoles: role },
                { targetEmails: email },
              ],
            };

      const announcements = await AnnouncementModel.find(query)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return res.status(200).json({ success: true, data: announcements });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling announcements request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
