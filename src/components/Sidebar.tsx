import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Scale,
  Users,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

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
      label: "Users",
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
      label: "Compliance",
      path: "/dashboard/compliance-sections",
      icon: BookOpen,
      roles: ["super_admin", "enforcement_head"],
    },
    {
      label: "Reports",
      path: "/dashboard/reports",
      icon: FileText,
      roles: ["super_admin", "enforcement_head", "state_controller", "officer"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  return (
    <aside
      className={`relative bg-gradient-to-b from-green-800 to-green-900 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm z-20"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Brand */}
      <div
        className={`px-5 py-6 border-b border-green-700/50 ${
          collapsed ? "text-center" : ""
        }`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <img src="/assets/logo.png" alt="Logo" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white tracking-tight truncate">
                Compliance Portal
              </h2>
              <p className="text-[10px] text-green-300 mt-0.5 uppercase tracking-wider">
                v1.0.0
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User profile */}
      <div
        className={`px-4 py-4 border-b border-green-700/50 ${
          collapsed ? "flex justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-green-200">
              {user.fullName?.charAt(0) || user.email?.charAt(0)}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user.fullName}
              </p>
              <p className="text-[10px] text-green-300 truncate uppercase tracking-wider">
                {user.role?.replace(/_/g, " ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              title={collapsed ? item.label : ""}
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-green-200 hover:bg-green-700/50 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-green-600" : "text-green-300"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate text-xs tracking-wide">
                      {item.label}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`px-3 py-4 border-t border-green-700/50 ${collapsed ? "text-center" : ""}`}
      >
        <div className="flex items-center gap-2 text-green-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
          {!collapsed && (
            <span className="text-[10px] uppercase tracking-wider">
              System online
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
