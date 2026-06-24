import { connectDB } from "@/data/database/mangodb";
import Discussion from "@/data/models/discussion";
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
      const discussions = await Discussion.find(query);
      return res.status(200).json({ success: true, data: discussions });
    } else if (req.method === "POST") {
      // Only Admin and Faculty can create discussions
      if (userRole !== "Superadmin" && userRole !== "Admin" && userRole !== "Faculty") {
        return res
          .status(403)
          .json({ error: "Only Admin and Faculty can create discussions" });
      }

      const { title, content, course, visibleTo } = req.body;

      if (!title || !content || !course) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newDiscussion = await Discussion.create({
        title,
        content,
        course,
        createdBy: userEmail,
        createdByRole: userRole,
        visibleTo: visibleTo || [],
        replies: [],
      });

      return res.status(201).json({ success: true, data: newDiscussion });
    } else if (req.method === "PUT") {
      // Only creator can update discussions
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Discussion ID is required" });
      }

      const discussion = await Discussion.findById(id);

      if (discussion?.createdBy !== userEmail && userRole !== "Superadmin" && userRole !== "Admin") {
        return res
          .status(403)
          .json({ error: "Only creator or Admin can update discussion" });
      }

      const updatedDiscussion = await Discussion.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return res.status(200).json({ success: true, data: updatedDiscussion });
    } else if (req.method === "DELETE") {
      // Only creator can delete discussions
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Discussion ID is required" });
      }

      const discussion = await Discussion.findById(id);

      if (discussion?.createdBy !== userEmail && userRole !== "Superadmin" && userRole !== "Admin") {
        return res
          .status(403)
          .json({ error: "Only creator or Admin can delete discussion" });
      }

      const deletedDiscussion = await Discussion.findByIdAndDelete(id);

      return res.status(200).json({ success: true, data: deletedDiscussion });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling discussion request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
