import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Download, Search, X, FileText, Calendar, ArrowDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

type DownloadItem = {
  _id: string;
  name: string;
  type: string;
  size: string;
  desc?: string;
};

const DownloadsPage = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/getresources");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch downloads");
        }

        setDownloads(data.resources || []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch downloads");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredDownloads = downloads.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.desc || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Downloads | LMS</title>
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
            <span className="font-bold text-orange-500">Downloads</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Downloads
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage your downloaded files
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
                  placeholder="Search downloads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading downloads...</p>
            )}

            {error && !loading && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && filteredDownloads.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No downloads found.
              </div>
            )}

            {!loading && !error && filteredDownloads.length > 0 && (
            <div className="space-y-3">
              {filteredDownloads.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <FileText className="text-orange-500" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{item.type}</span>
                        <span>|</span>
                        <span>{item.size}</span>
                      </div>
                      {item.desc && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar size={12} />
                          <span>{item.desc}</span>
                        </div>
                      )}
                    </div>
                    <button className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors">
                      <ArrowDown size={20} />
                    </button>
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

export default DownloadsPage;
