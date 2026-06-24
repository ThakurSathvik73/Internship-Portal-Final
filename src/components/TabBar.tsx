import { Bell, Check, Search, X } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./theme/ModeToggle";

type Props = {};

const TabBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Assignment reminder",
      message: "React Project Submission is due today.",
      time: "Today",
      read: false,
    },
    {
      id: 2,
      title: "Class update",
      message: "Your next online class is available in Upcoming Classes.",
      time: "Tomorrow",
      read: false,
    },
    {
      id: 3,
      title: "Discussion reply",
      message: "A faculty member replied to your course discussion.",
      time: "2 days ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  const dismissNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between h-16.25">
      {/* Search Bar */}
      <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-72 dark:bg-gray-800">
        <Search size={18} className="text-orange-500" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
        />
        <div className="flex items-center gap-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.4564 2.78839H10.4564C10.8878 2.78839 11.3015 2.95976 11.6065 3.2648C11.9116 3.56984 12.083 3.98356 12.083 4.41495V4.41495C12.083 4.84634 11.9116 5.26006 11.6065 5.5651C11.3015 5.87014 10.8878 6.04151 10.4564 6.04151H8.82983V4.41495C8.82983 3.98356 9.0012 3.56984 9.30624 3.2648C9.61128 2.95976 10.025 2.78839 10.4564 2.78839V2.78839Z"
              stroke="#FF4B00"
              strokeWidth="1.39419"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.0415 6.0415H4.41494C3.98355 6.0415 3.56983 5.87013 3.26479 5.5651C2.95975 5.26006 2.78838 4.84633 2.78838 4.41494V4.41494C2.78838 3.98355 2.95975 3.56983 3.26479 3.26479C3.56983 2.95975 3.98355 2.78838 4.41494 2.78838H4.41494C4.84633 2.78838 5.26006 2.95975 5.5651 3.26479C5.87013 3.56983 6.0415 3.98355 6.0415 4.41494V6.0415Z"
              stroke="#FF4B00"
              strokeWidth="1.39419"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.82983 8.8299H10.4564C10.8878 8.8299 11.3015 9.00126 11.6065 9.3063C11.9116 9.61134 12.083 10.0251 12.083 10.4565V10.4565C12.083 10.8878 11.9116 11.3016 11.6065 11.6066C11.3015 11.9116 10.8878 12.083 10.4564 12.083H10.4564C10.025 12.083 9.61128 11.9116 9.30624 11.6066C9.0012 11.3016 8.82983 10.8878 8.82983 10.4565V8.8299Z"
              stroke="#FF4B00"
              strokeWidth="1.39419"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.41494 12.083H4.41494C3.98355 12.083 3.56983 11.9117 3.26479 11.6066C2.95975 11.3016 2.78838 10.8879 2.78838 10.4565V10.4565C2.78838 10.0251 2.95975 9.61135 3.26479 9.30631C3.56983 9.00127 3.98355 8.8299 4.41494 8.8299H6.0415V10.4565C6.0415 10.8879 5.87013 11.3016 5.5651 11.6066C5.26006 11.9117 4.84633 12.083 4.41494 12.083V12.083Z"
              stroke="#FF4B00"
              strokeWidth="1.39419"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.82989 6.0415H6.0415V8.82989H8.82989V6.0415Z"
              stroke="#FF4B00"
              strokeWidth="1.39419"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="text-orange-500 font-semibold text-sm">F</span>
        </div>
      </div>

      {/* Right Side - Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 text-[10px] leading-3 text-white">
                {unreadCount}
              </span>
            )}
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h2>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <Check size={14} />
                  Mark read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    No notifications.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 ${
                        notification.read ? "" : "bg-orange-50 dark:bg-orange-950/20"
                      }`}
                    >
                      <span
                        className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                          notification.read ? "bg-gray-300" : "bg-orange-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => dismissNotification(notification.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={`Dismiss ${notification.title}`}
                          >
                            <X size={14} className="text-gray-500" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] text-gray-400">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <ModeToggle />
        </div>

        {/* User Profile */}
       
       
      </div>
    </div>
  );
};

export default TabBar;
