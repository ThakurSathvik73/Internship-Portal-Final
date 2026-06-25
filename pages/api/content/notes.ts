import { connectDB } from "@/data/database/mangodb";
import Note from "@/data/models/note";
import { getRequestUser, requireRoles } from "@/utils/apiAuth";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  success?: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    await connectDB();

    const currentUser = getRequestUser(req);

    if (!currentUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.method === "GET") {
      const { course } = req.query;
      const query = course ? { course } : {};
      const notes = await Note.find(query);
      return res.status(200).json({ success: true, data: notes });
    } else if (req.method === "POST") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { title, content, course, topic, fileUrl, assignedTo } = req.body;

      if (!title || !content || !course) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newNote = await Note.create({
        title,
        content,
        course,
        topic,
        fileUrl,
        createdBy: currentUser.email,
        assignedTo: assignedTo || [],
      });

      return res.status(201).json({ success: true, data: newNote });
    } else if (req.method === "PUT") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Note ID is required" });
      }

      const updatedNote = await Note.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.status(200).json({ success: true, data: updatedNote });
    } else if (req.method === "DELETE") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Note ID is required" });
      }

      const deletedNote = await Note.findByIdAndDelete(id);

      return res.status(200).json({ success: true, data: deletedNote });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling note request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
