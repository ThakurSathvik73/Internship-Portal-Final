import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, MessageSquare, Plus, Search, X, User, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

type Discussion = {
  id: string;
  title: string;
  author: string;
  course: string;
  replies: number;
  lastActivity: string;
};

const Discussions = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    course: "",
    content: "",
  });

  useEffect(() => {
    const query = router.query.q;
    setSearchTerm(typeof query === "string" ? query : "");
  }, [router.query.q]);

  const mapDiscussion = (item: any): Discussion => ({
    id: item._id,
    title: item.title,
    author: item.createdBy || "Unknown",
    course: item.course,
    replies: Array.isArray(item.replies) ? item.replies.length : 0,
    lastActivity: new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleString(),
  });

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/content/discussions");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch discussions");
        }

        setDiscussions((data.data || []).map(mapDiscussion));
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch discussions");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussion.title || !newDiscussion.course || !newDiscussion.content) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/content/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user?.role || "Student",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({
          title: newDiscussion.title,
          content: newDiscussion.content,
          course: newDiscussion.course,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussions([
          {
            id: data.data._id,
            title: data.data.title,
            author: user?.name || "Anonymous",
            course: data.data.course,
            replies: 0,
            lastActivity: "just now",
          },
          ...discussions,
        ]);
        setShowNewDiscussionModal(false);
        setNewDiscussion({ title: "", course: "", content: "" });
        alert("Discussion created successfully!");
      } else {
        alert("Failed to create discussion");
      }
    } catch (error) {
      console.error("Error creating discussion:", error);
      alert("Failed to create discussion");
    }
  };

  const filteredDiscussions = discussions.filter(
    (discussion) =>
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Discussions | LMS</title>
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
            <span className="font-bold text-orange-500">Discussions</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Discussions
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Student" && "Ask questions and participate in course discussions"}
                  {user?.role === "Faculty" && "Moderate discussions and answer student questions"}
                  {user?.role === "Admin" && "Monitor and manage all course discussions"}
                </p>
              </div>
              <button
                onClick={() => setShowNewDiscussionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                New Discussion
              </button>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading discussions...</p>
            )}

            {error && !loading && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && filteredDiscussions.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No discussions found.
              </div>
            )}

            {!loading && !error && filteredDiscussions.length > 0 && (
            <div className="space-y-3">
              {filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <MessageSquare className="text-orange-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {discussion.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{discussion.author}</span>
                        </div>
                        <span>•</span>
                        <span>{discussion.course}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={12} />
                          <span>{discussion.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{discussion.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {showNewDiscussionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Start a New Discussion
                </h2>
                <button
                  onClick={() => {
                    setShowNewDiscussionModal(false);
                    setNewDiscussion({ title: "", course: "", content: "" });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateDiscussion} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discussion Title *
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) =>
                      setNewDiscussion({ ...newDiscussion, title: e.target.value })
                    }
                    placeholder="What is your discussion about?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course *
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.course}
                    onChange={(e) =>
                      setNewDiscussion({ ...newDiscussion, course: e.target.value })
                    }
                    placeholder="Which course is this discussion for?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discussion Content *
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) =>
                      setNewDiscussion({ ...newDiscussion, content: e.target.value })
                    }
                    placeholder="Share your thoughts, questions, or insights..."
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDiscussionModal(false);
                      setNewDiscussion({ title: "", course: "", content: "" });
                    }}
                    className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
                  >
                    Post Discussion
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

export default Discussions;
