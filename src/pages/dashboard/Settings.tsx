import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updatePassword } from "../../services/userService";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Mail,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to change password. Please check your current password.";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { label: "Weak", color: "bg-red-500" },
      { label: "Fair", color: "bg-orange-500" },
      { label: "Good", color: "bg-yellow-500" },
      { label: "Strong", color: "bg-green-500" },
    ];

    return {
      strength: Math.min(strength, 4),
      label: levels[Math.min(strength, 3)]?.label || "",
      color: levels[Math.min(strength, 3)]?.color || "",
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-purple-50 text-purple-600 border-purple-200",
      enforcement_head: "bg-blue-50 text-blue-600 border-blue-200",
      state_controller: "bg-green-50 text-green-600 border-green-200",
      officer: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return colors[role] || colors.officer;
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-light text-gray-800 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your account and security preferences
        </p>
      </div>

      {/* Account Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">
            Account Information
          </h2>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                  Full Name
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {user?.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                  Role
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadgeColor(user?.role || "")}`}
                >
                  {formatRole(user?.role || "")}
                </span>
              </div>
            </div>

            {user?.state && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                    State
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.state}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-green-600" />
            </div>
            <h2 className="text-sm font-medium text-gray-700">
              Change Password
            </h2>
          </div>
        </div>

        <div className="p-5">
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{
                          width: `${(passwordStrength.strength / 4) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <ul className="text-[10px] text-gray-400 space-y-0.5">
                    <li
                      className={
                        passwordForm.newPassword.length >= 8
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • At least 8 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(passwordForm.newPassword) &&
                        /[a-z]/.test(passwordForm.newPassword)
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • Mix of uppercase & lowercase
                    </li>
                    <li
                      className={
                        /\d/.test(passwordForm.newPassword)
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • At least one number
                    </li>
                    <li
                      className={
                        /[^A-Za-z0-9]/.test(passwordForm.newPassword)
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  className={`w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50 ${
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </p>
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-600 flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Security Tips - Compact */}
      <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-4">
        <p className="text-[11px] text-gray-500 flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <span>
            Use a strong, unique password. We recommend using a password manager
            to generate and store secure passwords.
          </span>
        </p>
      </div>
    </div>
  );
};

export default Settings;
