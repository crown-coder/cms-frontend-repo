import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Page title and search */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h1 className="text-sm font-medium text-gray-700 truncate hidden sm:block">
              Compliance Management
            </h1>

            {/* Search */}
            <div className="relative max-w-sm w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right - User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick stats - subtle */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-gray-400 mr-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Enforcement
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* User menu trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate max-w-[120px]">
                    {formatRole(user?.role || "")}
                  </p>
                </div>
                <ChevronDown
                  className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium uppercase tracking-wider">
                      {formatRole(user?.role || "")}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
