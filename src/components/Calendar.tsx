import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {};

const CalendarView = (props: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1)); // June 2024

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
        {dates.map((date, idx) => (
          <div
            key={idx}
            className={`text-center text-sm py-1 cursor-pointer transition-colors ${
              date === null
                ? "text-transparent pointer-events-none"
                : date === 4
                  ? "bg-orange-500 text-white rounded-full font-semibold"
                  : date === 8
                    ? "bg-orange-100 dark:bg-orange-950 text-orange-500 dark:text-orange-400 rounded-full font-semibold"
                    : isToday(date)
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            }`}
          >
            {date || ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
