import { connectDB } from "@/data/database/mangodb";
import todolist from "@/data/models/todolist";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    const resources = await todolist.find();
    console.log("Received resource data:", resources);

    // Here you can add logic to handle the resource data,
    // such as saving it to the database or processing it further.
    res.status(200).json({
      todolist: resources,
    });
  } catch (error) {
    console.error("Error handling resource request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
