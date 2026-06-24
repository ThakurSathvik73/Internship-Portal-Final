import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { Menu, Settings as SettingsIcon, User, Bell, Shield, Moon, Sun, X, Save } from "lucide-react";
import React, { useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    loginAlerts: true,
    sessionTimeout: "30",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    assignments: true,
    announcements: true,
    tasks: true,
    discussions: true,
  });
  const settingsKey = user?.email
    ? `settings:${user.email.toLowerCase()}`
    : "settings";

  React.useEffect(() => {
    setProfileName(user?.name || "");

    const savedSettings = localStorage.getItem(settingsKey);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (typeof parsedSettings.darkMode === "boolean") {
          setDarkMode(parsedSettings.darkMode);
          setTheme(parsedSettings.darkMode ? "dark" : "light");
        }
        if (parsedSettings.notifications) {
          setNotifications((current) => ({ ...current, ...parsedSettings.notifications }));
        }
        if (parsedSettings.securitySettings) {
          setSecuritySettings((current) => ({ ...current, ...parsedSettings.securitySettings }));
        }
      } catch (error) {
        console.error("Failed to load saved settings:", error);
      }
      return;
    }
    setDarkMode(theme === "dark");
  }, [settingsKey, user?.name]);

  React.useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);

  const handleDarkModeChange = (enabled: boolean) => {
    setDarkMode(enabled);
    setTheme(enabled ? "dark" : "light");
  };

  const handleSaveChanges = () => {
    const settings = {
      profileName,
      darkMode,
      notifications,
      securitySettings,
    };
    localStorage.setItem(settingsKey, JSON.stringify(settings));

    if (user) {
      const updatedUser = { ...user, name: profileName.trim() || user.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      updateUser({ name: updatedUser.name });
    }

    setSaveMessage("Settings saved successfully.");
    window.setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <>
      <Head>
        <title>Settings | LMS</title>
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
            <span className="font-bold text-orange-500">Settings</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="space-y-6 max-w-3xl">
              {/* Profile Settings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <User className="text-blue-500" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Profile Settings
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.role}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <Bell className="text-orange-500" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {key === "email" && "Email Notifications"}
                        {key === "push" && "Push Notifications"}
                        {key === "assignments" && "Assignment Updates"}
                        {key === "announcements" && "Announcements"}
                        {key === "tasks" && "Task Assignments"}
                        {key === "discussions" && "Discussion Replies"}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [key]: e.target.checked })
                        }
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Password Settings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <Shield className="text-yellow-600" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Password & Security
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Keep your account secure by updating your password regularly
                </p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Change Password
                </button>
              </div>

              {/* Appearance Settings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    {darkMode ? (
                      <Moon className="text-purple-500" size={20} />
                    ) : (
                      <Sun className="text-purple-500" size={20} />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Appearance
                  </h2>
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => handleDarkModeChange(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
              </div>

              {/* Security Settings (Admin only) */}
              {(user?.role === "Superadmin" || user?.role === "Admin") && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <Shield className="text-red-500" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Security Settings
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage system-wide security settings and permissions
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSecurityModal(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    Manage Security
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                {saveMessage && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {saveMessage}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (passwordData.newPassword !== passwordData.confirmPassword) {
                        alert("Passwords do not match");
                        return;
                      }
                      if (passwordData.newPassword.length < 6) {
                        alert("Password must be at least 6 characters");
                        return;
                      }
                      alert("Password changed successfully!");
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSecurityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Security Settings
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Require two-factor authentication
                  </span>
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorRequired}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorRequired: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Send login alerts
                  </span>
                  <input
                    type="checkbox"
                    checked={securitySettings.loginAlerts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        loginAlerts: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session timeout
                  </label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowSecurityModal(false)}
                    className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("securitySettings", JSON.stringify(securitySettings));
                      setShowSecurityModal(false);
                      setSaveMessage("Security settings saved.");
                      window.setTimeout(() => setSaveMessage(""), 3000);
                    }}
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
                  >
                    Save Security
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
