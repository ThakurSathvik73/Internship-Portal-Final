import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Users, Search, GraduationCap, Mail, Award, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  college: string;
  gpa: number | string;
  assignmentsCompleted: number;
  assignmentsTotal: number;
};

const StudentsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "Faculty") return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/students?faculty=${encodeURIComponent(user.email)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch students");
        }

        setStudents(data.students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user?.email, user?.role]);

  useEffect(() => {
    const query = router.query.q;
    setSearchTerm(typeof query === "string" ? query : "");
  }, [router.query.q]);

  // Only Faculty can access this page
  if (user?.role !== "Faculty") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only faculty members can access this page.
          </p>
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Students | LMS</title>
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
            <span className="font-bold text-orange-500">Students</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Students
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage your students' progress and performance
              </p>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                  No students found.
                </div>
              ) : filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <GraduationCap className="text-blue-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail size={12} />
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Course</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.course}
                      </p>
                    </div>
                    {student.college && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">College</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {student.college}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GPA</p>
                        <div className="flex items-center gap-1">
                          <Award className="text-yellow-500" size={16} />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {student.gpa}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Assignments
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {student.assignmentsCompleted}/{student.assignmentsTotal}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{
                          width: student.assignmentsTotal
                            ? `${(student.assignmentsCompleted / student.assignmentsTotal) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentsPage;
