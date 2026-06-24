import { connectDB } from "@/data/database/mangodb";
import { NextApiRequest, NextApiResponse } from "next";
import Resorces from "@/data/models/resorces";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    const resources = await Resorces.find();
    console.log("Received resource data:", resources);

    // Here you can add logic to handle the resource data,
    // such as saving it to the database or processing it further.
    res.status(200).json({
      message: "Resources retrieved successfully",
      resources: resources,
    });
  } catch (error) {
    console.error("Error handling resource request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
