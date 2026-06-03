import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../types";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  ArrowRight,
  Loader2,
  Building2,
  Scale,
  CheckCircle,
} from "lucide-react";

type LoginResponse =
  | { token: string; user: User }
  | { status: "2FA_REQUIRED"; twoFactorToken: string; user: User };

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post<LoginResponse>("/auth/login", form);

      if ("status" in res.data && res.data.status === "2FA_REQUIRED") {
        sessionStorage.setItem("twoFactorToken", res.data.twoFactorToken);
        sessionStorage.setItem("twoFactorUser", JSON.stringify(res.data.user));
        navigate("/2fa");
        return;
      }

      sessionStorage.removeItem("twoFactorToken");
      sessionStorage.removeItem("twoFactorUser");
      const { user, token } = res.data as { token: string; user: User };
      login(user, token);
      setTimeout(() => navigate("/dashboard"), 0);
    } catch (err) {
      setError("Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Side - Green Background with Content */}
      <div className="relative flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 overflow-hidden min-h-[50vh] lg:min-h-screen">
        {/* Decorative elements */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:32px_32px]"></div>

        {/* Justice Scale Image - Blended in background */}
        <div className="absolute inset-0 opacity-[0.06] flex items-center justify-center pointer-events-none">
          <Scale className="w-[500px] h-[500px] text-white" strokeWidth={0.5} />
        </div>

        {/* Additional subtle scale pattern */}
        <div className="absolute top-10 right-10 opacity-[0.04] pointer-events-none">
          <Scale className="w-32 h-32 text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-10 left-10 opacity-[0.04] pointer-events-none">
          <Scale className="w-40 h-40 text-white" strokeWidth={0.5} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img src="/assets/logo.png" alt="" />
              </div>
            </div>
            <div>
              <p className="text-xs text-green-300/60 uppercase tracking-widest font-semibold">
                Government of Nigeria
              </p>
              <p className="text-sm text-green-300/80 font-medium">
                v1.0.0 • Secure
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Corporate Affairs
            <br />
            Commission
          </h1>
          <p className="text-lg text-green-300/80 font-light mb-10 leading-relaxed max-w-md">
            Compliance Management System for efficient enforcement and
            regulatory oversight.
          </p>

          {/* Features */}
          <div className="space-y-5 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Enforcement Management
                </p>
                <p className="text-xs text-green-300/60 mt-0.5">
                  Track and resolve compliance cases efficiently
                </p>
              </div>
            </div>
            {/* <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Company Registry
                </p>
                <p className="text-xs text-green-300/60 mt-0.5">
                  Access and verify registered business entities
                </p>
              </div>
            </div> */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Secure Access
                </p>
                <p className="text-xs text-green-300/60 mt-0.5">
                  Role-based authorization with 2FA protection
                </p>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-xs text-green-300/40 leading-relaxed max-w-md">
              This system is protected under the Cybercrime Act. Unauthorized
              access is strictly prohibited and will be prosecuted.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - White Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white relative min-h-[50vh] lg:min-h-screen">
        {/* Subtle pattern on white side */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.gray.100)_1px,transparent_0)] bg-[size:24px_24px] opacity-40"></div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo - visible only on small screens */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">CAC</span>
              </div>
            </div>
            <h1 className="text-lg font-bold text-gray-800">
              Corporate Affairs Commission
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Compliance Management System
            </p>
          </div>

          {/* Sign In Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-sm text-red-600 flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="leading-relaxed">{error}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className={`w-4 h-4 transition-colors ${focusedField === "email" ? "text-green-600" : "text-gray-400"}`}
                  />
                </div>
                <input
                  type="email"
                  value={form.email}
                  placeholder="officer@cac.gov.ng"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400 ${
                    focusedField === "email"
                      ? "border-green-500 bg-white ring-2 ring-green-500/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-green-600 hover:text-green-700 transition-colors font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`w-4 h-4 transition-colors ${focusedField === "password" ? "text-green-600" : "text-gray-400"}`}
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  placeholder="Enter your password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-12 py-3 text-sm bg-gray-50 border rounded-xl focus:outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400 ${
                    focusedField === "password"
                      ? "border-green-500 bg-white ring-2 ring-green-500/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-600/10 hover:shadow-xl hover:shadow-green-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              © 2026 Corporate Affairs Commission
            </p>
          </div>
        </div>
      </div>

      {/* Security indicator - fixed */}
      <div className="fixed top-4 right-4 text-xs text-gray-400 flex items-center gap-1.5 z-20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="tracking-wider font-medium">v1.0.0</span>
      </div>
    </div>
  );
};

export default Login;
