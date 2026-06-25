import { Bell, Check, Search, X } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ModeToggle } from "./theme/ModeToggle";

type Props = {};

const searchTargets = [
  { label: "Dashboard", path: "/dashbord", keywords: ["home", "overview"] },
  { label: "Tasks", path: "/tasks", keywords: ["task", "pending tasks", "todo"] },
  { label: "Assignments", path: "/assignments", keywords: ["assignment", "submission"] },
  { label: "Courses", path: "/courses", keywords: ["course", "class"] },
  { label: "Resources", path: "/resources", keywords: ["resource", "downloads", "files"] },
  { label: "Downloads", path: "/downloads", keywords: ["download", "file"] },
  { label: "Schedule", path: "/schedule", keywords: ["calendar", "meeting", "classes"] },
  { label: "Discussions", path: "/discussions", keywords: ["discussion", "doubt", "chat"] },
  { label: "Recordings", path: "/recordings", keywords: ["recording", "video"] },
  { label: "Notes", path: "/notes", keywords: ["note", "study material"] },
  { label: "Students", path: "/students", keywords: ["student"] },
  { label: "Users", path: "/users", keywords: ["user", "admin", "faculty"] },
  { label: "Settings", path: "/settings", keywords: ["setting", "preferences"] },
];

const TabBar = (props: Props) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: number; title: string; message: string; time: string; read: boolean }[]
  >([]);

  useEffect(() => {
    const query = router.query.q;
    setSearchQuery(typeof query === "string" ? query : "");
  }, [router.query.q]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const suggestions = normalizedSearchQuery
    ? searchTargets.filter((target) => {
        const searchableValues = [target.label, target.path, ...target.keywords];
        return searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedSearchQuery),
        );
      }).slice(0, 6)
    : [];

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

  const updateSearchQuery = (query: string, pathname = router.pathname) => {
    const nextQuery = { ...router.query };

    if (query) {
      nextQuery.q = query;
    } else {
      delete nextQuery.q;
    }

    router.push(
      {
        pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: pathname === router.pathname },
    );
  };

  const selectSuggestion = (label: string, path: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    updateSearchQuery(label, path);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    const exactMatch = searchTargets.find(
      (target) => target.label.toLowerCase() === query.toLowerCase(),
    );
    const target = exactMatch || suggestions[0];

    setShowSuggestions(false);
    updateSearchQuery(query, target?.path);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between h-16.25">
      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-72 dark:bg-gray-800"
      >
        <Search size={18} className="text-orange-500" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            window.setTimeout(() => setShowSuggestions(false), 120);
          }}
          className="flex-1 outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setShowSuggestions(false);
              updateSearchQuery("");
            }}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Clear search"
          >
            <X size={14} className="text-gray-500" />
          </button>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.path}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion.label, suggestion.path)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span>{suggestion.label}</span>
                <span className="text-xs text-gray-400">{suggestion.path}</span>
              </button>
            ))}
          </div>
        )}
      </form>

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
            <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setIsNotificationsOpen(false)}
              aria-label="Close notifications"
            />
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
            </>
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
