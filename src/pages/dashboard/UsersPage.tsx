import { useState, useEffect, useContext, useRef } from "react";
import {
  createUser,
  getUsers,
  deleteUser,
  getUserById,
} from "../../services/userService";
import { AuthContext } from "../../context/AuthContext";
import {
  UserPlus,
  Users,
  Shield,
  MapPin,
  Mail,
  Key,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Building2,
  UserCog,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 max-w-2xl w-full max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-70px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <AlertCircle className="w-4 h-4 text-blue-500" />,
  };

  const styles: Record<ToastType, string> = {
    success: "bg-green-50/90 backdrop-blur-xl border-green-200 text-green-700",
    error: "bg-red-50/90 backdrop-blur-xl border-red-200 text-red-700",
    info: "bg-blue-50/90 backdrop-blur-xl border-blue-200 text-blue-700",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${styles[type]} shadow-2xl z-50 animate-slide-up`}
    >
      {icons[type]}
      <p className="text-xs font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="ml-3 text-gray-400 hover:text-gray-600"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const UsersPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const assignedStates = users
    .filter((u) => u.role === "enforcement_head")
    .flatMap((u) => u.assignedStates || []);

  const NIGERIA_STATES = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    state: "",
    states: [] as string[],
  });

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
      setCurrentPage(1);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        state:
          form.role === "officer" || form.role === "state_controller"
            ? form.state
            : null,
        states: form.role === "enforcement_head" ? form.states : [],
      });
      showToast("User created successfully", "success");
      setShowCreateModal(false);
      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "",
        state: "",
        states: [],
      });
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error creating user", "error");
    }
  };

  const handleDelete = async (id: number, userName: string) => {
    if (!window.confirm(`Delete ${userName}? This action cannot be undone.`))
      return;
    try {
      await deleteUser(id);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error deleting user", "error");
    }
  };

  const handleViewUserDetail = async (userId: number) => {
    setLoadingUserDetail(true);
    try {
      const detail = await getUserById(userId);
      setSelectedUserDetail(detail);
      setShowUserDetail(true);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Error fetching user details",
        "error",
      );
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: "bg-purple-50 text-purple-600 border-purple-200",
      enforcement_head: "bg-blue-50 text-blue-600 border-blue-200",
      state_controller: "bg-green-50 text-green-600 border-green-200",
      officer: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return styles[role] || styles.officer;
  };

  const getRoleDot = (role: string) => {
    const dots: Record<string, string> = {
      super_admin: "bg-purple-500",
      enforcement_head: "bg-blue-500",
      state_controller: "bg-green-500",
      officer: "bg-gray-400",
    };
    return dots[role] || "bg-gray-400";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Shield className="w-3 h-3" />;
      case "enforcement_head":
        return <UserCog className="w-3 h-3" />;
      case "state_controller":
        return <Building2 className="w-3 h-3" />;
      default:
        return <UserCheck className="w-3 h-3" />;
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchTerm === "" ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getVisiblePages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // Stats
  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Super Admins",
      value: users.filter((u) => u.role === "super_admin").length,
      icon: Shield,
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Enf. Heads",
      value: users.filter((u) => u.role === "enforcement_head").length,
      icon: UserCog,
      gradient: "from-blue-500 to-cyan-600",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Controllers",
      value: users.filter((u) => u.role === "state_controller").length,
      icon: Building2,
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  // Role counts for quick filters
  const roleCounts: Record<string, number> = {
    all: users.length,
    super_admin: users.filter((u) => u.role === "super_admin").length,
    enforcement_head: users.filter((u) => u.role === "enforcement_head").length,
    state_controller: users.filter((u) => u.role === "state_controller").length,
    officer: users.filter((u) => u.role === "officer").length,
  };

  if (
    !["super_admin", "enforcement_head", "state_controller"].includes(
      user?.role || "",
    )
  ) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-sm font-bold text-gray-700 mb-1">
            Access Denied
          </h2>
          <p className="text-xs text-gray-400">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-7 h-7 text-green-600 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Loading users</p>
          <p className="text-xs text-gray-400 mt-1.5">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header - Glass card */}
      <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg shadow-black/5 p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Users
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {filteredUsers.length.toLocaleString()}{" "}
              {filteredUsers.length === 1 ? "user" : "users"} found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white/80 rounded-full transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            {["super_admin", "enforcement_head"].includes(user?.role || "") && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-xs font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New User</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Glass */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 ${stat.bgLight} rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters - Glass */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, email, or state..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-20 py-2.5 text-sm bg-gray-100/70 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all placeholder:text-gray-400 text-gray-700"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-200/50 rounded-md">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-full transition-colors ${
              showFilters || roleFilter !== "all"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-white/80 border border-gray-200/50 text-gray-600 hover:bg-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {roleFilter !== "all" && (
              <span className="w-5 h-5 bg-green-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>
        </div>

        {/* Quick role filters */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {Object.entries(roleCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => {
                setRoleFilter(key === "all" ? "all" : key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors ${
                roleFilter === key || (key === "all" && roleFilter === "all")
                  ? "bg-gray-800 text-white"
                  : "bg-white/80 text-gray-500 hover:bg-gray-100 border border-gray-200/50"
              }`}
            >
              {key === "all" ? "All" : formatRole(key)}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200/50">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 text-sm bg-white/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="enforcement_head">Enforcement Head</option>
              <option value="state_controller">State Controller</option>
              <option value="officer">Officer</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table - Glass */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50">
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-600">
                          {u.fullName?.charAt(0) || u.email?.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getRoleDot(u.role)}`}
                      ></span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadge(u.role)}`}
                      >
                        {getRoleIcon(u.role)}
                        {formatRole(u.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.assignedStates?.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-600">
                          {u.assignedStates.slice(0, 2).join(", ")}
                        </span>
                        {u.assignedStates.length > 2 && (
                          <button
                            onClick={() => handleViewUserDetail(u.id)}
                            className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            +{u.assignedStates.length - 2}
                          </button>
                        )}
                      </div>
                    ) : u.state ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {u.state}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        Active
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {["super_admin", "enforcement_head"].includes(
                      user?.role || "",
                    ) &&
                      u.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.fullName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        No users found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchTerm
                          ? `No results for "${searchTerm}". Try adjusting your search.`
                          : "Try adjusting your filters or create a new user."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-3 text-xs font-medium text-green-600 hover:text-green-700"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Glass */}
        {filteredUsers.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-gray-500 font-medium">
                per page · {startIndex + 1}–
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-0.5">
                {getVisiblePages().map((page, idx) =>
                  typeof page === "string" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-gray-400 text-xs"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 text-xs font-semibold rounded-xl transition-all ${
                        currentPage === page
                          ? "bg-gray-800 text-white shadow-md"
                          : "text-gray-600 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setForm({
            fullName: "",
            email: "",
            password: "",
            role: "",
            state: "",
            states: [],
          });
        }}
        title="Create New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="officer@cac.gov.ng"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value, state: "" })
                }
                required
              >
                <option value="">Select a role</option>
                <option value="enforcement_head">Enforcement Head</option>
                <option value="state_controller">State Controller</option>
                <option value="officer">Field Officer</option>
              </select>
            </div>

            {form.role === "enforcement_head" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Assign States
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                  {NIGERIA_STATES.map((state) => {
                    const isAssigned = assignedStates.includes(state);
                    const isChecked = form.states.includes(state);
                    return (
                      <label
                        key={state}
                        className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${
                          isAssigned
                            ? "text-gray-400 cursor-not-allowed bg-gray-100/50"
                            : "cursor-pointer hover:bg-white transition-colors"
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={isAssigned}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                states: [...form.states, state],
                              });
                            } else {
                              setForm({
                                ...form,
                                states: form.states.filter((s) => s !== state),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="font-medium">{state}</span>
                        {isAssigned && (
                          <span className="text-[10px] font-semibold text-orange-500 ml-auto">
                            Assigned
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  States already assigned are disabled.
                </p>
              </div>
            )}

            {(form.role === "officer" || form.role === "state_controller") && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Assigned State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Enter state name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {form.role && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
              <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1.5">
                Permissions
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {form.role === "enforcement_head" &&
                  "Full access to all cases and users in assigned region"}
                {form.role === "state_controller" &&
                  "Manage cases and officers within assigned state"}
                {form.role === "officer" &&
                  "Create and manage cases, add compliance items"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setForm({
                  fullName: "",
                  email: "",
                  password: "",
                  role: "",
                  state: "",
                  states: [],
                });
              }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserDetail}
        onClose={() => {
          setShowUserDetail(false);
          setSelectedUserDetail(null);
        }}
        title="User Details"
      >
        {loadingUserDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 text-green-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading user details...</p>
            </div>
          </div>
        ) : selectedUserDetail ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-gray-600">
                    {selectedUserDetail.fullName?.charAt(0) ||
                      selectedUserDetail.email?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-800">
                    {selectedUserDetail.fullName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedUserDetail.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedUserDetail.role === "super_admin"
                          ? "bg-purple-500"
                          : selectedUserDetail.role === "enforcement_head"
                            ? "bg-blue-500"
                            : selectedUserDetail.role === "state_controller"
                              ? "bg-green-500"
                              : "bg-gray-400"
                      }`}
                    ></span>
                    <span className="text-[10px] font-semibold text-gray-600">
                      {formatRole(selectedUserDetail.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned States */}
            {selectedUserDetail.assignedStates &&
              selectedUserDetail.assignedStates.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Assigned States ({selectedUserDetail.assignedStates.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserDetail.assignedStates.map((state: string) => (
                      <div
                        key={state}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100 to-green-50 rounded-xl border border-green-200/50 hover:shadow-md transition-all"
                      >
                        <MapPin className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">
                          {state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    Active
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  2FA
                </p>
                <span className="text-xs font-medium text-gray-700">
                  {selectedUserDetail.twoFactorEnabled ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-gray-500">Disabled</span>
                  )}
                </span>
              </div>
            </div>

            {/* Permissions */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/50">
              <p className="text-[10px] text-blue-600 uppercase font-semibold tracking-wider mb-1.5">
                Permissions
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                {selectedUserDetail.role === "super_admin" &&
                  "Full system access with administrative privileges"}
                {selectedUserDetail.role === "enforcement_head" &&
                  "Full access to all cases and users in assigned states"}
                {selectedUserDetail.role === "state_controller" &&
                  "Manage cases and officers within assigned state"}
                {selectedUserDetail.role === "officer" &&
                  "Create and manage cases, add compliance items"}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowUserDetail(false);
                setSelectedUserDetail(null);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default UsersPage;
