import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/data/database/mangodb";
import users from "@/data/models/users";
import { createAuthToken } from "@/utils/authToken";
import { verifyPassword } from "@/utils/password";

type User = {
  email: string;
  role: "Superadmin" | "Admin" | "Faculty" | "Student";
  name: string;
};

type ResponseData = {
  success?: boolean;
  user?: User;
  token?: string;
  error?: string;
};

// Role mapping from database values to frontend values
const roleMap: Record<string, "Superadmin" | "Admin" | "Faculty" | "Student"> = {
  superadmin: "Superadmin",
  admin: "Admin",
  faculty: "Faculty",
  employee: "Faculty",
  student: "Student",
  intern: "Student",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    await connectDB();
    const user = await users
      .findOne({ email: email.toLowerCase().trim() })
      .select("+password");

    if (!user || user.status === "inactive" || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userData = {
      email: user.email,
      role: roleMap[user.role] || "Student",
      name: user.name,
    };

    const token = createAuthToken(userData);

    return res.status(200).json({
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
