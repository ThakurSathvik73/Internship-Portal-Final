"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, dateFnsLocalizer, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

/* -------------------- SETUP -------------------- */
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/* -------------------- HOLIDAYS -------------------- */
const HOLIDAYS = [
  { month: 0, day: 1, name: "New Year" },
  { month: 0, day: 26, name: "Republic Day" },
  { month: 7, day: 15, name: "Independence Day" },
];

/* -------------------- MONTHS -------------------- */
const MONTHS = [
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

/* -------------------- DAILY SCHEDULE -------------------- */
const CLASS_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Physics Laboratory",
  "Chemistry",
  "Chemistry Laboratory",
  "Computer Science",
  "Lab / Project",
];
const DAILY_SCHEDULE: { time: string; subject: string }[] = [];
let hour = 9;

for (let i = 0; i < CLASS_SUBJECTS.length; i++) {
  if (hour === 13) {
    DAILY_SCHEDULE.push({ time: "01:00 PM - 02:00 PM", subject: "Lunch" });
    hour++;
  }
  const formatTime = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h;
    return `${hour12.toString().padStart(2, "0")}:00 ${period}`;
  };
  DAILY_SCHEDULE.push({
    time: `${formatTime(hour)} - ${formatTime(hour + 1)}`,
    subject: CLASS_SUBJECTS[i],
  });
  hour++;
}

/* -------------------- COUNTDOWN REMINDER -------------------- */
function CountdownReminder({
  date,
  item,
}: {
  date: Date;
  item: { time: string; subject: string };
}) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const [startTime] = item.time.split(" - ");
    const [h, m] = startTime.split(/[: ]/).map(Number);
    const isPM = startTime.includes("PM");
    let hours = h + (isPM && h < 12 ? 12 : 0) - (!isPM && h === 12 ? 12 : 0);

    const targetDate = new Date(date);
    targetDate.setHours(hours, m, 0, 0);

    const tick = () => {
      const now = new Date();
      let diff = targetDate.getTime() - now.getTime();
      if (diff < 0) diff = 0; // Prevent negative countdown
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [date, item]);

  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <span className="text-sm font-semibold text-yellow-300">
      ⏰ Class will start in {days} days {hours}h {minutes}min{" "}
      {seconds.toString().padStart(2, "0")}s
    </span>
  );
}

/* -------------------- DASHBOARD -------------------- */
export default function Dashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const currentDate = new Date(year, month, 1);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const getHoliday = (date: Date) =>
    HOLIDAYS.find(
      (h) => date.getDate() === h.day && date.getMonth() === h.month,
    );

  const handleSelectSlot = ({ start }: any) => {
    const holiday = getHoliday(start);
    if (holiday) {
      setHolidayName(holiday.name);
      setShowHolidayModal(true);
      return;
    }
    setSelectedDate(start);
    setShowScheduleModal(true);
  };

  return (
    <div
      className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} flex h-screen`}
    >
      {/* Sidebar */}
      <aside
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} w-64 p-6 shadow flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-xl font-bold mb-6 text-yellow-500">
            ESS STUDENT HUB
          </h2>
          <ul className="space-y-4">
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/schedule">Schedule</Link>
            </li>
            <li>
              <Link href="/assignments">Assignments</Link>
            </li>
            <li>
              <Link href="/recordings">Recordings</Link>
            </li>
            <li>
              <Link href="/discussions">Discussions</Link>
            </li>
          </ul>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-6 px-4 py-2 rounded-lg bg-yellow-400 text-indigo-900 font-semibold hover:bg-yellow-300 transition-colors"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">
          {MONTHS[month]} {year} Calendar
        </h1>

        {/* Month & Year */}
        <div className="flex gap-4 mb-4 items-center">
          <select
            className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-2 rounded-lg border`}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, idx) => (
              <option key={idx} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-2 rounded-lg border w-24`}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>

        {/* Calendar */}
        <Calendar
          localizer={localizer}
          date={currentDate}
          views={["month"]}
          selectable
          startAccessor="start"
          endAccessor="end"
          style={{ height: "75vh" }}
          onSelectSlot={handleSelectSlot}
          toolbar={false}
          dayPropGetter={(date) => {
            const holiday = getHoliday(date);
            if (holiday)
              return {
                style: { backgroundColor: "#f87171", fontWeight: "bold" },
              };
            return {};
          }}
          className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} rounded-lg shadow`}
        />
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-3xl w-full max-w-3xl shadow-xl p-6 text-black dark:text-white`}
          >
            <h2 className="text-3xl font-bold mb-6 text-yellow-500 text-center">
              Schedule for {format(selectedDate, "dd MMM yyyy")}
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col w-20 items-center border-r border-gray-400 pr-3">
                {DAILY_SCHEDULE.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center mb-4"
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mb-1"></div>
                    <span className="text-xs">{item.time.split(" - ")[0]}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-4">
                {DAILY_SCHEDULE.map((item, i) => {
                  const colors: Record<string, string> = {
                    Mathematics: "from-green-400 to-green-600",
                    Physics: "from-blue-400 to-blue-600",
                    Chemistry: "from-purple-400 to-purple-600",
                    "Computer Science": "from-indigo-400 to-indigo-600",
                    "Lab / Project": "from-pink-400 to-pink-600",
                    Lunch: "from-yellow-300 to-yellow-500",
                  };
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl shadow-lg bg-linear-to-r ${colors[item.subject] || "from-gray-400 to-gray-600"} hover:scale-105 transition-transform duration-300`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{item.subject}</span>
                        <CountdownReminder date={selectedDate} item={item} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-8 py-2 rounded-xl bg-yellow-400 text-indigo-900 font-semibold hover:bg-yellow-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-3xl w-full max-w-md shadow-xl p-6 text-center`}
          >
            <h2 className="text-4xl font-bold text-pink-500 mb-4">
              🎉 {holidayName}!
            </h2>
            <p className="mb-6 text-lg">{`Today is a holiday. No classes scheduled.`}</p>
            <button
              onClick={() => setShowHolidayModal(false)}
              className="px-8 py-2 rounded-xl bg-yellow-400 text-indigo-900 font-semibold hover:bg-yellow-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
