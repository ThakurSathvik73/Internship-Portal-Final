import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, X, Plus, Trash2, Edit2, Search, FileText, Video, Mic, BookOpen } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, createCourse, deleteCourse, deleteVideo, deleteRecording, deleteNote, getVideos, getRecordings, getNotes, createVideo, createRecording, createNote } from "@/utils/api";
import { useRouter } from "next/router";

interface ContentItem {
  _id: string;
  title: string;
  course: string;
  description?: string;
  createdBy?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  instructor: string;
}

const AdminContent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [recordings, setRecordings] = useState<ContentItem[]>([]);
  const [notes, setNotes] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Form states
  const [courseForm, setCourseForm] = useState({ name: "", code: "", description: "", instructor: "" });
  const [videoForm, setVideoForm] = useState({ title: "", description: "", course: "", videoUrl: "", duration: "", assignedTo: "" });
  const [recordingForm, setRecordingForm] = useState({ title: "", description: "", course: "", recordingUrl: "", duration: "", assignedTo: "" });
  const [noteForm, setNoteForm] = useState({ title: "", content: "", course: "", topic: "", assignedTo: "" });

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== "Superadmin" && user?.role !== "Admin") {
      window.location.href = "/dashbord";
    }
  }, [user]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [coursesData, videosData, recordingsData, notesData] = await Promise.all([
          getCourses(),
          getVideos(),
          getRecordings(),
          getNotes(),
        ]);
        setCourses(coursesData.data || []);
        setVideos(videosData.data || []);
        setRecordings(recordingsData.data || []);
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

  useEffect(() => {
    const query = router.query.q;
    setSearchTerm(typeof query === "string" ? query : "");
  }, [router.query.q]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await createCourse(courseForm);
      setCourses([...courses, result.data]);
      setCourseForm({ name: "", code: "", description: "", instructor: "" });
      setShowFormModal(false);
      setSuccess("Course created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await createVideo(videoForm);
      setVideos([...videos, result.data]);
      setVideoForm({ title: "", description: "", course: "", videoUrl: "", duration: "", assignedTo: "" });
      setShowFormModal(false);
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
      const result = await createRecording(recordingForm);
      setRecordings([...recordings, result.data]);
      setRecordingForm({ title: "", description: "", course: "", recordingUrl: "", duration: "", assignedTo: "" });
      setShowFormModal(false);
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
      const result = await createNote(noteForm);
      setNotes([...notes, result.data]);
      setNoteForm({ title: "", content: "", course: "", topic: "", assignedTo: "" });
      setShowFormModal(false);
      setSuccess("Note created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      setLoading(true);
      let deleteFunc;
      if (type === "course") deleteFunc = deleteCourse;
      else if (type === "video") deleteFunc = deleteVideo;
      else if (type === "recording") deleteFunc = deleteRecording;
      else if (type === "note") deleteFunc = deleteNote;
      else return;

      await deleteFunc(id);

      if (type === "course") {
        setCourses(courses.filter(c => c._id !== id));
      } else if (type === "video") {
        setVideos(videos.filter(v => v._id !== id));
      } else if (type === "recording") {
        setRecordings(recordings.filter(r => r._id !== id));
      } else if (type === "note") {
        setNotes(notes.filter(n => n._id !== id));
      }

      setSuccess(`${type} deleted successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const matchesSearch = (...values: Array<string | undefined>) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return values.some((value) => (value || "").toLowerCase().includes(query));
  };

  const filteredCourses = courses.filter((course) =>
    matchesSearch(course.name, course.code, course.instructor, course.description),
  );
  const filteredVideos = videos.filter((video) =>
    matchesSearch(video.title, video.course, video.description),
  );
  const filteredRecordings = recordings.filter((recording) =>
    matchesSearch(recording.title, recording.course, recording.description),
  );
  const filteredNotes = notes.filter((note) =>
    matchesSearch(note.title, note.course, note.description),
  );

  const renderCoursesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Manage Courses</h2>
        <button
          onClick={() => {
            setActiveTab("courses");
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={20} /> Create Course
        </button>
      </div>

      <div className="grid gap-4">
        {filteredCourses.map((course) => (
          <div key={course._id} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{course.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Code: {course.code}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructor: {course.instructor}</p>
                {course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{course.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(course._id, "course")}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Manage Videos</h2>
        <button
          onClick={() => {
            setActiveTab("videos");
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={20} /> Add Video
        </button>
      </div>

      <div className="grid gap-4">
        {filteredVideos.map((video) => (
          <div key={video._id} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Video size={20} className="text-orange-500" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{video.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course: {video.course}</p>
                {video.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{video.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(video._id, "video")}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecordingsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Manage Recordings</h2>
        <button
          onClick={() => {
            setActiveTab("recordings");
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={20} /> Add Recording
        </button>
      </div>

      <div className="grid gap-4">
        {filteredRecordings.map((recording) => (
          <div key={recording._id} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mic size={20} className="text-orange-500" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{recording.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course: {recording.course}</p>
                {recording.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{recording.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(recording._id, "recording")}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Manage Notes</h2>
        <button
          onClick={() => {
            setActiveTab("notes");
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus size={20} /> Add Note
        </button>
      </div>

      <div className="grid gap-4">
        {filteredNotes.map((note) => (
          <div key={note._id} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={20} className="text-orange-500" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{note.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course: {note.course}</p>
              </div>
              <button
                onClick={() => handleDelete(note._id, "note")}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Admin Content Management | LMS</title>
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
            <span className="font-bold text-orange-500">Content Management</span>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Content Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage courses, videos, recordings, and notes for your LMS</p>
            </div>

            <div className="relative mb-6">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === "courses"
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <BookOpen className="inline mr-2" size={18} />
                  Courses
                </button>
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
                {activeTab === "courses" && renderCoursesTab()}
                {activeTab === "videos" && renderVideosTab()}
                {activeTab === "recordings" && renderRecordingsTab()}
                {activeTab === "notes" && renderNotesTab()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {activeTab === "courses" ? "Create Course" : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-500 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {activeTab === "courses" && (
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Course Code"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Instructor Name"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <textarea
                    placeholder="Description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Course"}
                  </button>
                </form>
              )}

              {activeTab === "videos" && (
                <form onSubmit={handleCreateVideo} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Video Title"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={videoForm.course}
                    onChange={(e) => setVideoForm({ ...videoForm, course: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Video URL"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Duration (in minutes)"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <textarea
                    placeholder="Description"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Video"}
                  </button>
                </form>
              )}

              {activeTab === "recordings" && (
                <form onSubmit={handleCreateRecording} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recording Title"
                    value={recordingForm.title}
                    onChange={(e) => setRecordingForm({ ...recordingForm, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={recordingForm.course}
                    onChange={(e) => setRecordingForm({ ...recordingForm, course: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Recording URL"
                    value={recordingForm.recordingUrl}
                    onChange={(e) => setRecordingForm({ ...recordingForm, recordingUrl: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Duration (in minutes)"
                    value={recordingForm.duration}
                    onChange={(e) => setRecordingForm({ ...recordingForm, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <textarea
                    placeholder="Description"
                    value={recordingForm.description}
                    onChange={(e) => setRecordingForm({ ...recordingForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Recording"}
                  </button>
                </form>
              )}

              {activeTab === "notes" && (
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Note Title"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <select
                    value={noteForm.course}
                    onChange={(e) => setNoteForm({ ...noteForm, course: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Topic"
                    value={noteForm.topic}
                    onChange={(e) => setNoteForm({ ...noteForm, topic: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <textarea
                    placeholder="Content"
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={5}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Note"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminContent;
