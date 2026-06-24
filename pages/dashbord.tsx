import CalendarView from "@/components/Calendar";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  Circle,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Pencil,
  Pin,
  TrendingUp,
  Upload,
  Users,
  Image,
  File,
  Video,
  X,
  Plus,
  Menu,
  Shield,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

type Props = {};
interface TodoProps {
  task: string;
  date: string;
  completed: boolean;
}

const attendanceData: { subject: string; present: number; total: number; percentage: number }[] = [];

const data: { name: string; hours: number }[] = [];
interface ResourcesProps {
  name: string;
  size: string;
  desc: string;
  type: "pdf" | "image" | "fig";
  color: "red" | "green" | "blue";
}
type RecentGrade = {
  subject: string;
  grade: string;
  score: number;
  credits: number;
};

const formatGradeLabel = (score: number) => {
  if (score >= 9) return "A";
  if (score >= 8) return "B";
  if (score >= 7) return "C";
  if (score >= 6) return "D";
  return "F";
};

const dashbord = (props: Props) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [downloadProgress, setDownloadProgress] = React.useState<{
    [key: number]: number;
  }>({});
  const [showResourceModal, setShowResourceModal] = React.useState(false);
  const [resources, setResources] = React.useState<ResourcesProps[]>([]);
  const [recentGrades, setRecentGrades] = React.useState<RecentGrade[]>([]);
  const [performancePeriod, setPerformancePeriod] = React.useState("Monthly");
  const [showPerformanceMenu, setShowPerformanceMenu] = React.useState(false);
  const [showTodoModal, setShowTodoModal] = React.useState(false);
  const [newTodo, setNewTodo] = React.useState<TodoProps>({
    task: "",
    date: "",
    completed: false,
  });
  const [newResource, setNewResource] = React.useState<ResourcesProps>({
    name: "",
    size: "",
    desc: "",
    type: "pdf",
    color: "red",
  });
  const [todoList, setTodoList] = React.useState<TodoProps[]>([]);
  const assignments: {
    title: string;
    subject: string;
    dueDate: string;
    status: string;
    progress: number;
  }[] = [];
  const handleTodoChange = (
    field: keyof TodoProps,
    value: TodoProps[keyof TodoProps],
  ) => {
    setNewTodo((prev) => ({ ...prev, [field]: value }));
  };
  const handleTodoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.task.trim()) return;
    const item: TodoProps = {
      task: newTodo.task,
      date: newTodo.date || "",
      completed: false,
    };
    try {
      const response = await fetch("/api/addtodolist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json();
      }

      setTodoList((prev) => [...prev, item]);
      setShowTodoModal(false);
      setNewTodo({ task: "", date: "", completed: false });
    } catch (error) {
      console.error("Failed to submit todo item:", error);
      alert("Failed to add todo item. Please try again.");
    }
  };
  const handleTodoToggle = async (task: string) => {
    try {
      const response = await fetch("/api/updatetodolist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: task,
          completed: !todoList.find((item) => item.task === task)?.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json();
      }

      setTodoList((prev) =>
        prev.map((item) =>
          item.task === task ? { ...item, completed: !item.completed } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update todo item:", error);
    }
  };

  const handleDownload = (index: number) => {
    if (downloadProgress[index] !== undefined) {
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });
      return;
    }
    setDownloadProgress((prev) => ({ ...prev, [index]: 0 }));
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        const currentProgress = prev[index];
        if (currentProgress >= 100) {
          clearInterval(interval);
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        }
        return { ...prev, [index]: currentProgress + 10 };
      });
    }, 300);
  };
  const handleResourceChange = (
    field: keyof ResourcesProps,
    value: ResourcesProps[keyof ResourcesProps],
  ) => {
    setNewResource((prev) => ({ ...prev, [field]: value }));
  };
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name.trim()) return;
    try {
      const response = await fetch("/api/addresources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newResource),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json();
      }

      setResources((prev) => [...prev, newResource]);
      setShowResourceModal(false);
      setNewResource({ name: "", size: "", desc: "", type: "pdf", color: "red" });
    } catch (error) {
      console.error("Failed to submit resource:", error);
      alert("Failed to add resource. Please try again.");
    }
  };
  const [assignedTasks, setAssignedTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/getresources");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        const data = await response.json();
        if (data.resources) {
          setResources(data.resources);
        }
      } catch (error) {
        console.error("Failed to fetch resources:", error);
        setResources([]);
      }
    };
    fetchResources();
  }, []);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?role=${user?.role}&email=${user?.email}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        const data = await response.json();
        if (data.success && data.tasks) {
          setAssignedTasks(data.tasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setAssignedTasks([]);
      }
    };
    fetchTasks();
  }, [user]);

  React.useEffect(() => {
    const fetchRecentGrades = async () => {
      try {
        const response = await fetch(`/api/assignments?role=${user?.role || ""}&email=${user?.email || ""}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const gradedAssignments = Array.isArray(data.data)
          ? data.data
              .filter((assignment: any) => typeof assignment.grade === "number")
              .slice(0, 5)
              .map((assignment: any) => {
                const score = Number(assignment.grade);
                return {
                  subject: assignment.course || assignment.title || "Assignment",
                  grade: formatGradeLabel(score),
                  score,
                  credits: 0,
                };
              })
          : [];

        setRecentGrades(gradedAssignments);
      } catch (error) {
        console.error("Failed to fetch recent grades:", error);
        setRecentGrades([]);
      }
    };

    fetchRecentGrades();
  }, [user?.email, user?.role]);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    React.useState<any>(null);
  const [announcements, setAnnouncements] = React.useState<{
    title: string;
    description: string;
    time: string;
    important: boolean;
  }[]>([]);
  const upcomingClasses: {
    subject: string;
    time: string;
    room: string;
    type: string;
    professor: string;
    link: string;
    status: string;
  }[] = [];
  const todos: TodoProps[] = [];
  const quickActions = [
    {
      icon: Upload,
      label: "Submit Assignment",
      color: "blue",
      link: "/assignments",
    },
    { icon: Video, label: "Join Class", color: "green", link: "/schedule" },
    {
      icon: BookOpen,
      label: "Study Materials",
      color: "purple",
      link: "/resources",
    },
    {
      icon: MessageSquare,
      label: "Ask Doubt",
      color: "orange",
      link: "/discussions",
    },
    {
      icon: Calendar,
      label: "View Schedule",
      color: "pink",
      link: "/schedule",
    },
    {
      icon: Users,
      label: "Study Groups",
      color: "indigo",
      link: "/discussions",
    },
  ];
  const handleAnnouncementClick = (announcement: any) => {
    setSelectedAnnouncement(announcement);
  };
  React.useEffect(() => {
    if (!user?.email || !user?.role) return;

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`/api/announcements?role=${user.role}&email=${user.email}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setAnnouncements(
            (data.data || []).map((announcement: any) => ({
              title: announcement.title,
              description: announcement.description,
              time: announcement.createdAt
                ? new Date(announcement.createdAt).toLocaleString()
                : "",
              important: Boolean(announcement.important),
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setAnnouncements([]);
      }
    };

    fetchAnnouncements();
  }, [user?.email, user?.role]);
  const totalPercentage = attendanceData.length
    ? Math.round(
        attendanceData.reduce((acc, item) => acc + item.percentage, 0) /
          attendanceData.length,
      )
    : 0;

  return (
    <>
      <Head>
        <title>Dashboard | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Sidebar */}
        <div
  className={`fixed inset-y-0 left-0 z-50 
  transform transition-transform duration-300 
  lg:relative lg:translate-x-0 
  bg-white dark:bg-gray-900
  h-screen overflow-y-auto overflow-x-hidden
  ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <Sidebar />


          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
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
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">Dashboard</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="space-y-6">
              {/* Greeting */}
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl text-gray-900 dark:text-gray-100 font-bold">
                    Hello {user?.name || "User"} 👋
                  </h1>
                  {user?.role && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30">
                      {user.role === "Admin" && <Shield className="w-3 h-3" />}
                      {user.role === "Faculty" && <UserCheck className="w-3 h-3" />}
                      {user.role === "Student" && <GraduationCap className="w-3 h-3" />}
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.role === "Admin" && "Manage your learning management system"}
                  {user?.role === "Faculty" && "Manage your courses and students"}
                  {user?.role === "Student" && "Let's learn something new today!"}
                </p>
              </div>

              {/* Quick Actions - Full Width */}
              <div className="animate-in fade-in duration-500">
                <div className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-sm mb-4 font-semibold text-gray-900 dark:text-gray-100">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (action.link) {
                            window.open(action.link);
                          }
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 active:scale-95 bg-orange-500/10   hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200`}
                      >
                        <action.icon size={24} color={action.color} />
                        <span className="text-xs font-medium text-center">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Classes & Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 animate-in fade-in duration-700">
                <div className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-sm mb-4 font-semibold text-gray-900 dark:text-gray-100">
                    Upcoming Classes
                  </h3>
                  <div className="space-y-3">
                    {upcomingClasses.length > 0 ? upcomingClasses.map((classItem, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          if (classItem.link) {
                            window.open(classItem.link, "_blank");
                          }
                        }}
                        className="p-3 rounded-lg transition-all duration-200 cursor-pointer group active:scale-95 relative overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {classItem.status === "live" && (
                          <div className="absolute top-2 right-2">
                            <span className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                              Live
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              classItem.type === "online" ? "" : ""
                            }`}
                          >
                            {classItem.type === "online" ? (
                              <Video
                                size={20}
                                className={
                                  classItem.type === "online"
                                    ? "text-purple-500"
                                    : "text-blue-600"
                                }
                              />
                            ) : (
                              <MapPin size={20} className="text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium mb-1 transition-colors truncate text-gray-900 dark:text-gray-100 group-hover:text-orange-500">
                              {classItem.subject}
                            </h4>
                            <div className="flex items-center gap-2 text-xs mb-1">
                              <Clock
                                size={12}
                                className="text-gray-500 dark:text-gray-400"
                              />
                              <span className="text-gray-600 dark:text-gray-300">
                                {classItem.time}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {classItem.room} • {classItem.professor}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No upcoming classes available.
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-sm mb-4 font-semibold text-gray-900 dark:text-gray-100">
                    Announcements
                  </h3>
                  <div className="space-y-3">
                    {announcements.length > 0 ? announcements.map((announcement, index) => (
                      <div
                        key={index}
                        onClick={() => handleAnnouncementClick?.(announcement)}
                        className="p-3 rounded-lg transition-all duration-200 cursor-pointer group active:scale-95 relative hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {announcement.important && (
                          <div className="absolute top-3 right-3">
                            <Pin size={14} className="text-orange-600" />
                          </div>
                        )}
                        <div className="flex items-start gap-3 pr-6">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              announcement.important
                                ? "dark:bg-blue-900/30 bg-blue-50"
                                : "dark:bg-gray-700 bg-gray-100"
                            }`}
                          >
                            <Bell
                              size={16}
                              className={
                                announcement.important
                                  ? "text-blue-600"
                                  : "dark:text-gray-400 text-gray-500"
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm font-medium mb-1 transition-colors dark:text-white dark:group-hover:text-blue-400 text-gray-900 group-hover:text-orange-600 `}
                            >
                              {announcement.title}
                            </h4>
                            <p
                              className={`text-xs mb-1 dark:text-gray-400 text-gray-600  `}
                            >
                              {announcement.description}
                            </p>
                            <p
                              className={`text-xs dark:text-gray-500 text-gray-500  `}
                            >
                              {announcement.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No announcements available.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attendance & Grades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 animate-in fade-in duration-800">
                <div
                  onClick={() => {}}
                  className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Attendance
                    </h3>
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        totalPercentage >= 85
                          ? "text-green-500"
                          : totalPercentage >= 75
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    >
                      <TrendingUp size={14} />
                      {totalPercentage}%
                    </div>
                  </div>

                  <div className="space-y-4">
                    {attendanceData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {item.subject}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              item.percentage >= 85
                                ? "text-green-500"
                                : item.percentage >= 75
                                  ? "text-yellow-500"
                                  : "text-red-500"
                            }`}
                          >
                            {item.present}/{item.total}
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2 overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              item.percentage >= 85
                                ? "bg-green-500"
                                : item.percentage >= 75
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        Overall Attendance
                      </span>
                      <span
                        className={`font-semibold ${
                          totalPercentage >= 85
                            ? "text-green-500"
                            : totalPercentage >= 75
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {totalPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => {}}
                  className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Recent Grades
                    </h3>
                    <Award size={16} className="text-yellow-500" />
                  </div>

                  <div className="space-y-3">
                    {recentGrades.length > 0 ? (
                      recentGrades.map((grade, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer group active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium mb-1 transition-colors truncate text-gray-900 dark:text-gray-100">
                              {grade.subject}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              Score: {grade.score}/10
                            </p>
                          </div>
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-lg font-semibold shrink-0 ${
                              grade.grade.startsWith("A")
                                ? "dark:bg-green-900/30 dark:text-green-400 bg-green-50 text-green-600"
                                : "dark:bg-blue-900/30 dark:text-blue-400 bg-blue-50 text-blue-600"
                            }`}
                          >
                            {grade.grade}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <Award className="mx-auto mb-3 text-gray-400" size={28} />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No recent grades available.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course & Resources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 animate-in fade-in duration-900">
                <div
                  onClick={() => {}}
                  className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                >
                  <h3 className="text-sm mb-4 font-semibold text-gray-900 dark:text-gray-100">
                    Recent enrolled course
                  </h3>
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-3 text-gray-400" size={28} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No enrolled courses available.
                    </p>
                  </div>
                </div>
                {/* Your Resources */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Your Resources
                    </h3>
                    <button
                      type="button"
                      aria-label="Add resource"
                      onClick={() => setShowResourceModal(true)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resources.map((resource, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                resource.type === "pdf"
                                  ? "bg-red-50 dark:bg-red-950"
                                  : resource.type === "image"
                                    ? "bg-green-50 dark:bg-green-950"
                                    : "bg-blue-50 dark:bg-blue-950"
                              }`}
                            >
                              {resource.type === "pdf" && (
                                <svg
                                  width="21"
                                  height="28"
                                  viewBox="0 0 21 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.43108 0H12.5114C12.9664 9.71638e-05 13.4027 0.180905 13.7243 0.502653L20.0838 6.86216C20.4056 7.18382 20.5864 7.6201 20.5865 8.07505V24.0176C20.5865 24.9276 20.225 25.8003 19.5815 26.4437C18.9381 27.0872 18.0654 27.4487 17.1554 27.4487H3.43108C2.5211 27.4487 1.64839 27.0872 1.00494 26.4437C0.361488 25.8003 0 24.9276 0 24.0176V3.43108C0 2.5211 0.361488 1.64839 1.00494 1.00494C1.64839 0.361488 2.5211 0 3.43108 0V0ZM12.8666 2.57331V6.00439C12.8666 6.45938 13.0473 6.89574 13.369 7.21746C13.6908 7.53919 14.1271 7.71993 14.5821 7.71993H18.0132L12.8666 2.57331Z"
                                    fill="#F1351B"
                                  />
                                  <path
                                    d="M4.84801 17.937C4.69361 17.937 4.56666 17.8924 4.46716 17.8032C4.37109 17.7106 4.32305 17.5973 4.32305 17.4635C4.32305 17.3263 4.37109 17.2113 4.46716 17.1187C4.56666 17.0261 4.69361 16.9797 4.84801 16.9797C4.99898 16.9797 5.12249 17.0261 5.21856 17.1187C5.31807 17.2113 5.36782 17.3263 5.36782 17.4635C5.36782 17.5973 5.31807 17.7106 5.21856 17.8032C5.12249 17.8924 4.99898 17.937 4.84801 17.937ZM8.89957 15.4461C8.89957 15.6553 8.85153 15.8475 8.75546 16.0225C8.65939 16.194 8.51185 16.333 8.31285 16.4393C8.11385 16.5457 7.86681 16.5989 7.57174 16.5989H7.0262V17.8958H6.14612V14.2829H7.57174C7.85995 14.2829 8.10356 14.3327 8.30256 14.4322C8.50156 14.5317 8.65081 14.6689 8.75031 14.8439C8.84982 15.0189 8.89957 15.2196 8.89957 15.4461ZM7.50483 15.899C7.67295 15.899 7.79819 15.8595 7.88054 15.7806C7.96288 15.7017 8.00405 15.5902 8.00405 15.4461C8.00405 15.3019 7.96288 15.1904 7.88054 15.1115C7.79819 15.0326 7.67295 14.9931 7.50483 14.9931H7.0262V15.899H7.50483ZM10.9686 14.2829C11.3495 14.2829 11.6823 14.3584 11.9671 14.5094C12.2519 14.6603 12.4714 14.8731 12.6258 15.1475C12.7837 15.4186 12.8626 15.7325 12.8626 16.0894C12.8626 16.4428 12.7837 16.7567 12.6258 17.0312C12.4714 17.3057 12.2501 17.5184 11.9619 17.6694C11.6771 17.8204 11.346 17.8958 10.9686 17.8958H9.61507V14.2829H10.9686ZM10.912 17.1341C11.2448 17.1341 11.5039 17.0432 11.6892 16.8614C11.8744 16.6795 11.9671 16.4222 11.9671 16.0894C11.9671 15.7566 11.8744 15.4975 11.6892 15.3122C11.5039 15.127 11.2448 15.0343 10.912 15.0343H10.4951V17.1341H10.912ZM15.9637 14.2829V14.988H14.4918V15.7497H15.5932V16.4342H14.4918V17.8958H13.6117V14.2829H15.9637Z"
                                    fill="white"
                                  />
                                </svg>
                              )}
                              {resource.type === "image" && (
                                <svg
                                  width="21"
                                  height="28"
                                  viewBox="0 0 21 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.43108 0H12.5114C12.9664 9.71638e-05 13.4027 0.180905 13.7243 0.502653L20.0838 6.86216C20.4056 7.18382 20.5864 7.6201 20.5865 8.07505V24.0176C20.5865 24.9276 20.225 25.8003 19.5815 26.4437C18.9381 27.0872 18.0654 27.4487 17.1554 27.4487H3.43108C2.5211 27.4487 1.64839 27.0872 1.00494 26.4437C0.361488 25.8003 0 24.9276 0 24.0176V3.43108C0 2.5211 0.361488 1.64839 1.00494 1.00494C1.64839 0.361488 2.5211 0 3.43108 0V0ZM12.8666 2.57331V6.00439C12.8666 6.45938 13.0473 6.89574 13.369 7.21746C13.6908 7.53919 14.1271 7.71993 14.5821 7.71993H18.0132L12.8666 2.57331Z"
                                    fill="#27AE60"
                                  />
                                  <path
                                    d="M4.3629 17.0837C4.2085 17.0837 4.08155 17.0391 3.98205 16.9499C3.88598 16.8573 3.83795 16.744 3.83795 16.6102C3.83795 16.473 3.88598 16.358 3.98205 16.2654C4.08155 16.1728 4.2085 16.1264 4.3629 16.1264C4.51387 16.1264 4.63739 16.1728 4.73346 16.2654C4.83296 16.358 4.88271 16.473 4.88271 16.6102C4.88271 16.744 4.83296 16.8573 4.73346 16.9499C4.63739 17.0391 4.51387 17.0837 4.3629 17.0837ZM6.54109 14.5773C6.62687 14.4435 6.74524 14.3354 6.89621 14.2531C7.04717 14.1707 7.22387 14.1296 7.42631 14.1296C7.66305 14.1296 7.87749 14.1896 8.06964 14.3097C8.26178 14.4298 8.41274 14.6013 8.52254 14.8243C8.63576 15.0474 8.69238 15.3064 8.69238 15.6015C8.69238 15.8966 8.63576 16.1573 8.52254 16.3838C8.41274 16.6068 8.26178 16.7801 8.06964 16.9036C7.87749 17.0237 7.66305 17.0837 7.42631 17.0837C7.2273 17.0837 7.0506 17.0425 6.89621 16.9602C6.74524 16.8778 6.62687 16.7715 6.54109 16.6411V18.4115H5.66102V14.1707H6.54109V14.5773ZM7.79686 15.6015C7.79686 15.3819 7.7351 15.2103 7.61159 15.0868C7.4915 14.9599 7.34225 14.8964 7.16383 14.8964C6.98884 14.8964 6.83959 14.9599 6.71607 15.0868C6.59599 15.2138 6.53594 15.387 6.53594 15.6066C6.53594 15.8262 6.59599 15.9995 6.71607 16.1264C6.83959 16.2534 6.98884 16.3169 7.16383 16.3169C7.33881 16.3169 7.48807 16.2534 7.61159 16.1264C7.7351 15.9961 7.79686 15.8211 7.79686 15.6015ZM11.1613 14.1398C11.4975 14.1398 11.7651 14.2496 11.9641 14.4692C12.1666 14.6854 12.2678 14.9839 12.2678 15.3647V17.0425H11.3929V15.4831C11.3929 15.291 11.3431 15.1417 11.2436 15.0354C11.1441 14.929 11.0103 14.8758 10.8422 14.8758C10.6741 14.8758 10.5402 14.929 10.4407 15.0354C10.3412 15.1417 10.2915 15.291 10.2915 15.4831V17.0425H9.41142V14.1707H10.2915V14.5516C10.3807 14.4246 10.5008 14.3251 10.6518 14.2531C10.8027 14.1776 10.9726 14.1398 11.1613 14.1398ZM14.2278 14.1296C14.4302 14.1296 14.6069 14.1707 14.7579 14.2531C14.9123 14.3354 15.0306 14.4435 15.113 14.5773V14.1707H15.9931V17.0374C15.9931 17.3016 15.9399 17.54 15.8335 17.7528C15.7306 17.9689 15.571 18.1405 15.3549 18.2674C15.1422 18.3944 14.8762 18.4579 14.5572 18.4579C14.1317 18.4579 13.7869 18.3566 13.5227 18.1542C13.2585 17.9552 13.1075 17.6842 13.0698 17.341H13.9396C13.967 17.4508 14.0322 17.5366 14.1351 17.5984C14.2381 17.6636 14.365 17.6962 14.516 17.6962C14.6978 17.6962 14.8419 17.643 14.9483 17.5366C15.0581 17.4337 15.113 17.2673 15.113 17.0374V16.6308C15.0272 16.7646 14.9088 16.8744 14.7579 16.9602C14.6069 17.0425 14.4302 17.0837 14.2278 17.0837C13.991 17.0837 13.7766 17.0237 13.5844 16.9036C13.3923 16.7801 13.2396 16.6068 13.1264 16.3838C13.0166 16.1573 12.9617 15.8966 12.9617 15.6015C12.9617 15.3064 13.0166 15.0474 13.1264 14.8243C13.2396 14.6013 13.3923 14.4298 13.5844 14.3097C13.7766 14.1896 13.991 14.1296 14.2278 14.1296ZM15.113 15.6066C15.113 15.387 15.0512 15.2138 14.9277 15.0868C14.8076 14.9599 14.6601 14.8964 14.4851 14.8964C14.3101 14.8964 14.1609 14.9599 14.0373 15.0868C13.9173 15.2103 13.8572 15.3819 13.8572 15.6015C13.8572 15.8211 13.9173 15.9961 14.0373 16.1264C14.1609 16.2534 14.3101 16.3169 14.4851 16.3169C14.6601 16.3169 14.8076 16.2534 14.9277 16.1264C15.0512 15.9995 15.113 15.8262 15.113 15.6066Z"
                                    fill="white"
                                  />
                                </svg>
                              )}
                              {resource.type === "fig" && (
                                <svg
                                  width="21"
                                  height="28"
                                  viewBox="0 0 21 28"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.43108 0H12.5114C12.9664 9.71638e-05 13.4027 0.180905 13.7243 0.502653L20.0838 6.86216C20.4056 7.18382 20.5864 7.6201 20.5865 8.07505V24.0176C20.5865 24.9276 20.225 25.8003 19.5815 26.4437C18.9381 27.0872 18.0654 27.4487 17.1554 27.4487H3.43108C2.5211 27.4487 1.64839 27.0872 1.00494 26.4437C0.361488 25.8003 0 24.9276 0 24.0176V3.43108C0 2.5211 0.361488 1.64839 1.00494 1.00494C1.64839 0.361488 2.5211 0 3.43108 0V0ZM12.8666 2.57331V6.00439C12.8666 6.45938 13.0473 6.89574 13.369 7.21746C13.6908 7.53919 14.1271 7.71993 14.5821 7.71993H18.0132L12.8666 2.57331Z"
                                    fill="#1294F2"
                                  />
                                  <path
                                    d="M6.02403 17.937C5.86963 17.937 5.74268 17.8924 5.64318 17.8032C5.54711 17.7106 5.49908 17.5974 5.49908 17.4636C5.49908 17.3263 5.54711 17.2114 5.64318 17.1187C5.74268 17.0261 5.86963 16.9798 6.02403 16.9798C6.175 16.9798 6.29852 17.0261 6.39459 17.1187C6.49409 17.2114 6.54384 17.3263 6.54384 17.4636C6.54384 17.5974 6.49409 17.7106 6.39459 17.8032C6.29852 17.8924 6.175 17.937 6.02403 17.937ZM8.7632 15.7549H8.28971V17.8959H7.40964V15.7549H7.09055V15.0241H7.40964V14.9417C7.40964 14.5883 7.51086 14.3207 7.71329 14.1388C7.91573 13.9536 8.21251 13.8609 8.60366 13.8609C8.66885 13.8609 8.71688 13.8626 8.74776 13.8661V14.6123C8.57964 14.602 8.46127 14.6261 8.39265 14.6844C8.32402 14.7427 8.28971 14.8474 8.28971 14.9983V15.0241H8.7632V15.7549ZM9.87668 14.7256C9.72228 14.7256 9.59533 14.6809 9.49583 14.5917C9.39976 14.4991 9.35173 14.3859 9.35173 14.2521C9.35173 14.1148 9.39976 14.0016 9.49583 13.9124C9.59533 13.8197 9.72228 13.7734 9.87668 13.7734C10.0277 13.7734 10.1512 13.8197 10.2472 13.9124C10.3467 14.0016 10.3965 14.1148 10.3965 14.2521C10.3965 14.3859 10.3467 14.4991 10.2472 14.5917C10.1512 14.6809 10.0277 14.7256 9.87668 14.7256ZM10.3141 15.0241V17.8959H9.43407V15.0241H10.3141ZM12.3003 14.9829C12.5028 14.9829 12.6795 15.0241 12.8304 15.1064C12.9848 15.1888 13.1032 15.2968 13.1856 15.4306V15.0241H14.0656V17.8907C14.0656 18.1549 14.0125 18.3934 13.9061 18.6061C13.8032 18.8223 13.6436 18.9938 13.4275 19.1208C13.2147 19.2477 12.9488 19.3112 12.6297 19.3112C12.2043 19.3112 11.8594 19.21 11.5953 19.0075C11.3311 18.8085 11.1801 18.5375 11.1423 18.1944H12.0121C12.0396 18.3042 12.1048 18.3899 12.2077 18.4517C12.3106 18.5169 12.4376 18.5495 12.5886 18.5495C12.7704 18.5495 12.9145 18.4963 13.0209 18.3899C13.1307 18.287 13.1856 18.1206 13.1856 17.8907V17.4841C13.0998 17.618 12.9814 17.7278 12.8304 17.8135C12.6795 17.8959 12.5028 17.937 12.3003 17.937C12.0636 17.937 11.8492 17.877 11.657 17.7569C11.4649 17.6334 11.3122 17.4601 11.199 17.2371C11.0892 17.0107 11.0343 16.7499 11.0343 16.4548C11.0343 16.1597 11.0892 15.9007 11.199 15.6777C11.3122 15.4547 11.4649 15.2831 11.657 15.163C11.8492 15.0429 12.0636 14.9829 12.3003 14.9829ZM13.1856 16.46C13.1856 16.2404 13.1238 16.0671 13.0003 15.9402C12.8802 15.8132 12.7327 15.7497 12.5577 15.7497C12.3827 15.7497 12.2334 15.8132 12.1099 15.9402C11.9898 16.0637 11.9298 16.2352 11.9298 16.4548C11.9298 16.6744 11.9898 16.8494 12.1099 16.9798C12.2334 17.1067 12.3827 17.1702 12.5577 17.1702C12.7327 17.1702 12.8802 17.1067 13.0003 16.9798C13.1238 16.8528 13.1856 16.6796 13.1856 16.46Z"
                                    fill="white"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="truncate">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {resource.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {resource.size} MB
                                </p>
                                {downloadProgress[idx] === undefined && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {resource.desc}
                                  </p>
                                )}
                              </div>
                              {downloadProgress[idx] !== undefined && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-orange-500 h-full rounded-full transition-all duration-300 ease-out"
                                    style={{
                                      width: `${downloadProgress[idx]}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(idx)}
                            className="text-xs font-semibold text-orange-500 hover:text-orange-600 ml-2 shrink-0"
                          >
                            {downloadProgress[idx] !== undefined
                              ? `${downloadProgress[idx]}%`
                              : "Download"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignments & Todo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 animate-in fade-in duration-1000">
                <div className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Pending Assignments
                    </h3>
                    {(assignedTasks.length > 0 ? assignedTasks : assignments).length > 6 && (
                      <button
                        onClick={() => router.push("/tasks")}
                        className="text-xs font-medium transition-colors text-orange-500 hover:text-orange-600"
                      >
                        View More
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(assignedTasks.length > 0 ? assignedTasks : assignments).slice(0, 6).map((assignment, index) => (
                      <div
                        key={index}
                        onClick={() => {}}
                        className="p-3 rounded-lg transition-all duration-200 cursor-pointer group active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium mb-1 transition-colors text-gray-900 dark:text-gray-100">
                              {assignment.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {assignment.subject || assignment.course}
                            </p>
                          </div>
                          {(assignment.status === "urgent" || assignment.status === "created") && (
                            <AlertCircle
                              size={16}
                              className="text-red-500 shrink-0"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <Clock
                            size={12}
                            className={"dark:text-gray-500 text-gray-400"}
                          />
                          <span
                            className={`${
                              assignment.status === "urgent" || assignment.status === "created"
                                ? "text-red-500 font-medium"
                                : "dark:text-gray-400 text-gray-600"
                            }`}
                          >
                            {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No due date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full h-1.5 overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${assignment.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {assignment.progress || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* To Do List */}
                <div className="md:col-span-2 lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between w-full">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      To do List
                    </h3>
                    <button
                      type="button"
                      aria-label="Add todo"
                      onClick={() => setShowTodoModal(true)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {todoList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <label className="mt-1 shrink-0 inline-flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleTodoToggle(item.task)}
                            className="peer sr-only"
                          />
                          <span
                            className="h-5 w-5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm transition-all duration-200 peer-checked:bg-linear-to-br peer-checked:from-orange-500 peer-checked:to-amber-500 peer-checked:border-orange-500 peer-focus:ring-2 peer-focus:ring-orange-200 dark:peer-focus:ring-orange-800"
                            aria-hidden="true"
                          >
                            <svg
                              className="w-3 h-3 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 10.5L8.5 14L15 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </label>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              item.completed
                                ? "text-gray-400 dark:text-gray-500 line-through"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {item.task}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {item.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calendar, Hours & Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in duration-1000">
                <CalendarView />
                <div className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg group">
                  <h3 className="text-sm mb-6 font-semibold text-gray-900 dark:text-gray-100">
                    Hours Spent
                  </h3>
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={data}>
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        />
                        <Bar
                          dataKey="hours"
                          fill="#F97316"
                          radius={[4, 4, 0, 0]}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[120px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      No hours data available.
                    </div>
                  )}
                </div>
                <div className="rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Performance
                    </h3>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPerformanceMenu((current) => !current)}
                        className="flex items-center gap-1 text-sm px-2 py-1 rounded transition-all duration-200 active:scale-95 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        aria-haspopup="menu"
                        aria-expanded={showPerformanceMenu}
                      >
                        {performancePeriod} <ChevronDown size={14} />
                      </button>
                      {showPerformanceMenu && (
                        <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
                          {["Weekly", "Monthly", "Yearly"].map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => {
                                setPerformancePeriod(period);
                                setShowPerformanceMenu(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                performancePeriod === period
                                  ? "text-orange-500 font-semibold"
                                  : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-[120px] flex flex-col items-center justify-center text-center">
                    <Award className="mb-3 text-gray-400" size={28} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No performance data available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Announcement Modal */}
              {selectedAnnouncement && (
                <div
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedAnnouncement(null)}
                >
                  <div
                    className="max-w-lg w-full rounded-xl shadow-2xl bg-white dark:bg-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              selectedAnnouncement.important
                                ? "dark:bg-orange-900/30 bg-orange-50"
                                : "dark:bg-gray-700 bg-gray-100"
                            }`}
                          >
                            <Bell
                              size={20}
                              className={
                                selectedAnnouncement.important
                                  ? "text-orange-500"
                                  : "dark:text-gray-400 text-gray-500"
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {selectedAnnouncement.title}
                              </h2>
                              {selectedAnnouncement.important && (
                                <Pin size={16} className="text-orange-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedAnnouncement.time}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedAnnouncement(null)}
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <X
                            size={20}
                            className="text-gray-500 dark:text-gray-400"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {selectedAnnouncement.description}
                      </p>

                      <div className="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/30">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          💡 This announcement has been marked as{" "}
                          {selectedAnnouncement.important
                            ? "important"
                            : "regular"}
                          .
                          {selectedAnnouncement.important &&
                            " Please take note of the details."}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedAnnouncement(null)}
                        className="w-full mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 active:scale-95"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showTodoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Add To-Do
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowTodoModal(false)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close add todo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleTodoSubmit} className="p-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Task
                        </label>
                        <input
                          value={newTodo.task}
                          onChange={(e) =>
                            handleTodoChange("task", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter task"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Date
                        </label>
                        <input
                          type="date"
                          value={newTodo.date}
                          onChange={(e) =>
                            handleTodoChange("date", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowTodoModal(false)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {showResourceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Add Resource
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowResourceModal(false)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close add resource"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleResourceSubmit}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Add file
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleResourceChange("name", file.name);
                              handleResourceChange(
                                "size",
                                (file.size / (1024 * 1024)).toFixed(2) + " Mb",
                              );
                            }
                          }}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          File Name
                        </label>
                        <input
                          value={newResource.name}
                          onChange={(e) =>
                            handleResourceChange("name", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="File name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Size
                          </label>
                          <input
                            value={newResource.size}
                            onChange={(e) =>
                              handleResourceChange("size", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g. 2.5 Mb"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Type
                          </label>
                          <select
                            value={newResource.type}
                            onChange={(e) =>
                              handleResourceChange(
                                "type",
                                e.target.value as ResourcesProps["type"],
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="pdf">PDF</option>
                            <option value="image">Image</option>
                            <option value="fig">Doc</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Color
                        </label>
                        <select
                          value={newResource.color}
                          onChange={(e) =>
                            handleResourceChange(
                              "color",
                              e.target.value as ResourcesProps["color"],
                            )
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="red">Red</option>
                          <option value="green">Green</option>
                          <option value="blue">Blue</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Description
                        </label>
                        <textarea
                          value={newResource.desc}
                          onChange={(e) =>
                            handleResourceChange("desc", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows={3}
                          placeholder="Optional description"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowResourceModal(false)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dashbord;
