import calenderevents from "@/data/models/calenderevents";
import { connectDB } from "@/data/database/mangodb";
import AnnouncementModel from "@/data/models/announcement";
import type { NextApiRequest, NextApiResponse } from "next";

type CalendarEvent = {
  _id?: string;
  title: string;
  date: string;
  time?: string;
  meatingLink?: string;
  color: "yellow" | "green" | "red" | "purple";
  assignedTo?: string[];
};

// In-memory storage (replace with actual database)
let events: CalendarEvent[] = [];

const normalizeEvent = (event: any): CalendarEvent => ({
  _id: String(event._id || ""),
  title: event.title,
  date: event.date,
  time: event.time,
  meatingLink: event.meatingLink,
  color: event.color,
  assignedTo: event.assignedTo || [],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
  if (req.method === "GET") {
    // Fetch all events
    events = await calenderevents.find();
    return res.status(200).json(events.map(normalizeEvent));
  }

  if (req.method === "POST") {
    // Create new event
    const { title, date, time, meatingLink, color, assignedTo } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }
    const newEvent = await calenderevents.create({
      title,
      date,
      time,
      meatingLink,
      color,
      assignedTo: assignedTo || [],
    });
    const targetRoles = (assignedTo || []).flatMap((target: string) => {
      if (target === "faculty") return ["Faculty"];
      if (target === "students") return ["Student"];
      return [];
    });

    await AnnouncementModel.create({
      title: "New meeting scheduled",
      description: `${title} is scheduled for ${date}${time ? ` at ${time}` : ""}.`,
      type: "meeting",
      targetRoles,
      targetEmails: [],
      createdBy: "",
      sourceType: "event",
      sourceId: String(newEvent._id),
      important: true,
    });
    return res.status(201).json(normalizeEvent(newEvent));
  }
//new comment
  if (req.method === "DELETE") {
    // Delete event
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }
    const deletedEvent = await calenderevents.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    await AnnouncementModel.deleteMany({
      $or: [
        { sourceType: "event", sourceId: String(id) },
        {
          type: "meeting",
          description: `${deletedEvent.title} is scheduled for ${deletedEvent.date}${
            deletedEvent.time ? ` at ${deletedEvent.time}` : ""
          }.`,
        },
      ],
    });

    return res.status(200).json({ message: "Event deleted successfully" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
