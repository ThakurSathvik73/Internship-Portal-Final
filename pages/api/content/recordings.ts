import { connectDB } from "@/data/database/mangodb";
import Recording from "@/data/models/recording";
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
      const recordings = await Recording.find(query);
      return res.status(200).json({ success: true, data: recordings });
    } else if (req.method === "POST") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { title, description, course, recordingUrl, thumbnail, duration, recordedDate, assignedTo } =
        req.body;

      if (!title || !course || !recordingUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newRecording = await Recording.create({
        title,
        description,
        course,
        recordingUrl,
        thumbnail,
        duration,
        recordedDate,
        createdBy: currentUser.email,
        assignedTo: assignedTo || [],
      });

      return res.status(201).json({ success: true, data: newRecording });
    } else if (req.method === "PUT") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Recording ID is required" });
      }

      const updatedRecording = await Recording.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.status(200).json({ success: true, data: updatedRecording });
    } else if (req.method === "DELETE") {
      if (!requireRoles(req, res, ["Superadmin", "Admin", "Faculty"])) return;

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Recording ID is required" });
      }

      const deletedRecording = await Recording.findByIdAndDelete(id);

      return res.status(200).json({ success: true, data: deletedRecording });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling recording request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
