import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, X, Search, FileText, Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { getNotes, getCourses } from "@/utils/api";

interface Note {
  _id: string;
  title: string;
  course: string;
  content: string;
  topic?: string;
  createdBy?: string;
  createdAt?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
}

const StudentNotes = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [error, setError] = useState("");

  // Check if user is student
  useEffect(() => {
    if (user?.role !== "Student") {
      window.location.href = "/dashbord";
    }
  }, [user]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [coursesData, notesData] = await Promise.all([
          getCourses(),
          getNotes(),
        ]);
        setCourses(coursesData.data || []);
        setNotes(notesData.data || []);
      } catch (err) {
        setError("Failed to load content");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = !selectedCourse || note.course === selectedCourse;
    return matchSearch && matchCourse;
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Head>
        <title>Notes | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 bg-white dark:bg-gray-900 h-screen overflow-y-auto overflow-x-hidden ${
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
            <span className="font-bold text-orange-500">Notes</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            {!selectedNote ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Study Notes</h1>
                  <p className="text-gray-600 dark:text-gray-400">Read and review notes from your courses</p>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {filteredNotes.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No notes available</p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note._id}
                        onClick={() => setSelectedNote(note)}
                        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 cursor-pointer hover:shadow-lg hover:border-orange-400 transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                            <FileText className="text-orange-500" size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                              {note.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {note.course}
                            </p>
                            {note.topic && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Topic: {note.topic}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                          {note.content}
                        </p>

                        {note.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={14} />
                            <span>{formatDate(note.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="mb-6 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 font-medium"
                >
                  ← Back to Notes
                </button>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
                  <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedNote.title}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-400">
                      <span>Course: {selectedNote.course}</span>
                      {selectedNote.topic && <span>Topic: {selectedNote.topic}</span>}
                      {selectedNote.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(selectedNote.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedNote.content}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentNotes;
