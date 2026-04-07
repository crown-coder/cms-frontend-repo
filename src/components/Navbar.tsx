import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-700 border-purple-200",
      enforcement_head: "bg-blue-100 text-blue-700 border-blue-200",
      state_controller: "bg-green-100 text-green-700 border-green-200",
      officer: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[role as keyof typeof colors] || colors.officer;
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-medium text-gray-800">
              Compliance Management System
            </h1>

            <div className="hidden lg:flex items-center max-w-md flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases, companies, or violations..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.fullName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user?.role || "")}`}
                  >
                    {formatRole(user?.role || "")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
                </div>

                <button
                  onClick={handleLogout} // 👈 use this instead
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span className="text-green-600 font-medium">CAC</span>
          <span>•</span>
          <span>Enforcement Division</span>
          <span>•</span>
          <span className="text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
