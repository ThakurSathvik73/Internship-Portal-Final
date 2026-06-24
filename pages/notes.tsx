import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import Head from "next/head";
import { Menu, X, Plus, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Note = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  tags: string[];
  date: string; // ISO string
  attachmentName?: string;
  attachmentUrl?: string;
};

const tagColors: Record<string, string> = {
  Product:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  Weekly: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  Retro:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
  Agile: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  Design: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200",
  UI: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200",
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const trackDownload = (
  fileName: string,
  fileSize: number = 0,
  noteTitle: string = "",
) => {
  if (typeof window === "undefined") return;
  try {
    const downloads = JSON.parse(
      localStorage.getItem("downloads-data") || "[]",
    );
    downloads.unshift({
      id: crypto.randomUUID(),
      fileName,
      fileSize,
      downloadTime: new Date().toISOString(),
      noteTitle,
    });
    localStorage.setItem("downloads-data", JSON.stringify(downloads));
  } catch (err) {
    console.error("Failed to track download", err);
  }
};

const NotesPage: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [filterTag, setFilterTag] = useState<string>("All");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState<Note>({
    id: "",
    title: "",
    excerpt: "",
    author: "",
    tags: [],
    date: new Date().toISOString(),
    attachmentName: "",
    attachmentUrl: "",
  });
  const [newNoteFile, setNewNoteFile] = useState<File | null>(null);

  const mapNote = (item: any): Note => ({
    id: item._id,
    title: item.title,
    excerpt: item.content,
    author: item.createdBy || "Unknown",
    tags: [item.course, item.topic].filter(Boolean),
    date: item.createdAt || new Date().toISOString(),
    attachmentName: item.fileUrl ? item.fileUrl.split("/").pop() : "",
    attachmentUrl: item.fileUrl || "",
  });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/content/notes");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch notes");
        }

        setNotes((data.data || []).map(mapNote));
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const tags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [notes]);

  const displayed = useMemo(() => {
    let list = [...notes];
    if (filterTag !== "All") {
      list = list.filter((n) => n.tags.includes(filterTag));
    }
    list.sort((a, b) => {
      if (sortBy === "date")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [filterTag, sortBy, notes]);

  return (
    <>
      <Head>
        <title>Notes - ESS Student Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
            aria-label="Close menu"
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
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">ESS Student Hub</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Notes
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep track of meetings, retros, and ideas.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as typeof sortBy)
                      }
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    >
                      <option value="date">Date</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    >
                      {tags.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
                  >
                    <Plus size={16} /> Add Notes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading notes...</p>
                )}

                {error && !loading && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                {!loading && !error && displayed.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No notes found.
                  </div>
                )}

                {displayed.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              tagColors[tag] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewNote(note)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400"
                      >
                        View More
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {note.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          {note.author
                            .split(" ")
                            .map((p) => p[0])
                            .join("")}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {note.author}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(note.date))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Add Note
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close add note"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        let attachmentUrl = "";
                        if (newNoteFile) {
                          try {
                            attachmentUrl = await fileToDataUrl(newNoteFile);
                          } catch (err) {
                            console.error("Failed to read file", err);
                          }
                        }
                        const [course, topic] = newNote.tags.filter(Boolean);

                        try {
                          const response = await fetch("/api/content/notes", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "x-user-role": user?.role || "",
                              "x-user-email": user?.email || "",
                            },
                            body: JSON.stringify({
                              title: newNote.title,
                              content: newNote.excerpt,
                              course,
                              topic,
                              fileUrl: attachmentUrl,
                            }),
                          });
                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error || "Failed to add note");
                          }

                          setNotes((prev) => [mapNote(data.data), ...prev]);
                          setShowModal(false);
                          setNewNote({
                            id: "",
                            title: "",
                            excerpt: "",
                            author: "",
                            tags: [],
                            date: new Date().toISOString(),
                            attachmentName: "",
                            attachmentUrl: "",
                          });
                          setNewNoteFile(null);
                          setError("");
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Failed to add note");
                        }
                      }}
                      className="p-4 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Title
                        </label>
                        <input
                          value={newNote.title}
                          onChange={(e) =>
                            setNewNote((s) => ({ ...s, title: e.target.value }))
                          }
                          required
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Note title"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Excerpt
                        </label>
                        <textarea
                          value={newNote.excerpt}
                          onChange={(e) =>
                            setNewNote((s) => ({
                              ...s,
                              excerpt: e.target.value,
                            }))
                          }
                          required
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows={3}
                          placeholder="Quick summary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Author
                          </label>
                          <input
                            value={newNote.author}
                            onChange={(e) =>
                              setNewNote((s) => ({
                                ...s,
                                author: e.target.value,
                              }))
                            }
                            required
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Date
                          </label>
                          <input
                            type="datetime-local"
                            value={newNote.date.slice(0, 16)}
                            onChange={(e) =>
                              setNewNote((s) => ({
                                ...s,
                                date: new Date(e.target.value).toISOString(),
                              }))
                            }
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Tags (comma separated)
                        </label>
                        <input
                          value={newNote.tags.join(", ")}
                          onChange={(e) =>
                            setNewNote((s) => ({
                              ...s,
                              tags: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            }))
                          }
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="e.g. Weekly, Product"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Attach file (optional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setNewNoteFile(file);
                            setNewNote((s) => ({
                              ...s,
                              attachmentName: file?.name || "",
                              attachmentUrl: "",
                            }));
                          }}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2"
                          aria-label="Attach note file"
                        />
                        {newNoteFile?.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Selected: {newNoteFile.name}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add Note
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {viewNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Note Details
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {viewNote.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setViewNote(null)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        aria-label="Close note details"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {viewNote.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${tagColors[tag] || "bg-gray-100 text-gray-700"}`}
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.DateTimeFormat("en", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(viewNote.date))}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                        {viewNote.excerpt}
                      </p>

                      {viewNote.attachmentName && (
                        <div className="space-y-2 rounded-lg border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800/40">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Attachment:</span>
                            <span className="text-gray-600 dark:text-gray-300">
                              {viewNote.attachmentName}
                            </span>
                            {viewNote.attachmentUrl && (
                              <>
                                <a
                                  href={viewNote.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 dark:text-blue-400 font-semibold"
                                >
                                  Preview
                                </a>
                                <a
                                  href={viewNote.attachmentUrl}
                                  download={viewNote.attachmentName}
                                  onClick={() =>
                                    trackDownload(
                                      viewNote.attachmentName || "file",
                                      0,
                                      viewNote.title,
                                    )
                                  }
                                  className="text-blue-600 dark:text-blue-400 font-semibold"
                                >
                                  Download
                                </a>
                              </>
                            )}
                          </div>

                          {viewNote.attachmentUrl &&
                            /\.(png|jpe?g|gif|webp|svg)$/i.test(
                              viewNote.attachmentName || "",
                            ) && (
                              <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <img
                                  src={viewNote.attachmentUrl}
                                  alt={viewNote.attachmentName}
                                  className="max-h-64 w-full object-contain"
                                />
                              </div>
                            )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">
                          {viewNote.author
                            .split(" ")
                            .map((p) => p[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {viewNote.author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Author
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotesPage;
