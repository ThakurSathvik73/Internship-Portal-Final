import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Search, X } from "lucide-react";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Head from "next/head";

type AssignmentStatus = "Pending" | "Progress" | "Done";

type Assignment = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: AssignmentStatus;
  students: string[];
  submission?: { url: string; submittedAt: Date; fileName: string };
  grade?: number;
};

type Role = "Student" | "Faculty" | "Admin";

const statusStyles: Record<AssignmentStatus, string> = {
  Pending: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  Progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  Done: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200",
};

const statusDot: Record<AssignmentStatus, string> = {
  Pending: "bg-red-500",
  Progress: "bg-blue-500",
  Done: "bg-green-500",
};

const Assignments = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [newAssignment, setNewAssignment] = React.useState({
    title: "",
    course: "",
    dueDate: "",
    students: "",
  });
  const [studentInputs, setStudentInputs] = React.useState<
    Record<number, string>
  >({});
  const [gradeInputs, setGradeInputs] = React.useState<Record<number, string>>(
    {},
  );
  const [editModal, setEditModal] = React.useState<null | {
    assignmentId: number;
    title: string;
    course: string;
    dueDate: string;
    students: string;
    status: AssignmentStatus;
    grade: string;
    submissionUrl: string;
    submissionFileName: string;
    submittedAt?: string;
  }>(null);
  const [submitModal, setSubmitModal] = React.useState<{
    assignmentId: number;
    file: File | null;
  } | null>(null);
  const [reviewModal, setReviewModal] = React.useState<{
    assignmentId: number;
  } | null>(null);
  const [gradeModal, setGradeModal] = React.useState<{
    assignmentId: number;
    currentGrade?: number;
  } | null>(null);
  const [uploadingFileId, setUploadingFileId] = React.useState<number | null>(
    null,
  );

  // Load assignments from database on mount
  React.useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await fetch(`/api/assignments?role=${user?.role}&email=${user?.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setAssignments(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to load assignments:", error);
      }
    };
    loadAssignments();
  }, [user]);

  const setStatus = (id: number, status: AssignmentStatus) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    // Update in database
    fetch("/api/assignments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch((error) => console.error("Failed to update status:", error));
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      a.students.some((s) => s.toLowerCase().includes(q))
    );
  });

  const roleActions: Record<Role, string[]> = {
    Student: ["Submit work"],
    Faculty: ["Review", "Grade"],
    Admin: ["Edit", "Archive"],
  };

  const renderActions = (item: Assignment) => {
    const actions = roleActions[user?.role as Role];
    const studentInput = studentInputs[item.id] || "";

    const addStudent = () => {
      const name = studentInput.trim();
      if (!name) return;
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === item.id && !a.students.includes(name)
            ? { ...a, students: [...a.students, name] }
            : a,
        ),
      );
      // Update in database
      fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          students: [...item.students, name],
        }),
      }).catch((error) => console.error("Failed to add student:", error));
      setStudentInputs((prev) => ({ ...prev, [item.id]: "" }));
    };

    return (
      <div className="flex flex-col gap-2  ">
        <div className="flex flex-wrap gap-2  ">
          {actions.map((action) => (
            <button
              key={action}
              onClick={() => {
                if (action === "Submit work") {
                  setSubmitModal({ assignmentId: item.id, file: null });
                } else if (action === "Review") {
                  setReviewModal({ assignmentId: item.id });
                } else if (action === "Grade") {
                  setGradeInputs((prev) => ({
                    ...prev,
                    [item.id]: item.grade?.toString() || "",
                  }));
                  setGradeModal({
                    assignmentId: item.id,
                    currentGrade: item.grade,
                  });
                } else if (action === "Edit") {
                  setEditModal({
                    assignmentId: item.id,
                    title: item.title,
                    course: item.course,
                    dueDate: item.dueDate,
                    students: item.students.join(", "),
                    status: item.status,
                    grade: item.grade?.toString() || "",
                    submissionUrl: item.submission?.url || "",
                    submissionFileName: item.submission?.fileName || "",
                    submittedAt: item.submission?.submittedAt
                      ? new Date(item.submission.submittedAt).toISOString()
                      : undefined,
                  });
                } else if (action === "Archive") {
                  const confirmed = window.confirm(
                    "Archive this assignment? This will remove it for all users.",
                  );
                  if (!confirmed) return;
                  setAssignments((prev) =>
                    prev.filter((a) => a.id !== item.id),
                  );
                  fetch("/api/assignments", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: item.id }),
                  }).catch((error) =>
                    console.error("Failed to archive assignment:", error),
                  );
                }
              }}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {action}
            </button>
          ))}
          {user?.role !== "Admin" && (
            <select
              value={item.status}
              onChange={(e) =>
                setStatus(item.id, e.target.value as AssignmentStatus)
              }
              className="px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Pending">Pending</option>
              <option value="Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          )}
        </div>

        {user?.role === "Faculty" && (
          <div className="flex w-full gap-2">
            <input
              value={studentInput}
              onChange={(e) =>
                setStudentInputs((prev) => ({
                  ...prev,
                  [item.id]: e.target.value,
                }))
              }
              placeholder="Add student"
              className="flex-1 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={addStudent}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              Add
            </button>
          </div>
        )}
      </div>
    );
  };

  const createAssignment = () => {
    const title = newAssignment.title.trim();
    const course = newAssignment.course.trim();
    const due = newAssignment.dueDate.trim();
    if (!title || !course || !due) return;
    const students = newAssignment.students
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Save to database
    fetch(`/api/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        course,
        dueDate: due,
        students,
      }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Failed to create assignment");
      })
      .then((data) => {
        setAssignments((prev) => [...prev, data.data]);
        console.log("Assignment created successfully");
      })
      .catch((error) => {
        console.error("Failed to create assignment:", error);
      });

    setNewAssignment({ title: "", course: "", dueDate: "", students: "" });
  };

  const handleFileUpload = () => {
    if (!submitModal?.file) return;

    setUploadingFileId(submitModal.assignmentId);

    const reader = new FileReader();
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      setUploadingFileId(null);
      alert("Failed to read file");
    };
    reader.onload = async (e) => {
      try {
        const file = submitModal.file;
        if (!file || !e.target?.result) {
          throw new Error("No file selected or file read error");
        }
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setAssignments((prev) =>
          prev.map((a) =>
            a.id === submitModal.assignmentId
              ? {
                  ...a,
                  submission: {
                    url: data.fileUrl,
                    fileName: submitModal.file?.name || "submission",
                    submittedAt: new Date(),
                  },
                }
              : a,
          ),
        );
        // Update in database
        fetch("/api/assignments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: submitModal.assignmentId,
            submission: {
              url: data.fileUrl,
              fileName: submitModal.file?.name || "submission",
              submittedAt: new Date(),
            },
          }),
        }).catch((error) => console.error("Failed to save submission:", error));
        setStatus(submitModal.assignmentId, "Progress");
        setSubmitModal(null);
        setUploadingFileId(null);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadingFileId(null);
        const message =
          error instanceof Error ? error.message : "Upload failed";
        alert(`Failed to upload file: ${message}`);
      }
    };
    reader.readAsDataURL(submitModal.file);
  };

  return (
    <>
      <Head>
        <title>Assignments | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 bg-white dark:bg-gray-900 ${
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
            <span className="font-bold text-orange-500">Assignments</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Assignments
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between student, faculty, and admin views to see
                  available actions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search assignments"
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {filteredAssignments.length}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {
                    filteredAssignments.filter((a) => a.status === "Progress")
                      .length
                  }
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {
                    filteredAssignments.filter((a) => a.status === "Pending")
                      .length
                  }
                </p>
              </div>
            </div>

            {user?.role === "Faculty" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Create assignment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Title"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    value={newAssignment.course}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        course: e.target.value,
                      }))
                    }
                    placeholder="Course"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    value={newAssignment.students}
                    onChange={(e) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        students: e.target.value,
                      }))
                    }
                    placeholder="Students (comma separated)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={createAssignment}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Create assignment
                  </button>
                </div>
              </div>
            )}

            <div className="hidden md:block border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
              <div
                className={`grid ${
                  user?.role != "Student" ? "grid-cols-6" : "grid-cols-5"
                } text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3 bg-gray-50 dark:bg-gray-800`}
              >
                <div className=" ">Assignment</div>
                <div className=" ">Course</div>
                <div className="">Due</div>
                {(user?.role == "Faculty" || user?.role == "Admin") && (
                  <div className="">Students</div>
                )}
                <div className="">Status</div>
                <div className="  ">Actions</div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAssignments.map((item) => (
                  <div
                    key={item.id}
                    className={`grid ${
                      user?.role != "Student" ? "grid-cols-6" : "grid-cols-5"
                    } items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800`}
                  >
                    <div className="  font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {item.title}
                    </div>
                    <div className="  text-gray-600 dark:text-gray-300 truncate">
                      {item.course}
                    </div>
                    <div className="  text-gray-600 dark:text-gray-300">
                      {item.dueDate}
                    </div>
                    {(user?.role == "Faculty" || user?.role == "Admin") && (
                      <div className="  text-gray-600 dark:text-gray-300 truncate">
                        {item.students.length ? item.students.join(", ") : "—"}
                      </div>
                    )}
                    <div className="  flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[item.status]
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            statusDot[item.status]
                          }`}
                        ></span>
                        {item.status}
                      </span>
                    </div>
                    <div className=" flex justify-center ">
                      {renderActions(item)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:hidden">
              {filteredAssignments.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.course}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        statusStyles[item.status]
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusDot[item.status]
                        }`}
                      ></span>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-3">
                    <span>Due: {item.dueDate}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    Students:{" "}
                    {item.students.length ? item.students.join(", ") : "—"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderActions(item)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-96 max-h-96 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Submit Work
            </h2>
            <div className="flex-1 flex flex-col gap-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSubmitModal((prev) =>
                        prev ? { ...prev, file: e.target.files![0] } : null,
                      );
                    }
                  }}
                />
                <label
                  htmlFor="file-input"
                  className="text-center cursor-pointer"
                >
                  {submitModal.file ? (
                    <>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {submitModal.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(submitModal.file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-orange-500 mt-1">
                        Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Click to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        or drag and drop
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setSubmitModal(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={
                  !submitModal.file ||
                  uploadingFileId === submitModal.assignmentId
                }
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFileId === submitModal.assignmentId
                  ? "Uploading..."
                  : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal &&
        (() => {
          const assignment = assignments.find(
            (a) => a.id === reviewModal.assignmentId,
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-96 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Review Submission
                </h2>
                <div className="flex-1 flex flex-col gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Assignment
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {assignment?.title}
                    </p>
                  </div>
                  {assignment?.submission ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Submitted File
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        {assignment.submission.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {assignment.submission.submittedAt.toLocaleString()}
                      </p>
                      <a
                        href={`${assignment.submission.url}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                      >
                        View Submission
                      </a>
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No submission yet
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setReviewModal(null)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Grade Modal */}
      {gradeModal &&
        (() => {
          const assignment = assignments.find(
            (a) => a.id === gradeModal.assignmentId,
          );
          const gradeValue = gradeInputs[gradeModal.assignmentId] || "";

          const handleGradeSubmit = () => {
            const grade = parseFloat(gradeValue);
            if (isNaN(grade) || grade < 0 || grade > 10) {
              alert("Please enter a valid grade between 0 and 10");
              return;
            }

            setAssignments((prev) =>
              prev.map((a) =>
                a.id === gradeModal.assignmentId ? { ...a, grade } : a,
              ),
            );

            // Update in database
            fetch("/api/assignments", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: gradeModal.assignmentId,
                grade,
              }),
            })
              .then((res) => {
                if (res.ok) {
                  setGradeModal(null);
                  setGradeInputs((prev) => {
                    const updated = { ...prev };
                    delete updated[gradeModal.assignmentId];
                    return updated;
                  });
                  setStatus(gradeModal.assignmentId, "Done");
                } else {
                  throw new Error("Failed to save grade");
                }
              })
              .catch((error) => {
                console.error("Failed to save grade:", error);
                alert("Failed to save grade. Please try again.");
              });
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-96 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Grade Assignment
                </h2>
                <div className="flex-1 flex flex-col gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Assignment
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {assignment?.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                      Grade (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={gradeValue}
                      onChange={(e) =>
                        setGradeInputs((prev) => ({
                          ...prev,
                          [gradeModal.assignmentId]: e.target.value,
                        }))
                      }
                      placeholder="Enter grade"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {assignment?.grade !== undefined && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Current Grade
                      </p>
                      <p className="text-2xl font-bold text-orange-500">
                        {assignment.grade}/10
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setGradeModal(null);
                      setGradeInputs((prev) => {
                        const updated = { ...prev };
                        delete updated[gradeModal.assignmentId];
                        return updated;
                      });
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGradeSubmit}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Save Grade
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Edit Modal (Admin) */}
      {editModal &&
        (() => {
          const assignment = assignments.find(
            (a) => a.id === editModal.assignmentId,
          );

          const handleEditChange = (
            field:
              | "title"
              | "course"
              | "dueDate"
              | "students"
              | "status"
              | "grade"
              | "submissionUrl"
              | "submissionFileName"
              | "submittedAt",
            value: string,
          ) => {
            setEditModal((prev) => (prev ? { ...prev, [field]: value } : prev));
          };

          const handleEditSave = () => {
            if (!editModal) return;
            const gradeNumber = editModal.grade.trim()
              ? parseFloat(editModal.grade)
              : undefined;
            if (
              gradeNumber !== undefined &&
              (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > 10)
            ) {
              alert("Grade must be between 0 and 10");
              return;
            }

            const students = editModal.students
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            const submissionExists =
              editModal.submissionUrl.trim() ||
              editModal.submissionFileName.trim() ||
              editModal.submittedAt;

            const updatedSubmission = submissionExists
              ? {
                  url: editModal.submissionUrl.trim(),
                  fileName: editModal.submissionFileName.trim() || "submission",
                  submittedAt: editModal.submittedAt
                    ? new Date(editModal.submittedAt)
                    : assignment?.submission?.submittedAt || new Date(),
                }
              : undefined;

            const updatedAssignment = {
              ...assignment,
              title: editModal.title,
              course: editModal.course,
              dueDate: editModal.dueDate,
              status: editModal.status,
              students,
              grade: gradeNumber,
              submission: updatedSubmission,
            } as Assignment;

            setAssignments((prev) =>
              prev.map((a) =>
                a.id === editModal.assignmentId ? updatedAssignment : a,
              ),
            );

            fetch("/api/assignments", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: editModal.assignmentId,
                title: updatedAssignment.title,
                course: updatedAssignment.course,
                dueDate: updatedAssignment.dueDate,
                status: updatedAssignment.status,
                students: updatedAssignment.students,
                grade: updatedAssignment.grade,
                submission: updatedAssignment.submission,
              }),
            })
              .then((res) => {
                if (res.ok) {
                  setEditModal(null);
                } else {
                  throw new Error("Failed to save assignment changes");
                }
              })
              .catch((error) => {
                console.error("Failed to save assignment changes:", error);
                alert("Failed to save assignment changes. Please try again.");
              });
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-130 max-h-[90vh] overflow-y-auto flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Edit Assignment
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Admin can update all fields.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditModal(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Title
                    </label>
                    <input
                      value={editModal.title}
                      onChange={(e) =>
                        handleEditChange("title", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Course
                    </label>
                    <input
                      value={editModal.course}
                      onChange={(e) =>
                        handleEditChange("course", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editModal.dueDate}
                      onChange={(e) =>
                        handleEditChange("dueDate", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <select
                      value={editModal.status}
                      onChange={(e) =>
                        handleEditChange(
                          "status",
                          e.target.value as AssignmentStatus,
                        )
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Progress">Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Students (comma separated)
                    </label>
                    <input
                      value={editModal.students}
                      onChange={(e) =>
                        handleEditChange("students", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Grade (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={editModal.grade}
                      onChange={(e) =>
                        handleEditChange("grade", e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Submission URL
                    </label>
                    <input
                      value={editModal.submissionUrl}
                      onChange={(e) =>
                        handleEditChange("submissionUrl", e.target.value)
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Submission File Name
                    </label>
                    <input
                      value={editModal.submissionFileName}
                      onChange={(e) =>
                        handleEditChange("submissionFileName", e.target.value)
                      }
                      placeholder="submission.pdf"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted At (ISO)
                    </label>
                    <input
                      value={editModal.submittedAt || ""}
                      onChange={(e) =>
                        handleEditChange("submittedAt", e.target.value)
                      }
                      placeholder="2024-05-01T12:30:00.000Z"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditModal(null)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
};

export default Assignments;
