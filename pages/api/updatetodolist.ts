import { connectDB } from "@/data/database/mangodb";
import todolist from "@/data/models/todolist";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const data = req.body; // action = 'accept' or 'reject'
    const resource = await todolist.findOneAndUpdate(
      { task: data.task },
      { completed: data.completed },
      { new: true },
    );
    await resource?.save();

    console.log("Received resource data:", data);

    // Here you can add logic to handle the resource data,
    // such as saving it to the database or processing it further.
    res.status(200).json({ message: "Resource processed successfully" });
  } catch (error) {
    console.error("Error handling resource request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
