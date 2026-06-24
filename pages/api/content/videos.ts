import { connectDB } from "@/data/database/mangodb";
import Video from "@/data/models/video";
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

    const userRole = req.headers["x-user-role"] as string;
    const userEmail = req.headers["x-user-email"] as string;

    if (req.method === "GET") {
      const { course } = req.query;
      const query = course ? { course } : {};
      const videos = await Video.find(query);
      return res.status(200).json({ success: true, data: videos });
    } else if (req.method === "POST") {
      // Only Admin and Faculty can create videos
      if (userRole !== "Superadmin" && userRole !== "Admin" && userRole !== "Faculty") {
        return res
          .status(403)
          .json({ error: "Only Admin and Faculty can create videos" });
      }

      const { title, description, course, videoUrl, thumbnail, duration, assignedTo } =
        req.body;

      if (!title || !course || !videoUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newVideo = await Video.create({
        title,
        description,
        course,
        videoUrl,
        thumbnail,
        duration,
        createdBy: userEmail,
        assignedTo: assignedTo || [],
      });

      return res.status(201).json({ success: true, data: newVideo });
    } else if (req.method === "PUT") {
      // Only Admin and Faculty can update videos
      if (userRole !== "Superadmin" && userRole !== "Admin" && userRole !== "Faculty") {
        return res
          .status(403)
          .json({ error: "Only Admin and Faculty can update videos" });
      }

      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      const updatedVideo = await Video.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.status(200).json({ success: true, data: updatedVideo });
    } else if (req.method === "DELETE") {
      // Only Admin and Faculty can delete videos
      if (userRole !== "Superadmin" && userRole !== "Admin" && userRole !== "Faculty") {
        return res
          .status(403)
          .json({ error: "Only Admin and Faculty can delete videos" });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Video ID is required" });
      }

      const deletedVideo = await Video.findByIdAndDelete(id);

      return res.status(200).json({ success: true, data: deletedVideo });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling video request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
