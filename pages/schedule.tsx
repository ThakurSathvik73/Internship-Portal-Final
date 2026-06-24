import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  Menu,
  Plus,
  X,
} from "lucide-react";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "month" | "week" | "day";

type CalendarEvent = {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  meatingLink?: string;
  color: "yellow" | "green" | "red" | "purple";
  assignedTo?: string[]; // Array of user emails or IDs
};

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

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const eventColorStyles: Record<CalendarEvent["color"], string> = {
  yellow: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  green: "bg-green-50 text-green-700 border border-green-200",
  red: "bg-red-50 text-red-600 border border-red-200",
  purple: "bg-purple-50 text-purple-600 border border-purple-200",
};

const eventColorEmojis: Record<CalendarEvent["color"], string> = {
  yellow: "⭐",
  green: "✅",
  red: "❗",
  purple: "🎉",
};

const initialEvents: CalendarEvent[] = [];

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};


const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const startOfWeek = (date: Date) => addDays(date, -date.getDay());

const buildMonthGrid = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
};

const groupEventsByDate = (items: CalendarEvent[]) => {
  return items.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = event.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const SchedulePage = () => {
  const [currentView, setCurrentView] = useState<ViewMode>("month");
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [selectedColors, setSelectedColors] = useState<
    CalendarEvent["color"][]
  >([]);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    meatingLink: "",
    color: "yellow" as CalendarEvent["color"],
    assignedTo: [] as string[],
  });

  const { user } = useAuth();

  useEffect(() => {
    // Fetch events from database whenever user role changes
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched events:", data);
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [user]);

  const filteredEvents = useMemo(() => {
    // Start with color filtering
    let base = selectedColors.length === 0 ? events : events.filter((event) => selectedColors.includes(event.color));

    // If current user is a Student, hide events assigned to faculty
    if (user?.role === "Student") {
      base = base.filter((event) => !(event.assignedTo && event.assignedTo.includes("faculty")));
    }

    return base;
  }, [events, selectedColors, user]);

  const eventsByDate = useMemo(
    () => groupEventsByDate(filteredEvents),
    [filteredEvents],
  );
  const monthGrid = useMemo(() => buildMonthGrid(focusDate), [focusDate]);
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(focusDate);
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
  }, [focusDate]);

  const changeStep = (direction: number) => {
    if (currentView === "month") {
      setFocusDate(
        new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1),
      );
      return;
    }
    if (currentView === "week") {
      setFocusDate(addDays(focusDate, 7 * direction));
      return;
    }
    setFocusDate(addDays(focusDate, direction));
  };

  const handleToday = () => setFocusDate(new Date());

  const handleAddEvent = () => {
    setShowEventModal(true);
  };

  const handleOpenFilter = () => {
    setShowFilterModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const handleCloseEventDetailModal = () => {
    setShowEventDetailModal(false);
    setSelectedEvent(null);
  };

  const getTimeRemaining = (event: CalendarEvent) => {
    const now = new Date();
    const eventDateTime = new Date(
      event.date + (event.time ? `T${event.time}` : "T00:00:00"),
    );

    const diffMs = eventDateTime.getTime() - now.getTime();

    // If event has passed
    if (diffMs < 0) {
      return null;
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const remainingHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      if (diffDays === 1 && remainingHours === 0) {
        return "Tomorrow";
      }
      return `${diffDays} day${diffDays > 1 ? "s" : ""}${remainingHours > 0 ? ` ${remainingHours}h` : ""
        }`;
    }

    if (diffHours > 0) {
      const remainingMinutes = Math.floor(
        (diffMs % (1000 * 60 * 60)) / (1000 * 60),
      );
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ""
        }`;
    }

    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    }

    return "Starting soon";
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEventForm({
      title: "",
      date: "",
      time: "",
      meatingLink: "",
      color: "yellow",
      assignedTo: [],
    });
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const toggleColorFilter = (color: CalendarEvent["color"]) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
  };

  const handleFormChange = (field: string, value: string) => {
    if (field === "assignedTo") {
      setEventForm((prev) => ({ ...prev, assignedTo: JSON.parse(value) }));
    } else {
      setEventForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) return;

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventForm.title,
          date: eventForm.date,
          time: eventForm.time || undefined,
          meatingLink: eventForm.meatingLink || undefined,
          color: eventForm.color,
          assignedTo: eventForm.assignedTo.length > 0 ? eventForm.assignedTo : undefined,
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents((prev) => [...prev, newEvent]);
        handleCloseModal();
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const headerLabel = useMemo(() => {
    if (currentView === "month") {
      return `${monthNames[focusDate.getMonth()]} ${focusDate.getFullYear()}`;
    }
    if (currentView === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      const startLabel = `${monthNames[start.getMonth()].slice(
        0,
        3,
      )} ${start.getDate()}`;
      const endLabel = `${monthNames[end.getMonth()].slice(
        0,
        3,
      )} ${end.getDate()}`;
      return `${startLabel} - ${endLabel}`;
    }
    const dayLabel = `${monthNames[focusDate.getMonth()]
      } ${focusDate.getDate()}, ${focusDate.getFullYear()}`;
    return dayLabel;
  }, [currentView, focusDate, weekDays]);
  const userRole = localStorage.getItem("role")?.toLowerCase();
  const renderEventChip = (event: CalendarEvent) => (
    <>{ userRole !== "student" || !(event.assignedTo && event.assignedTo.includes("faculty")) &&
      <button
        key={event.id}
        onClick={() => handleEventClick(event)}
        className={`mt-1 text-[11px] font-medium px-2 py-1 rounded w-full text-left hover:opacity-80 transition-opacity ${eventColorStyles[event.color]
          }`}
      >
        <div className="leading-tight flex items-center gap-1">
          <span>{eventColorEmojis[event.color]}</span>
          <span>{event.title}</span>
        </div>
        {event.time && <div className="text-[10px] opacity-80">{event.time}</div>}
      </button>}</>
  );

  const MonthView = () => (
    <div className="">
      <div className="grid grid-cols-7 gap-2 mt-6  py-2 rounded-[3.55px] bg-[#E4E4E4]">
        {weekdayNames.map((day) => (
          <div
            key={day}
            className="text-xs flex justify-center items-center font-semibold text-gray-500 text-center pb-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-6">
        {monthGrid.map((day) => {
          const key = formatDateKey(day);
          const dayEvents = eventsByDate[key] || [];
          const isCurrentMonth = day.getMonth() === focusDate.getMonth();
          const highlightToday = isSameDay(day, today);

          return (
            <div
              key={key}
              className={`min-h-30 rounded-lg border border-gray-200 p-2 text-sm transition-colors ${highlightToday ? "bg-orange-50 border-orange-200" : "bg-white"
                } ${isCurrentMonth ? "" : "text-gray-300"}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>{day.getDate()}</span>
                {highlightToday && (
                  <span className="text-[10px] text-orange-500 font-semibold">
                    Today
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => renderEventChip(event))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const WeekView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
      {weekDays.map((day) => {
        const key = formatDateKey(day);
        const dayEvents = eventsByDate[key] || [];
        const highlightToday = isSameDay(day, today);

        return (
          <div
            key={key}
            className={`rounded-lg border p-4 min-h-35 ${highlightToday
                ? "border-orange-300 bg-orange-50"
                : "border-gray-200"
              }`}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-semibold text-gray-800">
                {day.getDate()}
              </span>
              <span className="text-xs text-gray-500">
                {weekdayNames[day.getDay()]}
              </span>
            </div>
            <div className="space-y-2">
              {dayEvents.length === 0 && (
                <div className="text-xs text-gray-400">No events</div>
              )}
              {dayEvents.map((event) => renderEventChip(event))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const DayView = () => {
    const key = formatDateKey(focusDate);
    const dayEvents = eventsByDate[key] || [];

    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xl font-semibold text-gray-800">
                {monthNames[focusDate.getMonth()]} {focusDate.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                {weekdayNames[focusDate.getDay()]}, {focusDate.getFullYear()}
              </div>
            </div>
            <div className="text-sm text-orange-500 font-semibold">
              Timeline
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 10 }, (_, idx) => 8 + idx).map((hour) => {
              const label = `${hour}:00`;
              const matchingEvents = dayEvents.filter((event) =>
                event.time
                  ? event.time.startsWith(String(hour).padStart(2, "0"))
                  : false,
              );

              return (
                <div key={hour} className="py-3 flex items-start gap-4">
                  <div className="w-16 text-xs text-gray-400">{label}</div>
                  <div className="flex-1 space-y-2">
                    {matchingEvents.length === 0 ? (
                      <div className="h-4 bg-gray-50 rounded"></div>
                    ) : (
                      matchingEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${eventColorStyles[event.color]
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{eventColorEmojis[event.color]}</span>
                            <span>{event.title}</span>
                          </div>
                          {event.time && (
                            <div className="text-[11px] opacity-80">
                              {event.time}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Today's Events</span>
            <span className="text-xs text-gray-500">
              {dayEvents.length} items
            </span>
          </div>
          {dayEvents.length === 0 && (
            <div className="text-sm text-gray-400">No events scheduled.</div>
          )}
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className={`px-3 py-2 rounded-lg ${eventColorStyles[event.color]
                }`}
            >
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>{eventColorEmojis[event.color]}</span>
                <span>{event.title}</span>
              </div>
              {event.time && (
                <div className="text-[11px] opacity-80">{event.time}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Schedule - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 
  transform transition-transform duration-300 
  lg:relative lg:translate-x-0 
  bg-white dark:bg-gray-900
  h-screen overflow-y-auto overflow-x-hidden
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">ESS Student Hub</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4  ">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
                  <div className="flex items-center gap-6 text-sm font-semibold text-gray-500">
                    {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setCurrentView(mode)}
                        className={`pb-1 border-b-2 transition-colors ${currentView === mode
                            ? "text-orange-500 border-orange-500"
                            : "border-transparent hover:text-orange-500"
                          }`}
                      >
                        {mode === "month"
                          ? "Monthly"
                          : mode === "week"
                            ? "Weekly"
                            : "Daily"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenFilter}
                    className="flex items-center gap-2 px-4 py-2 border-[0.89px] border-[#FF4B00] text-orange-500 rounded-lg hover:bg-orange-50 text-sm font-semibold relative"
                  >
                    <FilterIcon size={16} />
                    Filter
                    {selectedColors.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {selectedColors.length}
                      </span>
                    )}
                  </button>
                  {/* seperator */}
                  {user?.role !== "Student" && (
                    <><div className="w-px h-8 bg-gray-300" />
                      <button
                        onClick={handleAddEvent}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-semibold"
                      >
                        <Plus size={16} />
                        Add Event
                      </button></>
                  )}

                </div>
              </div>

              <div className="mt-6 flex items-center   gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => changeStep(-1)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button className="flex items-center gap-2 text-orange-500 font-semibold text-lg hover:opacity-80">
                    <span>{headerLabel}</span>
                  </button>

                  <button
                    onClick={() => changeStep(1)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <button
                  onClick={handleToday}
                  className="px-6 py-2 rounded bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
                >
                  Today
                </button>
              </div>

              {currentView === "month" && <MonthView />}
              {currentView === "week" && <WeekView />}
              {currentView === "day" && <DayView />}
            </div>
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Add New Event
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Enter event title"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => handleFormChange("time", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={eventForm.meatingLink}
                  onChange={(e) =>
                    handleFormChange("meatingLink", e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Color Tag
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(["yellow", "green", "red", "purple"] as const).map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleFormChange("color", color)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${eventForm.color === color
                            ? "border-orange-500 ring-2 ring-orange-200"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          } ${color === "yellow"
                            ? "bg-yellow-50 text-yellow-700"
                            : color === "green"
                              ? "bg-green-50 text-green-700"
                              : color === "red"
                                ? "bg-red-50 text-red-600"
                                : "bg-purple-50 text-purple-600"
                          }`}
                      >
                        {color}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  {[
                    { label: "Faculty", value: "faculty" },
                    { label: "Students", value: "students" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <input
                        type="checkbox"
                        checked={eventForm.assignedTo.includes(option.value)}
                        onChange={(e) => {
                          const newAssigned = e.target.checked
                            ? [...eventForm.assignedTo, option.value]
                            : eventForm.assignedTo.filter((a) => a !== option.value);
                          handleFormChange("assignedTo", JSON.stringify(newAssigned));
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Filter Events
              </h2>
              <button
                onClick={handleCloseFilterModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Filter by Color
                </label>
                <div className="space-y-3">
                  {(["yellow", "green", "red", "purple"] as const).map(
                    (color) => {
                      const isSelected = selectedColors.includes(color);
                      const colorCount = events.filter(
                        (e) => e.color === color,
                      ).length;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColorFilter(color)}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${isSelected
                              ? "border-orange-500 ring-2 ring-orange-200"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            } ${color === "yellow"
                              ? "bg-yellow-50 text-yellow-700"
                              : color === "green"
                                ? "bg-green-50 text-green-700"
                                : color === "red"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-purple-50 text-purple-600"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                                  ? "border-current"
                                  : "border-gray-300"
                                }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="font-semibold capitalize">
                              {color}
                            </span>
                          </div>
                          <span className="text-sm font-medium opacity-75">
                            {colorCount} {colorCount === 1 ? "event" : "events"}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {selectedColors.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseFilterModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseFilterModal}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Event Details
              </h2>
              <button
                onClick={handleCloseEventDetailModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Event Title
                </label>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">
                    {eventColorEmojis[selectedEvent.color]}
                  </span>
                  <span>{selectedEvent.title}</span>
                </div>
              </div>

              {(() => {
                const timeRemaining = getTimeRemaining(selectedEvent);
                if (timeRemaining) {
                  return (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <div className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                            Starts in
                          </div>
                          <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                            {timeRemaining}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Date
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {new Date(
                      selectedEvent.date + "T00:00:00",
                    ).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {selectedEvent.time && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Time
                    </label>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedEvent.time}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${selectedEvent.color === "yellow"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : selectedEvent.color === "green"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : selectedEvent.color === "red"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-purple-50 text-purple-600 border border-purple-200"
                      }`}
                  >
                    {selectedEvent.color}
                  </div>
                </div>
              </div>

              {selectedEvent.meatingLink && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Meeting Link
                  </label>
                  <a
                    href={selectedEvent.meatingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium underline break-all"
                  >
                    {selectedEvent.meatingLink}
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseEventDetailModal}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchedulePage;
