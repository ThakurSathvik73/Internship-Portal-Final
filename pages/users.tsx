import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Users, Search, Plus, X, Shield, GraduationCap, UserCheck, Mail, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Superadmin" | "Admin" | "Faculty" | "Student";
  status: "active" | "inactive";
  joinedDate: string;
};

const UsersPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const canManageUsers = user?.role === "Superadmin" || user?.role === "Admin";
  const roleOptions =
    user?.role === "Superadmin"
      ? ["Student", "Faculty", "Admin", "Superadmin"]
      : ["Student", "Faculty"];
  const [users,setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Student", status: "active", password: "", confirmPassword: "" });

    // fetch users on mount
    useEffect(() => {
      if (!canManageUsers) return;

      const token = localStorage.getItem("token");
      fetch("/api/users", {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.users && Array.isArray(data.users)) setUsers(data.users);
        })
        .catch((err) => {
          console.error("Failed to fetch users", err);
        });
    }, [canManageUsers]);

    useEffect(() => {
      const query = router.query.q;
      setSearchTerm(typeof query === "string" ? query : "");
    }, [router.query.q]);

  // Only Admin and Superadmin can access this page
  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

    const openAddModal = () => setShowAddModal(true);
    const closeAddModal = () => {
      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "Student", status: "active", password: "", confirmPassword: "" });
    };

    const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      // simple client-side validation for password
      if (!newUser.password || newUser.password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      if (newUser.password !== newUser.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      // map frontend roles to backend enum values
      const roleMap: Record<string, string> = {
        Superadmin: "superadmin",
        Admin: "admin",
        Faculty: "faculty",
        Student: "student",
      };

      const payload = {
        name: newUser.name,
        email: newUser.email,
        role: roleMap[newUser.role as string] || "student",
        status: newUser.status,
        password: newUser.password,
        joinedDate: new Date().toISOString(),
      } as any;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUsers((prev) => [data.user, ...prev]);
          closeAddModal();
        } else {
          console.error("Failed to add user", data);
          alert(data.error || "Failed to add user");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to add user");
      }
    };

    const handleDeleteUser = async (targetUser: User) => {
      if (targetUser.email === user?.email) {
        alert("You cannot delete your own account.");
        return;
      }

      if (user?.role === "Admin" && !["Faculty", "Student"].includes(targetUser.role)) {
        alert("Admins can only delete faculty and students.");
        return;
      }

      if (!confirm(`Delete ${targetUser.name}? This action cannot be undone.`)) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ id: targetUser.id }),
        });
        const data = await res.json();

        if (res.ok) {
          setUsers((prev) => prev.filter((item) => item.id !== targetUser.id));
        } else {
          alert(data.error || "Failed to delete user");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to delete user");
      }
    };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Superadmin":
        return <Shield className="text-purple-500" size={20} />;
      case "Admin":
        return <Shield className="text-red-500" size={20} />;
      case "Faculty":
        return <UserCheck className="text-blue-500" size={20} />;
      case "Student":
        return <GraduationCap className="text-green-500" size={20} />;
      default:
        return <Users className="text-gray-500" size={20} />;
    }
  };

  return (
    <>
      <Head>
        <title>Users Management | LMS</title>
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
            <span className="font-bold text-orange-500">Users</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  User Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage all system users, roles, and permissions
                </p>
              </div>
              <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Plus size={20} />
                Add User
              </button>
            </div>

            {showAddModal && (
              <div className="mb-6">
                <form onSubmit={handleAddUser} className="bg-white dark:bg-gray-900 rounded-lg border p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Add New User</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full name" className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800" />
                    <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800" />
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "Superadmin" | "Admin" | "Faculty" | "Student" })} className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800">
                      {roleOptions.map((role) => (
                        <option key={role}>{role}</option>
                      ))}
                    </select>
                    <input required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input required type="password" value={newUser.confirmPassword} onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })} placeholder="Confirm password" className="px-3 py-2 rounded border dark:bg-gray-800" />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                      <select value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value as "active" | "inactive" })} className="px-3 py-2 rounded border dark:bg-gray-800">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={closeAddModal} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white">Create</button>
                  </div>
                </form>
              </div>
            )}

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Users className="text-orange-500" size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {u.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail size={12} />
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(u.role)}
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {u.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              u.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(u.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="inline-flex items-center justify-center rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                            title="Delete user"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
