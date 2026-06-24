import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  success?: boolean;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // In a real app, you'd invalidate the token server-side
  // For now, we'll just return success and let the client clear localStorage
  return res.status(200).json({ success: true });
}

