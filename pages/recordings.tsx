import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Video, Play, Download, Calendar, Clock, X, Search, Plus, Link as LinkIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

type Recording = {
  _id?: string;
  id?: string;
  title: string;
  course: string;
  duration: string;
  date: string;
  views: number;
  videoLink?: string;
  thumbnail?: string;
  assignedTo?: string[];
};

const Recordings = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecording, setNewRecording] = useState({
    title: "",
    videoLink: "",
    course: "",
    description: "",
  });

  useEffect(() => {
    fetchRecordings();
  }, [user]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos?role=${user?.role}&email=${user?.email}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      
      const data = await response.json();
      if (data.success && data.videos) {
        // Transform video data to recording format
        const transformedRecordings = data.videos.map((video: any, index: number) => ({
          _id: video._id || `rec-${index}`,
          id: video._id || `rec-${index}`,
          title: video.title,
          course: video.course,
          duration: "45:30", // Default duration
          date: video.createdAt ? new Date(video.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          views: 0,
          videoLink: video.videoLink,
          assignedTo: video.assignedTo || [],
        }));
        setRecordings(transformedRecordings);
      }
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecording.title || !newRecording.videoLink || !newRecording.course) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRecording,
          createdBy: user?.email || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to add recording");
      }

      await fetchRecordings();
      setShowAddModal(false);
      setNewRecording({ title: "", videoLink: "", course: "", description: "" });
      alert("Video recording added successfully!");
    } catch (error) {
      console.error("Failed to add recording:", error);
      alert(error instanceof Error ? error.message : "Failed to add recording");
    }
  };

  const handleDeleteRecording = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;

    try {
      const response = await fetch("/api/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchRecordings();
        alert("Recording deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete recording:", error);
      alert("Failed to delete recording");
    }
  };

  const filteredRecordings = recordings.filter(
    (recording) =>
      (recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.course.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !(user?.role === "Student" && recording.assignedTo?.includes("faculty"))
  );

  const canAddRecording = user?.role === "Admin" || user?.role === "Faculty";

  return (
    <>
      <Head>
        <title>Recordings | LMS</title>
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
            <span className="font-bold text-orange-500">Recordings</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Class Recordings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Student" && "Watch recorded lectures and catch up on missed classes"}
                  {user?.role === "Faculty" && "Manage and share your class recordings with students"}
                  {user?.role === "Admin" && "View and manage all class recordings"}
                </p>
              </div>
              {canAddRecording && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Add Video
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
                  placeholder="Search recordings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">Loading recordings...</div>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <Video className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No recordings found matching your search" : "No recordings available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecordings.map((recording) => (
                  <div
                    key={recording._id || recording.id}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="relative bg-gray-200 dark:bg-gray-800 h-48 flex items-center justify-center">
                      <Video className="text-gray-400" size={48} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <a
                          href={recording.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Play className="text-gray-900 ml-1" size={24} fill="currentColor" />
                        </a>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {recording.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {recording.course}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(recording.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{recording.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {recording.views} views
                        </span>
                        <div className="flex gap-2">
                          <a
                            href={recording.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
                          >
                            <LinkIcon size={16} />
                            Watch
                          </a>
                          {(user?.role === "Admin" || user?.role === "Faculty") && (
                            <button
                              onClick={() => handleDeleteRecording(recording._id || recording.id || "")}
                              className="text-sm text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Video Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Add Video Recording
                </h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddRecording} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={newRecording.title}
                    onChange={(e) => setNewRecording({ ...newRecording, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video Link (YouTube/Vimeo URL) *
                  </label>
                  <input
                    type="url"
                    value={newRecording.videoLink}
                    onChange={(e) => setNewRecording({ ...newRecording, videoLink: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
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
                    value={newRecording.course}
                    onChange={(e) => setNewRecording({ ...newRecording, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newRecording.description}
                    onChange={(e) => setNewRecording({ ...newRecording, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Add Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Recordings;
