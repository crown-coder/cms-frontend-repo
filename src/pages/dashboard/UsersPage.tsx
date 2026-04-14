import { useState, useEffect, useContext } from "react";
import { createUser, getUsers, deleteUser } from "../../services/userService";
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
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-60px)]">
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
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${styles[type]} shadow-lg z-50`}
    >
      {icons[type]}
      <p className="text-xs font-medium">{message}</p>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const assignedStates = users
    .filter((u) => u.role === "enforcement_head")
    .flatMap((u) => u.states || []);

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
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift(-1);
    if (currentPage + delta < totalPages - 1) range.push(-1);
    return range;
  };

  // Stats
  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "blue" },
    {
      label: "Super Admins",
      value: users.filter((u) => u.role === "super_admin").length,
      icon: Shield,
      color: "purple",
    },
    {
      label: "Enforcement Heads",
      value: users.filter((u) => u.role === "enforcement_head").length,
      icon: UserCog,
      color: "blue",
    },
    {
      label: "Controllers",
      value: users.filter((u) => u.role === "state_controller").length,
      icon: Building2,
      color: "green",
    },
  ];

  const getStatColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: "bg-blue-50", text: "text-blue-600" },
      purple: { bg: "bg-purple-50", text: "text-purple-600" },
      green: { bg: "bg-green-50", text: "text-green-600" },
    };
    return colors[color] || colors.blue;
  };

  if (
    !["super_admin", "enforcement_head", "state_controller"].includes(
      user?.role || "",
    )
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-sm font-medium text-gray-700 mb-1">
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-700">Loading users</p>
          <p className="text-xs text-gray-400 mt-1">Fetching user data...</p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-light text-gray-800 tracking-tight">
            Users
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"} total
          </p>
        </div>

        {["super_admin", "enforcement_head"].includes(user?.role || "") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New User</span>
          </button>
        )}
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorStyle = getStatColor(stat.color);
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-xl font-semibold text-gray-800 mt-0.5">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 ${colorStyle.bg} rounded-lg`}>
                  <Icon className={`w-4 h-4 ${colorStyle.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or state..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {roleFilter !== "all" && (
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
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
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                          {u.fullName?.charAt(0) || u.email?.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getRoleDot(u.role)}`}
                      ></span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadge(u.role)}`}
                      >
                        {getRoleIcon(u.role)}
                        {formatRole(u.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.states?.length > 0 ? (
                      <span className="text-xs text-gray-600">
                        {u.states.slice(0, 2).join(", ")}
                        {u.states.length > 2 && "..."}
                      </span>
                    ) : u.state ? (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {u.state}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-gray-600">Active</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {["super_admin", "enforcement_head"].includes(
                      user?.role || "",
                    ) &&
                      u.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.fullName)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 bg-white"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <span className="text-xs text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {totalPages <= 7 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )
              ) : (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                      currentPage === 1
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    1
                  </button>

                  {getVisiblePages().map((page, idx) =>
                    page === -1 ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-green-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  placeholder="Enter full name"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="officer@cac.gov.ng"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
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
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Assign States
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {NIGERIA_STATES.map((state) => {
                    const isAssigned = assignedStates.includes(state);
                    const isChecked = form.states.includes(state);
                    return (
                      <label
                        key={state}
                        className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                          isAssigned
                            ? "text-gray-400 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-50"
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
                          className="w-3.5 h-3.5"
                        />
                        {state}
                        {isAssigned && (
                          <span className="text-[10px] text-orange-500 ml-auto">
                            Assigned
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  States already assigned are disabled.
                </p>
              </div>
            )}

            {(form.role === "officer" || form.role === "state_controller") && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Assigned State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    placeholder="Enter state name"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
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
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                Permissions
              </p>
              <p className="text-xs text-gray-700">
                {form.role === "enforcement_head" &&
                  "Full access to cases and users in assigned region"}
                {form.role === "state_controller" &&
                  "Manage cases and officers within assigned state"}
                {form.role === "officer" &&
                  "Create and manage cases, add compliance items"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
