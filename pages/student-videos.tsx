import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, X, Search, Play, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { getVideos, getRecordings, getCourses } from "@/utils/api";

interface ContentItem {
  _id: string;
  title: string;
  course: string;
  description?: string;
  duration?: number;
  createdBy?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
}

const StudentVideos = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [recordings, setRecordings] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
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
        const [coursesData, videosData, recordingsData] = await Promise.all([
          getCourses(),
          getVideos(),
          getRecordings(),
        ]);
        setCourses(coursesData.data || []);
        setVideos(videosData.data || []);
        setRecordings(recordingsData.data || []);
      } catch (err) {
        setError("Failed to load content");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const matchSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = !selectedCourse || video.course === selectedCourse;
    return matchSearch && matchCourse;
  });

  const filteredRecordings = recordings.filter((recording) => {
    const matchSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = !selectedCourse || recording.course === selectedCourse;
    return matchSearch && matchCourse;
  });

  return (
    <>
      <Head>
        <title>Videos & Recordings | LMS</title>
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
            <span className="font-bold text-orange-500">Videos & Recordings</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Videos & Recordings</h1>
              <p className="text-gray-600 dark:text-gray-400">Watch videos and recordings from your courses</p>
            </div>

            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search videos..."
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

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === "videos"
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setActiveTab("recordings")}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === "recordings"
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Recordings
                </button>
              </div>

              <div className="p-8">
                {activeTab === "videos" && (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredVideos.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                        No videos available
                      </p>
                    ) : (
                      filteredVideos.map((video) => (
                        <div
                          key={video._id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                        >
                          <div className="bg-gradient-to-br from-orange-500 to-orange-600 h-40 flex items-center justify-center">
                            <Play size={48} className="text-white" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                              {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {video.course}
                            </p>
                            {video.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {video.description}
                              </p>
                            )}
                            {video.duration && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <Clock size={14} />
                                <span>{video.duration} min</span>
                              </div>
                            )}
                            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors">
                              Watch Video
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "recordings" && (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRecordings.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                        No recordings available
                      </p>
                    ) : (
                      filteredRecordings.map((recording) => (
                        <div
                          key={recording._id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                        >
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 h-40 flex items-center justify-center">
                            <Play size={48} className="text-white" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                              {recording.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {recording.course}
                            </p>
                            {recording.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {recording.description}
                              </p>
                            )}
                            {recording.duration && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <Clock size={14} />
                                <span>{recording.duration} min</span>
                              </div>
                            )}
                            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium transition-colors">
                              Watch Recording
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentVideos;
