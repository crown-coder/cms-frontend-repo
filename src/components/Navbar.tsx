import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, Search, ChevronDown, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header className="sticky top-4 z-20 px-4 sm:px-6">
      <div
        className={`mx-auto transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5"
            : "bg-white/60 backdrop-blur-xl shadow-md shadow-black/5"
        } rounded-3xl border border-white/20`}
      >
        <div className="px-4 sm:px-5 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left - Page title and search */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-800 truncate hidden sm:block tracking-tight">
                Compliance
              </h1>

              {/* Search - iOS style */}
              <div className="relative max-w-xs w-full hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-100/70 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-gray-50 transition-all placeholder:text-gray-400 text-gray-600"
                />
              </div>
            </div>

            {/* Right - User actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Notification - iOS style icon button */}
              <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100/80 transition-colors text-gray-500">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User menu trigger */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full hover:bg-gray-100/80 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm ring-2 ring-white">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[100px] leading-tight">
                      {user?.fullName?.split(" ")[0]}
                    </p>
                  </div>
                  <ChevronDown
                    className={`hidden sm:block w-3 h-3 text-gray-400 transition-transform duration-200 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown menu - iOS style */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-200/50 py-1 z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {user?.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium uppercase tracking-wider">
                        {formatRole(user?.role || "")}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200/50 mx-4"></div>

                    {/* Sign out button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 mt-1 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
      </div>
    </header>
  );
};

export default Navbar;
