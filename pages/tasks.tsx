import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, CheckSquare, Plus, Search, X, User, Users, Calendar, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/router";

type Task = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  course: string;
  college?: string;
  createdBy: string;
  assignedTo?: string;
  assignedStudents?: string[];
  dueDate: string;
  status: "created" | "assigned" | "in-progress" | "completed";
  createdAt: string;
};

const TasksPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    course: "",
    college: "",
    assignedTo: "",
    dueDate: "",
  });
  const [assignData, setAssignData] = useState({
    facultyEmail: "",
    studentEmails: "",
  });

  useEffect(() => {
    if (user?.email && user?.role) {
      fetchTasks();
    }
  }, [user?.email, user?.role]);

  useEffect(() => {
    const query = router.query.q;
    setSearchTerm(typeof query === "string" ? query : "");
  }, [router.query.q]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?role=${user?.role}&email=${user?.email}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      
      const data = await response.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.course) {
      alert("Please fill in title and course");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newTask,
          role: user?.role || "",
          assignedTo: newTask.assignedTo || "",
          createdBy: user?.email || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to create task");
      }

      await fetchTasks();
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", course: "", college: "", assignedTo: "", dueDate: "" });
      alert("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert(error instanceof Error ? error.message : "Failed to create task");
    }
  };

  const handleAssignToFaculty = async () => {
    if (!assignData.facultyEmail) {
      alert("Please enter faculty email");
      return;
    }

    if (!showAssignModal) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: showAssignModal._id || showAssignModal.id,
          assignedTo: assignData.facultyEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign task to faculty");
      }

      await fetchTasks();
      setShowAssignModal(null);
      setAssignData({ facultyEmail: "", studentEmails: "" });
      alert("Task assigned to faculty successfully!");
    } catch (error) {
      console.error("Failed to assign task:", error);
      alert("Failed to assign task to faculty");
    }
  };

  const handleAssignToStudents = async () => {
    if (!assignData.studentEmails) {
      alert("Please enter student emails (comma-separated)");
      return;
    }

    if (!showAssignModal) return;

    const studentList = assignData.studentEmails.split(",").map((e) => e.trim());

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: showAssignModal._id || showAssignModal.id,
          assignedStudents: studentList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign task to students");
      }

      await fetchTasks();
      setShowAssignModal(null);
      setAssignData({ facultyEmail: "", studentEmails: "" });
      alert("Task assigned to students successfully!");
    } catch (error) {
      console.error("Failed to assign task:", error);
      alert("Failed to assign task to students");
    }
  };

  const handleDeleteTask = async (task: Task) => {
    const taskId = task._id || task.id;
    if (!taskId) {
      alert("Task ID is missing");
      return;
    }

    if (!confirm(`Delete "${task.title}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: taskId,
          role: user?.role || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete task" }));
        throw new Error(errorData.error || "Failed to delete task");
      }

      await fetchTasks();
      alert("Task deleted successfully!");
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert(error instanceof Error ? error.message : "Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.course || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.college || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignedTo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateTask = user?.role === "Superadmin" || user?.role === "Admin";
  const canDeleteTask = user?.role === "Superadmin" || user?.role === "Admin";
  const canAssignTask = user?.role === "Superadmin" || user?.role === "Faculty" || user?.role === "Admin";

  return (
    <>
      <Head>
        <title>Tasks | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
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
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">Tasks</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Tasks
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Superadmin" && "Create and monitor tasks across the platform"}
                  {user?.role === "Admin" && "Create tasks and assign them to faculty"}
                  {user?.role === "Faculty" && "View assigned tasks and assign them to students"}
                  {user?.role === "Student" && "View tasks assigned to you"}
                </p>
              </div>
              {canCreateTask && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Create Task
                </button>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No tasks found matching your search" : "No tasks available"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id || task.id}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckSquare className="text-orange-500" size={24} />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {task.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : task.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : task.status === "assigned"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{task.course}</span>
                          {task.college && (
                            <>
                              <span> / </span>
                              <span>{task.college}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {canDeleteTask && (
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-4 text-sm">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <User size={14} />
                            <span>Faculty: {task.assignedTo}</span>
                          </div>
                        )}
                        {task.assignedStudents && task.assignedStudents.length > 0 && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <Users size={14} />
                            <span>{task.assignedStudents.length} students</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(user?.role === "Superadmin" || user?.role === "Admin") && !task.assignedTo && (
                          <button
                            onClick={() => setShowAssignModal(task)}
                            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            Assign to Faculty
                          </button>
                        )}
                        {canAssignTask && task.assignedTo && (
                          <button
                            onClick={() => setShowAssignModal(task)}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Assign to Students
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Create New Task
                </h4>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course *
                  </label>
                  <input
                    type="text"
                    value={newTask.course}
                    onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    College
                  </label>
                  <input
                    type="text"
                    value={newTask.college}
                    onChange={(e) => setNewTask({ ...newTask, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Faculty Email
                  </label>
                  <input
                    type="email"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    placeholder="faculty@gmail.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Task Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Assign Task
                </h4>
                <button
                  onClick={() => {
                    setShowAssignModal(null);
                    setAssignData({ facultyEmail: "", studentEmails: "" });
                  }}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {showAssignModal.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {showAssignModal.course}
                  </p>
                </div>

                {(user?.role === "Superadmin" || user?.role === "Admin") && !showAssignModal.assignedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assign to Faculty (Email) *
                    </label>
                    <input
                      type="email"
                      value={assignData.facultyEmail}
                      onChange={(e) =>
                        setAssignData({ ...assignData, facultyEmail: e.target.value })
                      }
                      placeholder="faculty@gmail.com"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleAssignToFaculty}
                      className="mt-2 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Assign to Faculty
                    </button>
                  </div>
                )}

                {canAssignTask && showAssignModal.assignedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assign to Students (Comma-separated emails) *
                    </label>
                    <input
                      type="text"
                      value={assignData.studentEmails}
                      onChange={(e) =>
                        setAssignData({ ...assignData, studentEmails: e.target.value })
                      }
                      placeholder="student1@gmail.com, student2@gmail.com"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleAssignToStudents}
                      className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Assign to Students
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TasksPage;
