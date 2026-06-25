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
      const courses = await Course.find().sort({ createdAt: -1, name: 1 });
      return res.status(200).json({ success: true, data: courses });
    } else if (req.method === "POST") {
      const currentUser = requireRoles(req, res, ["Superadmin", "Admin", "Faculty"]);
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
        enrolledFaculty: currentUser.role === "Faculty" ? [currentUser.email] : [],
      });

      return res.status(201).json({ success: true, data: newCourse });
    } else if (req.method === "PATCH") {
      const currentUser = requireRoles(req, res, ["Superadmin", "Admin", "Faculty", "Student"]);
      if (!currentUser) return;

      const { id, action } = req.body;

      if (!id || action !== "enroll") {
        return res.status(400).json({ error: "Course ID and a valid action are required" });
      }

      const update =
        currentUser.role === "Faculty"
          ? { $addToSet: { enrolledFaculty: currentUser.email } }
          : { $addToSet: { enrolledStudents: currentUser.email } };

      const updatedCourse = await Course.findByIdAndUpdate(id, update, {
        new: true,
      });

      if (!updatedCourse) {
        return res.status(404).json({ error: "Course not found" });
      }

      return res.status(200).json({ success: true, data: updatedCourse });
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
    if ((error as any)?.code === 11000) {
      return res.status(409).json({ error: "Course name or code already exists" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
