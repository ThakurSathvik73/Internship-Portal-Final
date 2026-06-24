import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, X, Plus, FileText, Video, Mic, BookOpen } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, createVideo, createRecording, createNote } from "@/utils/api";

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  instructor: string;
}

const FacultyContent = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [videoForm, setVideoForm] = useState({ title: "", description: "", course: "", videoUrl: "", duration: "" });
  const [recordingForm, setRecordingForm] = useState({ title: "", description: "", course: "", recordingUrl: "", duration: "" });
  const [noteForm, setNoteForm] = useState({ title: "", content: "", course: "", topic: "" });

  // Check if user is faculty
  useEffect(() => {
    if (user?.role !== "Faculty" && user?.role !== "Admin") {
      window.location.href = "/dashbord";
    }
  }, [user]);

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const result = await getCourses();
        setCourses(result.data || []);
      } catch (err) {
        setError("Failed to load courses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createVideo(videoForm);
      setVideoForm({ title: "", description: "", course: "", videoUrl: "", duration: "" });
      setSuccess("Video created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create video");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createRecording(recordingForm);
      setRecordingForm({ title: "", description: "", course: "", recordingUrl: "", duration: "" });
      setSuccess("Recording created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create recording");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createNote(noteForm);
      setNoteForm({ title: "", content: "", course: "", topic: "" });
      setSuccess("Note created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Content | LMS</title>
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
            <span className="font-bold text-orange-500">Create Content</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded-lg text-green-700 dark:text-green-200">
                {success}
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Content</h1>
              <p className="text-gray-600 dark:text-gray-400">Create and manage videos, recordings, and notes for your courses</p>
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
                  <Video className="inline mr-2" size={18} />
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
                  <Mic className="inline mr-2" size={18} />
                  Recordings
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === "notes"
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <FileText className="inline mr-2" size={18} />
                  Notes
                </button>
              </div>

              <div className="p-8">
                {activeTab === "videos" && (
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Upload Video</h2>
                    <form onSubmit={handleCreateVideo} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video Title</label>
                        <input
                          type="text"
                          placeholder="Enter video title"
                          value={videoForm.title}
                          onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                        <select
                          value={videoForm.course}
                          onChange={(e) => setVideoForm({ ...videoForm, course: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="">Select a course</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c.name}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/video.mp4"
                          value={videoForm.videoUrl}
                          onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          placeholder="45"
                          value={videoForm.duration}
                          onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                          placeholder="Describe the video content..."
                          value={videoForm.description}
                          onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                          rows={4}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
                      >
                        {loading ? "Uploading..." : "Upload Video"}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "recordings" && (
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Upload Recording</h2>
                    <form onSubmit={handleCreateRecording} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recording Title</label>
                        <input
                          type="text"
                          placeholder="Enter recording title"
                          value={recordingForm.title}
                          onChange={(e) => setRecordingForm({ ...recordingForm, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                        <select
                          value={recordingForm.course}
                          onChange={(e) => setRecordingForm({ ...recordingForm, course: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="">Select a course</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c.name}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recording URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/recording.mp4"
                          value={recordingForm.recordingUrl}
                          onChange={(e) => setRecordingForm({ ...recordingForm, recordingUrl: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          placeholder="60"
                          value={recordingForm.duration}
                          onChange={(e) => setRecordingForm({ ...recordingForm, duration: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                          placeholder="Describe the recording content..."
                          value={recordingForm.description}
                          onChange={(e) => setRecordingForm({ ...recordingForm, description: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                          rows={4}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
                      >
                        {loading ? "Uploading..." : "Upload Recording"}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "notes" && (
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create Note</h2>
                    <form onSubmit={handleCreateNote} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Title</label>
                        <input
                          type="text"
                          placeholder="Enter note title"
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                        <select
                          value={noteForm.course}
                          onChange={(e) => setNoteForm({ ...noteForm, course: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="">Select a course</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c.name}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                        <input
                          type="text"
                          placeholder="e.g., Chapter 3 - Data Structures"
                          value={noteForm.topic}
                          onChange={(e) => setNoteForm({ ...noteForm, topic: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                        <textarea
                          placeholder="Write your note content here..."
                          value={noteForm.content}
                          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                          rows={8}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
                      >
                        {loading ? "Creating..." : "Create Note"}
                      </button>
                    </form>
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

export default FacultyContent;
