import { connectDB } from "@/data/database/mangodb";
import users from "@/data/models/users";
import { requireRoles } from "@/utils/apiAuth";
import { hashPassword } from "@/utils/password";
import { NextApiRequest, NextApiResponse } from "next";

const allowedRoles = ["superadmin", "admin", "faculty", "student"];
const displayRoleMap: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};
const adminManageableRoles = ["faculty", "student"];

function formatUser(user: any) {
  const data = user.toObject ? user.toObject() : user;
  delete data.password;
  delete data.__v;

  return {
    ...data,
    id: data._id?.toString(),
    role: displayRoleMap[data.role] || "Student",
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const currentUser = requireRoles(req, res, ["Superadmin", "Admin"]);
    if (!currentUser) return;

    if (req.method === "GET") {
      await connectDB();
      const query =
        currentUser.role === "Superadmin" ? {} : { role: { $in: adminManageableRoles } };
      const all = await users.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ users: all.map(formatUser) });
    }

    if (req.method === "POST") {
      await connectDB();
      const role = String(req.body.role || "").toLowerCase();
      const data = {
        name: String(req.body.name || "").trim(),
        email: String(req.body.email || "").toLowerCase().trim(),
        password: String(req.body.password || ""),
        role,
        status: req.body.status || "active",
        joinedDate: req.body.joinedDate || new Date(),
      };

      if (!data.name || !data.email || !data.password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }

      if (!allowedRoles.includes(data.role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      if (
        currentUser.role === "Admin" &&
        !adminManageableRoles.includes(data.role)
      ) {
        return res.status(403).json({ error: "Admins can only create faculty and students" });
      }

      if (data.role === "superadmin" && currentUser.role !== "Superadmin") {
        return res.status(403).json({ error: "Only a superadmin can create another superadmin" });
      }

      if (data.password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existing = await users.exists({ email: data.email });
      if (existing) {
        return res.status(409).json({ error: "A user with this email already exists" });
      }

      data.password = hashPassword(data.password);
      const userDoc = new users(data);
      await userDoc.save();
      return res.status(201).json({ message: "User created", user: formatUser(userDoc) });
    }

    if (req.method === "DELETE") {
      await connectDB();
      const id = String(req.body.id || "");

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const userToDelete = await users.findById(id);
      if (!userToDelete) {
        return res.status(404).json({ error: "User not found" });
      }

      if (userToDelete.email === currentUser.email) {
        return res.status(400).json({ error: "You cannot delete your own account" });
      }

      if (
        currentUser.role === "Admin" &&
        !adminManageableRoles.includes(userToDelete.role)
      ) {
        return res.status(403).json({ error: "Admins can only delete faculty and students" });
      }

      if (userToDelete.role === "superadmin" && currentUser.role !== "Superadmin") {
        return res.status(403).json({ error: "Only a superadmin can delete a superadmin" });
      }

      await users.findByIdAndDelete(id);
      return res.status(200).json({ message: "User deleted" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("Error handling users request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
