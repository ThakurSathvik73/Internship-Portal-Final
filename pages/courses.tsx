import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, BookOpen, Users, Clock, X, Search, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
//new comment
type Course = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  code?: string;
  description?: string;
  instructor: string;
  students?: number;
  semester?: string;
  credits?: number;
  enrolledStudents?: string[];
  enrolledFaculty?: string[];
  duration?: string;
  progress?: number;
  status?: "enrolled" | "completed" | "available";
};

const Courses = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/courses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch courses");
        }

        setCourses(data.data || []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [
      course.name,
      course.title,
      course.code,
      course.description,
      course.instructor,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });

  const canCreateCourse = user?.role === "Admin" || user?.role === "Faculty";

  return (
    <>
      <Head>
        <title>Courses | LMS</title>
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
            <span className="font-bold text-orange-500">Courses</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Courses
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Student" && "Browse and enroll in available courses"}
                  {user?.role === "Faculty" && "Manage your courses and track student enrollment"}
                  {user?.role === "Admin" && "Manage all courses and instructors"}
                </p>
              </div>
              {canCreateCourse && (
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <Plus size={20} />
                  Create Course
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
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading courses...</p>
            )}

            {error && !loading && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && filteredCourses.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No courses found.
              </div>
            )}

            {!loading && !error && filteredCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id || course.id || course.code || course.name}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <BookOpen className="text-orange-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {course.name || course.title || "Untitled course"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.code ? `${course.code} | ${course.instructor}` : course.instructor}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Users size={16} />
                      <span>{course.enrolledStudents?.length || 0} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock size={16} />
                      <span>{course.semester || "Semester not set"}</span>
                    </div>
                    {typeof course.credits === "number" && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {course.credits} credits
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {user?.role === "Student" && (
                      <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium">
                        Enroll
                      </button>
                    )}
                    {(user?.role === "Faculty" || user?.role === "Admin") && (
                      <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;
