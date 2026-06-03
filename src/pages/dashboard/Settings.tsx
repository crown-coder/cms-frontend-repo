import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updatePassword } from "../../services/userService";
import {
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  resetTwoFactor,
} from "../../services/twoFactorService";
import TwoFactorQr from "../../components/TwoFactorQr";
import OtpInput from "../../components/OtpInput";
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
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Smartphone,
  Copy,
  Check,
  Download,
} from "lucide-react";

const Settings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<"account" | "password" | "2fa">(
    "account",
  );
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
  const [copied, setCopied] = useState(false);

  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{
    qrCode: string;
    manualKey: string;
  } | null>(null);
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [twoFactorRecoveryCodes, setTwoFactorRecoveryCodes] = useState<
    string[]
  >([]);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorSuccess, setTwoFactorSuccess] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [disableForm, setDisableForm] = useState({
    password: "",
    otp: "",
    recoveryCode: "",
  });
  const [disableUseRecovery, setDisableUseRecovery] = useState(false);
  const [disableError, setDisableError] = useState("");
  const [disableSuccess, setDisableSuccess] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);

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

  const handleBeginTwoFactorSetup = async () => {
    setTwoFactorError("");
    setTwoFactorSuccess("");
    setTwoFactorRecoveryCodes([]);
    setTwoFactorLoading(true);

    try {
      const res = await setupTwoFactor();
      setTwoFactorSetupData({ qrCode: res.qrCode, manualKey: res.manualKey });
    } catch (error: any) {
      setTwoFactorError(
        error?.response?.data?.message || "Failed to start 2FA setup.",
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (twoFactorOtp.length !== 6) {
      setTwoFactorError("Enter the 6-digit code from your authenticator.");
      return;
    }
    setTwoFactorError("");
    setTwoFactorSuccess("");
    setTwoFactorLoading(true);

    try {
      const res = await verifyTwoFactor(twoFactorOtp);
      setTwoFactorRecoveryCodes(res.recoveryCodes || []);
      setTwoFactorSuccess("Two-factor authentication enabled.");
      setTwoFactorSetupData(null);
      setTwoFactorOtp("");
      if (user) updateUser({ ...user, twoFactorEnabled: true });
    } catch (error: any) {
      setTwoFactorError(
        error?.response?.data?.message || "Failed to verify code.",
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setDisableError("");
    setDisableSuccess("");
    if (!disableForm.password) {
      setDisableError("Enter your password to continue.");
      return;
    }
    if (!disableUseRecovery && disableForm.otp.length !== 6) {
      setDisableError("Enter the 6-digit authenticator code.");
      return;
    }
    if (disableUseRecovery && !disableForm.recoveryCode.trim()) {
      setDisableError("Enter a recovery code.");
      return;
    }
    setTwoFactorLoading(true);
    try {
      await disableTwoFactor({
        password: disableForm.password,
        otp: disableUseRecovery ? undefined : disableForm.otp,
        recoveryCode: disableUseRecovery
          ? disableForm.recoveryCode.trim()
          : undefined,
      });
      setDisableSuccess("Two-factor authentication disabled.");
      setDisableForm({ password: "", otp: "", recoveryCode: "" });
      setDisableUseRecovery(false);
      setTwoFactorRecoveryCodes([]);
      if (user) updateUser({ ...user, twoFactorEnabled: false });
    } catch (error: any) {
      setDisableError(
        error?.response?.data?.message || "Failed to disable 2FA.",
      );
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleResetTwoFactor = async () => {
    setDisableError("");
    setDisableSuccess("");
    if (!disableForm.password || !disableForm.recoveryCode.trim()) {
      setDisableError("Password and recovery code are required.");
      return;
    }
    setTwoFactorLoading(true);
    try {
      await resetTwoFactor({
        password: disableForm.password,
        recoveryCode: disableForm.recoveryCode.trim(),
      });
      setDisableSuccess("2FA reset. Please set up again.");
      setDisableForm({ password: "", otp: "", recoveryCode: "" });
      setDisableUseRecovery(false);
      setTwoFactorRecoveryCodes([]);
      if (user) updateUser({ ...user, twoFactorEnabled: false });
    } catch (error: any) {
      setDisableError(error?.response?.data?.message || "Failed to reset 2FA.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCodes = () => {
    const content = twoFactorRecoveryCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "", percentage: 0 };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    const levels = [
      { label: "Weak", color: "from-red-500 to-red-400" },
      { label: "Fair", color: "from-orange-500 to-orange-400" },
      { label: "Good", color: "from-yellow-500 to-yellow-400" },
      { label: "Strong", color: "from-green-500 to-emerald-400" },
    ];
    return {
      strength,
      percentage: (strength / 4) * 100,
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

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "password" as const, label: "Password", icon: Lock },
    { id: "2fa" as const, label: "Two-Factor", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-5">
      {/* Header - Glass card */}
      <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg shadow-black/5 p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Manage your account and security
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Account Information Tab */}
      {activeTab === "account" && (
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">
                Account Information
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {user?.fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Role
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(user?.role || "")}`}
                  >
                    {formatRole(user?.role || "")}
                  </span>
                </div>
              </div>
              {user?.state ? (
                <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      State
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {user.state}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Status
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      Active Account
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Password Form */}
          <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Change Password
                </h2>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
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

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all ${
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                    passwordForm.newPassword !==
                      passwordForm.confirmPassword && (
                      <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not
                        match
                      </p>
                    )}
                </div>

                {passwordError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{passwordError}</p>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-600">{passwordSuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Password Requirements Sidebar */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Requirements
                </h2>
              </div>
            </div>
            <div className="p-6">
              {passwordForm.newPassword ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Strength
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${passwordStrength.color} rounded-full transition-all duration-500`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      />
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {[
                      {
                        check: passwordForm.newPassword.length >= 8,
                        text: "At least 8 characters",
                      },
                      {
                        check:
                          /[A-Z]/.test(passwordForm.newPassword) &&
                          /[a-z]/.test(passwordForm.newPassword),
                        text: "Uppercase & lowercase letters",
                      },
                      {
                        check: /\d/.test(passwordForm.newPassword),
                        text: "At least one number",
                      },
                      {
                        check: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
                        text: "Special character",
                      },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className={`text-[11px] flex items-center gap-2 ${item.check ? "text-green-600 font-medium" : "text-gray-400"}`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${item.check ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}
                        >
                          {item.check ? "✓" : "○"}
                        </span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6">
                  <KeyRound className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500">
                    Enter a new password to see strength requirements
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === "2fa" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main 2FA Content */}
          <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Two-Factor Authentication
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Status Banner */}
              <div
                className={`p-5 rounded-2xl border ${user?.twoFactorEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.twoFactorEnabled ? "bg-green-100" : "bg-gray-200"}`}
                    >
                      <ShieldCheck
                        className={`w-5 h-5 ${user?.twoFactorEnabled ? "text-green-600" : "text-gray-400"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {user?.twoFactorEnabled
                          ? "2FA is enabled"
                          : "2FA is not enabled"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user?.twoFactorEnabled
                          ? "Your account is protected"
                          : "Add an extra layer of security"}
                      </p>
                    </div>
                  </div>
                  {!user?.twoFactorEnabled && (
                    <button
                      type="button"
                      onClick={handleBeginTwoFactorSetup}
                      disabled={twoFactorLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-indigo-600/20"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      {twoFactorLoading ? "Preparing..." : "Enable 2FA"}
                    </button>
                  )}
                </div>
              </div>

              {/* Setup QR Code */}
              {!user?.twoFactorEnabled && twoFactorSetupData && (
                <div className="p-6 bg-gray-50 rounded-2xl space-y-5">
                  <p className="text-xs font-semibold text-gray-600">
                    Scan this QR code with your authenticator app
                  </p>
                  <TwoFactorQr
                    qrCode={twoFactorSetupData.qrCode}
                    manualKey={twoFactorSetupData.manualKey}
                  />
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Manual Key
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-sm font-mono text-gray-700 break-all">
                        {twoFactorSetupData.manualKey}
                      </code>
                      <button
                        onClick={() =>
                          handleCopyKey(twoFactorSetupData.manualKey)
                        }
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Verification Code
                    </label>
                    <OtpInput value={twoFactorOtp} onChange={setTwoFactorOtp} />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyTwoFactor}
                    disabled={twoFactorLoading}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md shadow-indigo-600/20"
                  >
                    {twoFactorLoading ? "Verifying..." : "Verify & Enable"}
                  </button>
                </div>
              )}

              {/* Recovery Codes */}
              {twoFactorRecoveryCodes.length > 0 && (
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-indigo-700">
                        Recovery Codes
                      </p>
                      <p className="text-xs text-indigo-500">
                        Save these codes in a safe place
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {twoFactorRecoveryCodes.map((code) => (
                      <span
                        key={code}
                        className="text-xs font-bold font-mono text-indigo-800 bg-white px-3 py-2 rounded-lg text-center border border-indigo-200"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleDownloadCodes}
                    className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Download className="w-3.5 h-3.5" /> Download codes
                  </button>
                </div>
              )}

              {/* Disable/Reset 2FA */}
              {user?.twoFactorEnabled && (
                <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Disable Two-Factor Authentication
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showDisablePassword ? "text" : "password"}
                        value={disableForm.password}
                        onChange={(event) =>
                          setDisableForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowDisablePassword(!showDisablePassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showDisablePassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {!disableUseRecovery ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Authenticator Code
                      </label>
                      <OtpInput
                        value={disableForm.otp}
                        onChange={(value) =>
                          setDisableForm((prev) => ({ ...prev, otp: value }))
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Recovery Code
                      </label>
                      <input
                        type="text"
                        value={disableForm.recoveryCode}
                        onChange={(event) =>
                          setDisableForm((prev) => ({
                            ...prev,
                            recoveryCode: event.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Enter a recovery code"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setDisableUseRecovery(!disableUseRecovery)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {disableUseRecovery
                      ? "Use authenticator code instead"
                      : "Use recovery code instead"}
                  </button>
                  {disableError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-600">{disableError}</p>
                    </div>
                  )}
                  {disableSuccess && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-600">{disableSuccess}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleDisableTwoFactor}
                      disabled={twoFactorLoading}
                      className="flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Disable 2FA
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTwoFactor}
                      disabled={twoFactorLoading}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-60 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset with Recovery
                      Code
                    </button>
                  </div>
                </div>
              )}

              {twoFactorError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{twoFactorError}</p>
                </div>
              )}
              {twoFactorSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-600">{twoFactorSuccess}</p>
                </div>
              )}
            </div>
          </div>

          {/* 2FA Info Sidebar */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  About 2FA
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-600">1</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Download an app
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Google Authenticator, Authy, or Microsoft Authenticator
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-600">2</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Scan QR code
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Use the app to scan the QR code we provide
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-600">3</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Enter the code
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Input the 6-digit code to verify setup
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-600">4</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Save recovery codes
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Store codes safely for account recovery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tip */}
      <div className="bg-gray-50/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-5 flex items-start gap-3">
        <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500 leading-relaxed">
          Use a strong, unique password and enable two-factor authentication for
          maximum security. We recommend using a password manager to generate
          and store secure passwords.
        </p>
      </div>
    </div>
  );
};

export default Settings;
