import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Plus, Search, X, FileText, Image, File, Download } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

type Resource = {
  _id?: string;
  name: string;
  size: string;
  desc: string;
  type: "pdf" | "image" | "fig";
  color: "red" | "green" | "blue";
};

const Resources = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResource, setNewResource] = useState<Resource>({
    name: "",
    size: "",
    desc: "",
    type: "pdf",
    color: "red",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getresources");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      
      const data = await response.json();
      if (data.resources) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      // Set empty array on error to prevent crashes
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/addresources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResource),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to add resource");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json();
      }

      await fetchResources();
      setShowAddModal(false);
      setNewResource({ name: "", size: "", desc: "", type: "pdf", color: "red" });
      alert("Resource added successfully!");
    } catch (error) {
      console.error("Failed to add resource:", error);
      alert(error instanceof Error ? error.message : "Failed to add resource");
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canAddResource = user?.role === "Admin" || user?.role === "Faculty";

  return (
    <>
      <Head>
        <title>Resources | LMS</title>
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
            <span className="font-bold text-orange-500">Resources</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Resources
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === "Student" && "Access your learning materials and study resources"}
                  {user?.role === "Faculty" && "Manage and share resources with your students"}
                  {user?.role === "Admin" && "Manage all system resources and materials"}
                </p>
              </div>
              {canAddResource && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus size={20} />
                  Add Resource
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
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">Loading resources...</div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No resources found matching your search" : "No resources available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource, idx) => (
                  <div
                    key={resource._id || idx}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          resource.type === "pdf"
                            ? "bg-red-50 dark:bg-red-950"
                            : resource.type === "image"
                              ? "bg-green-50 dark:bg-green-950"
                              : "bg-blue-50 dark:bg-blue-950"
                        }`}
                      >
                        {resource.type === "pdf" ? (
                          <FileText className="text-red-500" size={24} />
                        ) : resource.type === "image" ? (
                          <Image className="text-green-500" size={24} />
                        ) : (
                          <File className="text-blue-500" size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {resource.size} • {resource.type.toUpperCase()}
                        </p>
                        {resource.desc && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {resource.desc}
                          </p>
                        )}
                        <button className="mt-3 flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Resource Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Add Resource
                </h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddResource} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={newResource.size}
                      onChange={(e) => setNewResource({ ...newResource, size: e.target.value })}
                      placeholder="e.g. 2.5 MB"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={newResource.type}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          type: e.target.value as Resource["type"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="image">Image</option>
                      <option value="fig">Document</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newResource.desc}
                    onChange={(e) => setNewResource({ ...newResource, desc: e.target.value })}
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
                    Add Resource
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

export default Resources;

