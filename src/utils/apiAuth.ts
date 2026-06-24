import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuthToken, type AuthTokenUser } from "@/utils/authToken";

export type ApiRole = AuthTokenUser["role"];

export function getRequestUser(req: NextApiRequest): AuthTokenUser | null {
  const authHeader = Array.isArray(req.headers.authorization)
    ? req.headers.authorization[0]
    : req.headers.authorization;

  return verifyAuthToken(authHeader);
}

export function requireRoles(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles: ApiRole[],
): AuthTokenUser | null {
  const user = getRequestUser(req);

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    res.status(403).json({ error: "You do not have permission to access this resource" });
    return null;
  }

  return user;
}
