import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {};

type CalendarEvent = {
  _id?: string;
  title: string;
  date: string;
  time?: string;
  color?: "yellow" | "green" | "red" | "purple";
  assignedTo?: string[];
};

const getEventDateTime = (event: CalendarEvent) => {
  const time = event.time || "23:59";
  const eventDateTime = new Date(`${event.date}T${time}`);
  return Number.isNaN(eventDateTime.getTime())
    ? new Date(`${event.date}T23:59`)
    : eventDateTime;
};

const formatEventTime = (time?: string) => {
  if (!time) return "";
  const [hourValue, minute = "00"] = time.split(":");
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.padStart(2, "0")} ${period}`;
};

const CalendarView = (props: Props) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    return daysArray;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) return;
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load calendar events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const assignedTo = event.assignedTo || [];
      if (assignedTo.length === 0) return true;
      if (user?.role === "Student") return assignedTo.includes("students");
      if (user?.role === "Faculty") return assignedTo.includes("faculty");
      return true;
    }).filter((event) => getEventDateTime(event).getTime() >= currentTime.getTime());
  }, [events, user?.role, currentTime]);

  const eventsByDate = useMemo(() => {
    return visibleEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      if (!event.date) return acc;
      acc[event.date] = [...(acc[event.date] || []), event];
      return acc;
    }, {});
  }, [visibleEvents]);

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  const dates = getDaysInMonth(currentDate);
  const monthYear = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl   ">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-orange-500">{monthYear}</h3>
        <button
          onClick={goToNextMonth}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium mb-2"
          >
            {day}
          </div>
        ))}
        {dates.map((date, idx) => {
          const dayEvents = date ? eventsByDate[getDateKey(date)] || [] : [];

          return (
          <div
            key={idx}
            title={dayEvents.map((event) => `${event.title}${event.time ? ` at ${formatEventTime(event.time)}` : ""}`).join(", ")}
            className={`relative text-center text-sm py-1 cursor-pointer transition-colors ${
              date === null
                ? "text-transparent pointer-events-none"
                : dayEvents.length > 0
                  ? "bg-orange-500 text-white rounded-full font-semibold"
                  : isToday(date)
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            }`}
          >
            {date || ""}
            {dayEvents.length > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] leading-4 text-white">
                {dayEvents.length}
              </span>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
