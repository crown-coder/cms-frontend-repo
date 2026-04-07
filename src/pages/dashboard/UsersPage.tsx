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
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  UserCog,
  UserCheck,
  UserX,
} from "lucide-react";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border ${styles[type]} shadow-lg z-50 animate-slide-up`}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4">
        <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
};

const UsersPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const assignedStates = users
    .filter((u) => u.role === "enforcement_head")
    .flatMap((u) => u.states || []);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null,
  );

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
  /* =========================
     FETCH USERS
  ========================= */
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
    }
  };

  /* =========================
     TOAST NOTIFICATION
  ========================= */
  const showToast = (message: string, type: string = "success") => {
    setToast({ message, type });
  };

  /* =========================
     CREATE USER
  ========================= */
  const handleSubmit = async (e: any) => {
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

  /* =========================
     DELETE USER
  ========================= */
  const handleDelete = async (id: number, userName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      )
    )
      return;

    try {
      await deleteUser(id);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error deleting user", "error");
    }
  };

  /* =========================
     ROLE BADGE STYLES
  ========================= */
  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-700 border-purple-200",
      enforcement_head: "bg-blue-100 text-blue-700 border-blue-200",
      state_controller: "bg-green-100 text-green-700 border-green-200",
      officer: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return styles[role as keyof typeof styles] || styles.officer;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Shield className="w-4 h-4" />;
      case "enforcement_head":
        return <UserCog className="w-4 h-4" />;
      case "state_controller":
        return <Building2 className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /* =========================
     FILTER USERS
  ========================= */
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.state?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  /* =========================
     AUTHORIZATION CHECK
  ========================= */
  if (
    !["super_admin", "enforcement_head", "state_controller"].includes(
      user?.role || "",
    )
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
            <Shield className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>

        {/* Create User Button - Role Based */}
        {["super_admin", "enforcement_head"].includes(user?.role || "") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Create New User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {users.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {users.filter((u) => u.role === "super_admin").length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Enforcement Heads</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {users.filter((u) => u.role === "enforcement_head").length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">State Controllers</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {users.filter((u) => u.role === "state_controller").length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="enforcement_head">Enforcement Head</option>
            <option value="state_controller">State Controller</option>
            <option value="officer">Officer</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {u.fullName?.charAt(0) || u.email?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {u.fullName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(u.role)}`}
                      >
                        {getRoleIcon(u.role)}
                        {formatRole(u.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.states?.length > 0 ? (
                      <div className="text-sm text-gray-600">
                        {u.states.join(", ")}
                      </div>
                    ) : u.state ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {u.state}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {["super_admin", "enforcement_head"].includes(
                      user?.role || "",
                    ) && (
                      <button
                        onClick={() => handleDelete(u.id, u.fullName)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No users found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing{" "}
              <span className="font-medium">{filteredUsers.length}</span> of{" "}
              <span className="font-medium">{users.length}</span> users
            </span>
            <span className="text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* =========================
          CREATE USER MODAL
      ========================= */}
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
            states: [] as string[],
          });
        }}
        title="Create New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="e.g., officer@cac.gov.ng"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter secure password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                value={form.role}
                onChange={(e) => {
                  setForm({ ...form, role: e.target.value, state: "" });
                }}
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Assign States
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {NIGERIA_STATES.map((state) => {
                    const isAssigned = assignedStates.includes(state);
                    const isChecked = form.states.includes(state);

                    return (
                      <label
                        key={state}
                        className={`flex items-center gap-2 text-sm px-2 py-1 rounded
              ${isAssigned ? "text-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}
            `}
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
                        />

                        {state}

                        {isAssigned && (
                          <span className="text-xs text-red-400 ml-auto">
                            Assigned
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  States already assigned to another Enforcement Head are
                  disabled.
                </p>
              </div>
            )}

            {/* State Field - Conditional */}
            {(form.role === "officer" || form.role === "state_controller") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Enter state name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {form.role === "state_controller"
                    ? "State Controller will oversee this entire state"
                    : "Officer will be assigned to this state"}
                </p>
              </div>
            )}
          </div>

          {/* Role Summary */}
          {form.role && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <h4 className="text-xs font-medium text-blue-800 uppercase tracking-wider mb-1">
                Role Permissions
              </h4>
              <p className="text-sm text-blue-700">
                {form.role === "enforcement_head" &&
                  "Full access to all cases and users in assigned region"}
                {form.role === "state_controller" &&
                  "Manage cases and officers within assigned state"}
                {form.role === "officer" &&
                  "Create and manage cases, add compliance items"}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                  states: [] as string[],
                });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
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
