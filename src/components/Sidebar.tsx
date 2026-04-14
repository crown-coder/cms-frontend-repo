import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Scale,
  Users,
  Settings,
  BookOpen,
} from "lucide-react";

// Shield, Activity

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["super_admin", "enforcement_head", "state_controller", "officer"],
    },
    {
      label: "Cases",
      path: "/dashboard/cases",
      icon: Scale,
      roles: ["super_admin", "enforcement_head", "state_controller", "officer"],
    },
    {
      label: "User Management",
      path: "/dashboard/users",
      icon: Users,
      roles: ["super_admin"],
    },
    {
      label: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
      roles: ["super_admin", "enforcement_head", "state_controller", "officer"],
    },
    {
      label: "Compliance Sections",
      path: "/dashboard/compliance-sections",
      icon: BookOpen,
      roles: ["super_admin", "enforcement_head"],
    },
    // {
    //   label: "Activity Logs",
    //   path: "/dashboard/logs",
    //   icon: Activity,
    //   roles: ["super_admin"],
    // },
    // {
    //   label: "Activity Logs",
    //   path: "/dashboard/logs",
    //   icon: Activity,
    //   roles: ["super_admin"],
    // },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Agency Logo/Brand */}
      <div className="px-6 py-8 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">CAC</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Compliance Portal
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">v2.4.0 • Secure</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user.fullName?.charAt(0) || user.email?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {user.role?.replace("_", " ").toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Status: Active</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Corporate Affairs Commission
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
