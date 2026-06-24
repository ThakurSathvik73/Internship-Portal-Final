import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Video,
  MessageSquare,
  FolderOpen,
  StickyNote,
  Download,
  Users,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type MenuItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

type Props = {};

const Sidebar = (props: Props) => {
  const [activeItem, setActiveItem] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Role-based menu items
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashbord" },
    ];

    if (user?.role === "Superadmin" || user?.role === "Admin") {
      return [
        ...baseItems,
        { icon: Users, label: "Users", path: "/users" },
        { icon: FileText, label: "Tasks", path: "/tasks" },
        { icon: GraduationCap, label: "Courses", path: "/courses" },
        { icon: FileText, label: "Assignments", path: "/assignments" },
        { icon: Calendar, label: "Schedule", path: "/schedule" },
        { icon: Video, label: "Recordings", path: "/recordings" },
        { icon: MessageSquare, label: "Discussions", path: "/discussions" },
        { icon: FolderOpen, label: "Resources", path: "/resources" },
        { icon: FileText, label: "Content Manager", path: "/admin-content" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ];
    } else if (user?.role === "Faculty") {
      return [
        ...baseItems,
        { icon: FileText, label: "Tasks", path: "/tasks" },
        { icon: FileText, label: "Assignments", path: "/assignments" },
        { icon: Calendar, label: "Schedule", path: "/schedule" },
        { icon: Video, label: "Recordings", path: "/recordings" },
        { icon: MessageSquare, label: "Discussions", path: "/discussions" },
        { icon: FolderOpen, label: "Resources", path: "/resources" },
        { icon: Users, label: "Students", path: "/students" },
        { icon: GraduationCap, label: "Courses", path: "/courses" },
        { icon: FileText, label: "Create Content", path: "/faculty-content" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ];
    } else {
      // Student role
      return [
        ...baseItems,
        { icon: FileText, label: "Tasks", path: "/tasks" },
        { icon: FileText, label: "Assignments", path: "/assignments" },
        { icon: Calendar, label: "Schedule", path: "/schedule" },
        { icon: Video, label: "Videos", path: "/student-videos" },
        { icon: MessageSquare, label: "Discussions", path: "/discussions" },
        { icon: FolderOpen, label: "Resources", path: "/resources" },
        { icon: StickyNote, label: "Notes", path: "/student-notes" },
        { icon: Download, label: "Downloads", path: "/downloads" },
        { icon: GraduationCap, label: "Courses", path: "/courses" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ];
    }
  };

  const menuItems = getMenuItems();

  React.useEffect(() => {
    const currentPath = window.location.pathname;
    const currentItem = menuItems.find((item) => item.path === currentPath);
    if (currentItem) {
      setActiveItem(currentItem.label);
    }
  }, [menuItems]);

  return (
    <div
      className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-80"
      }`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1
          className={`text-xl font-bold tracking-wider transition-opacity duration-300 ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          {!isCollapsed && (
            <>
              <svg
                width="167"
                height="12"
                viewBox="0 0 167 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.1352e-05 11.424V0.223995H7.05603V1.792H1.72803V5.008H6.60803V6.576H1.72803V9.856H7.13603V11.424H3.1352e-05ZM14.9855 11.648C14.1429 11.648 13.3962 11.4987 12.7455 11.2C12.0949 10.9013 11.5829 10.464 11.2095 9.888C10.8469 9.30133 10.6655 8.592 10.6655 7.76V7.36H12.3775V7.76C12.3775 8.54933 12.6122 9.14133 13.0815 9.536C13.5615 9.93066 14.1962 10.128 14.9855 10.128C15.7855 10.128 16.3882 9.96266 16.7935 9.632C17.1989 9.29066 17.4015 8.85333 17.4015 8.32C17.4015 7.968 17.3055 7.68 17.1135 7.456C16.9215 7.232 16.6495 7.056 16.2975 6.928C15.9455 6.78933 15.5242 6.66133 15.0335 6.544L14.4415 6.4C13.7269 6.22933 13.1029 6.02133 12.5695 5.776C12.0469 5.52 11.6415 5.184 11.3535 4.768C11.0655 4.352 10.9215 3.81866 10.9215 3.168C10.9215 2.50666 11.0815 1.94133 11.4015 1.472C11.7322 1.00266 12.1855 0.639996 12.7615 0.383995C13.3375 0.127995 14.0149 -4.76837e-06 14.7935 -4.76837e-06C15.5722 -4.76837e-06 16.2655 0.133329 16.8735 0.399996C17.4922 0.666662 17.9775 1.06133 18.3295 1.584C18.6815 2.10666 18.8575 2.76266 18.8575 3.552V4.128H17.1455V3.552C17.1455 3.072 17.0442 2.68266 16.8415 2.384C16.6495 2.08533 16.3775 1.86666 16.0255 1.728C15.6735 1.58933 15.2629 1.52 14.7935 1.52C14.1109 1.52 13.5775 1.664 13.1935 1.952C12.8202 2.22933 12.6335 2.61866 12.6335 3.12C12.6335 3.46133 12.7135 3.744 12.8735 3.968C13.0442 4.18133 13.2895 4.35733 13.6095 4.496C13.9295 4.63466 14.3295 4.75733 14.8095 4.864L15.4015 5.008C16.1269 5.168 16.7669 5.376 17.3215 5.632C17.8762 5.87733 18.3135 6.21333 18.6335 6.64C18.9535 7.06666 19.1135 7.616 19.1135 8.288C19.1135 8.96 18.9429 9.54666 18.6015 10.048C18.2709 10.5493 17.7962 10.944 17.1775 11.232C16.5589 11.5093 15.8282 11.648 14.9855 11.648ZM26.9755 11.648C26.1329 11.648 25.3862 11.4987 24.7355 11.2C24.0849 10.9013 23.5729 10.464 23.1995 9.888C22.8369 9.30133 22.6555 8.592 22.6555 7.76V7.36H24.3675V7.76C24.3675 8.54933 24.6022 9.14133 25.0715 9.536C25.5515 9.93066 26.1862 10.128 26.9755 10.128C27.7755 10.128 28.3782 9.96266 28.7835 9.632C29.1889 9.29066 29.3915 8.85333 29.3915 8.32C29.3915 7.968 29.2955 7.68 29.1035 7.456C28.9115 7.232 28.6395 7.056 28.2875 6.928C27.9355 6.78933 27.5142 6.66133 27.0235 6.544L26.4315 6.4C25.7169 6.22933 25.0929 6.02133 24.5595 5.776C24.0369 5.52 23.6315 5.184 23.3435 4.768C23.0555 4.352 22.9115 3.81866 22.9115 3.168C22.9115 2.50666 23.0715 1.94133 23.3915 1.472C23.7222 1.00266 24.1755 0.639996 24.7515 0.383995C25.3275 0.127995 26.0049 -4.76837e-06 26.7835 -4.76837e-06C27.5622 -4.76837e-06 28.2555 0.133329 28.8635 0.399996C29.4822 0.666662 29.9675 1.06133 30.3195 1.584C30.6715 2.10666 30.8475 2.76266 30.8475 3.552V4.128H29.1355V3.552C29.1355 3.072 29.0342 2.68266 28.8315 2.384C28.6395 2.08533 28.3675 1.86666 28.0155 1.728C27.6635 1.58933 27.2529 1.52 26.7835 1.52C26.1009 1.52 25.5675 1.664 25.1835 1.952C24.8102 2.22933 24.6235 2.61866 24.6235 3.12C24.6235 3.46133 24.7035 3.744 24.8635 3.968C25.0342 4.18133 25.2795 4.35733 25.5995 4.496C25.9195 4.63466 26.3195 4.75733 26.7995 4.864L27.3915 5.008C28.1169 5.168 28.7569 5.376 29.3115 5.632C29.8662 5.87733 30.3035 6.21333 30.6235 6.64C30.9435 7.06666 31.1035 7.616 31.1035 8.288C31.1035 8.96 30.9329 9.54666 30.5915 10.048C30.2609 10.5493 29.7862 10.944 29.1675 11.232C28.5489 11.5093 27.8182 11.648 26.9755 11.648ZM45.2837 11.648C44.441 11.648 43.6943 11.4987 43.0437 11.2C42.393 10.9013 41.881 10.464 41.5077 9.888C41.145 9.30133 40.9637 8.592 40.9637 7.76V7.36H42.6757V7.76C42.6757 8.54933 42.9103 9.14133 43.3797 9.536C43.8597 9.93066 44.4943 10.128 45.2837 10.128C46.0837 10.128 46.6863 9.96266 47.0917 9.632C47.497 9.29066 47.6997 8.85333 47.6997 8.32C47.6997 7.968 47.6037 7.68 47.4117 7.456C47.2197 7.232 46.9477 7.056 46.5957 6.928C46.2437 6.78933 45.8223 6.66133 45.3317 6.544L44.7397 6.4C44.025 6.22933 43.401 6.02133 42.8677 5.776C42.345 5.52 41.9397 5.184 41.6517 4.768C41.3637 4.352 41.2197 3.81866 41.2197 3.168C41.2197 2.50666 41.3797 1.94133 41.6997 1.472C42.0303 1.00266 42.4837 0.639996 43.0597 0.383995C43.6357 0.127995 44.313 -4.76837e-06 45.0917 -4.76837e-06C45.8703 -4.76837e-06 46.5637 0.133329 47.1717 0.399996C47.7903 0.666662 48.2757 1.06133 48.6277 1.584C48.9797 2.10666 49.1557 2.76266 49.1557 3.552V4.128H47.4437V3.552C47.4437 3.072 47.3423 2.68266 47.1397 2.384C46.9477 2.08533 46.6757 1.86666 46.3237 1.728C45.9717 1.58933 45.561 1.52 45.0917 1.52C44.409 1.52 43.8757 1.664 43.4917 1.952C43.1183 2.22933 42.9317 2.61866 42.9317 3.12C42.9317 3.46133 43.0117 3.744 43.1717 3.968C43.3423 4.18133 43.5877 4.35733 43.9077 4.496C44.2277 4.63466 44.6277 4.75733 45.1077 4.864L45.6997 5.008C46.425 5.168 47.065 5.376 47.6197 5.632C48.1743 5.87733 48.6117 6.21333 48.9317 6.64C49.2517 7.06666 49.4117 7.616 49.4117 8.288C49.4117 8.96 49.241 9.54666 48.8997 10.048C48.569 10.5493 48.0943 10.944 47.4757 11.232C46.857 11.5093 46.1263 11.648 45.2837 11.648ZM55.7158 11.424V1.792H52.2758V0.223995H60.8838V1.792H57.4438V11.424H55.7158ZM68.882 11.648C67.9967 11.648 67.234 11.488 66.594 11.168C65.9647 10.848 65.474 10.3893 65.122 9.792C64.7807 9.184 64.61 8.448 64.61 7.584V0.223995H66.354V7.632C66.354 8.42133 66.5727 9.02933 67.01 9.456C67.4474 9.88266 68.0714 10.096 68.882 10.096C69.6927 10.096 70.3167 9.88266 70.754 9.456C71.1914 9.02933 71.41 8.42133 71.41 7.632V0.223995H73.138V7.584C73.138 8.448 72.9674 9.184 72.626 9.792C72.2847 10.3893 71.794 10.848 71.154 11.168C70.514 11.488 69.7567 11.648 68.882 11.648ZM77.2172 11.424V9.888H78.7212V1.76H77.2172V0.223995H81.6972C83.1905 0.223995 84.3318 0.602662 85.1212 1.36C85.9212 2.11733 86.3212 3.25866 86.3212 4.784V6.88C86.3212 8.40533 85.9212 9.54666 85.1212 10.304C84.3318 11.0507 83.1905 11.424 81.6972 11.424H77.2172ZM80.4652 9.856H81.7132C82.6838 9.856 83.4038 9.61066 83.8732 9.12C84.3425 8.62933 84.5772 7.89866 84.5772 6.928V4.72C84.5772 3.73866 84.3425 3.008 83.8732 2.528C83.4038 2.048 82.6838 1.808 81.7132 1.808H80.4652V9.856ZM90.5138 11.424V0.223995H97.5698V1.792H92.2418V5.008H97.1218V6.576H92.2418V9.856H97.6498V11.424H90.5138ZM101.691 11.424V0.223995H105.019L108.059 10.272H108.315V0.223995H110.027V11.424H106.699L103.659 1.36H103.403V11.424H101.691ZM117.275 11.424V1.792H113.835V0.223995H122.443V1.792H119.003V11.424H117.275ZM132.114 11.424V0.223995H133.842V5.024H138.546V0.223995H140.274V11.424H138.546V6.592H133.842V11.424H132.114ZM149.046 11.648C148.161 11.648 147.398 11.488 146.758 11.168C146.129 10.848 145.638 10.3893 145.286 9.792C144.945 9.184 144.774 8.448 144.774 7.584V0.223995H146.518V7.632C146.518 8.42133 146.737 9.02933 147.174 9.456C147.612 9.88266 148.236 10.096 149.046 10.096C149.857 10.096 150.481 9.88266 150.918 9.456C151.356 9.02933 151.574 8.42133 151.574 7.632V0.223995H153.302V7.584C153.302 8.448 153.132 9.184 152.79 9.792C152.449 10.3893 151.958 10.848 151.318 11.168C150.678 11.488 149.921 11.648 149.046 11.648ZM157.382 11.424V9.888H158.886V1.76H157.382V0.223995H163.062C163.734 0.223995 164.32 0.341329 164.822 0.575995C165.323 0.799996 165.712 1.12533 165.99 1.552C166.278 1.968 166.422 2.464 166.422 3.04V3.2C166.422 3.712 166.326 4.13333 166.134 4.464C165.942 4.79466 165.707 5.05066 165.43 5.232C165.163 5.41333 164.907 5.54133 164.662 5.616V5.872C164.907 5.936 165.168 6.064 165.446 6.256C165.734 6.43733 165.974 6.69333 166.166 7.024C166.368 7.35466 166.47 7.78666 166.47 8.32V8.48C166.47 9.09866 166.326 9.62666 166.038 10.064C165.75 10.5013 165.35 10.8373 164.838 11.072C164.336 11.3067 163.755 11.424 163.094 11.424H157.382ZM160.63 9.856H162.886C163.462 9.856 163.915 9.71733 164.246 9.44C164.576 9.16266 164.742 8.77866 164.742 8.288V8.144C164.742 7.65333 164.576 7.26933 164.246 6.992C163.926 6.71466 163.472 6.576 162.886 6.576H160.63V9.856ZM160.63 4.992H162.886C163.43 4.992 163.867 4.85866 164.198 4.592C164.528 4.31466 164.694 3.94133 164.694 3.472V3.312C164.694 2.84266 164.528 2.47466 164.198 2.208C163.878 1.93066 163.44 1.792 162.886 1.792H160.63V4.992Z"
                  fill="#060606"
                  className="dark:fill-white"
                />
              </svg>
            </>
          )}
        </h1>
        <button
          type="button"
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              onClick={() => {
                setActiveItem(item.label);
                window.location.href = item.path;
              }}
              className={`
                w-full flex items-center ${
                  isCollapsed ? "justify-center p-3" : "gap-4 px-5 py-3"
                }  rounded-lg text-left transition-all
                ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={20} />
              <span
                className={`font-medium transition-opacity duration-300 ${
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                {!isCollapsed && item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {!isCollapsed && user && (
          <div className="px-5 py-2 text-sm">
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
            <p className="text-xs text-orange-500 font-medium mt-1">
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              logout();
            }
          }}
          className={`
            w-full flex items-center ${
              isCollapsed ? "justify-center p-3" : "gap-4 px-5 py-3"
            } rounded-lg text-left transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:shadow-md active:scale-95
          `}
          title={isCollapsed ? "Logout" : "Click to logout"}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span
            className={`font-medium transition-opacity duration-300 ${
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            {!isCollapsed && "Logout"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
