import { connectDB } from "@/data/database/mangodb";
import Course from "@/data/models/course";
import { requireRoles } from "@/utils/apiAuth";
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

    if (req.method === "GET") {
      const courses = await Course.find();
      return res.status(200).json({ success: true, data: courses });
    } else if (req.method === "POST") {
      const currentUser = requireRoles(req, res, ["Superadmin", "Admin"]);
      if (!currentUser) return;

      const { name, code, description, instructor, semester, credits } = req.body;

      if (!name || !code || !instructor) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newCourse = await Course.create({
        name,
        code,
        description,
        instructor,
        semester,
        credits,
        createdBy: currentUser.email,
        enrolledStudents: [],
        enrolledFaculty: [],
      });

      return res.status(201).json({ success: true, data: newCourse });
    } else if (req.method === "PUT") {
      const currentUser = requireRoles(req, res, ["Superadmin", "Admin"]);
      if (!currentUser) return;

      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.status(200).json({ success: true, data: updatedCourse });
    } else if (req.method === "DELETE") {
      const currentUser = requireRoles(req, res, ["Superadmin", "Admin"]);
      if (!currentUser) return;

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      const deletedCourse = await Course.findByIdAndDelete(id);

      return res.status(200).json({ success: true, data: deletedCourse });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling course request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
