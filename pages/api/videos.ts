import { connectDB } from "@/data/database/mangodb";
import Video from "@/data/models/video";
import type { NextApiRequest, NextApiResponse } from "next";

type Video = {
  _id?: string;
  title: string;
  videoLink: string;
  course: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const videos = await Video.find();
      return res.status(200).json({ success: true, videos });
    }

    if (req.method === "POST") {
      const { title, videoLink, videoUrl, course, description, createdBy, duration, assignedTo } = req.body;
      const resolvedUrl = videoUrl || videoLink;

      if (!title || !resolvedUrl || !course) {
        return res.status(400).json({ error: "Title, video link, and course are required" });
      }

      const newVideo = await Video.create({
        title,
        videoUrl: resolvedUrl,
        course,
        description,
        createdBy: createdBy || "system",
        duration,
        assignedTo: assignedTo || [],
      });

      return res.status(201).json({ success: true, video: newVideo });
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Video ID is required" });
      }
      await Video.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Video deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling video request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
