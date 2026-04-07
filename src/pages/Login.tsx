import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import type { User } from "../types";

interface LoginResponse {
  token: string;
  user: User;
}

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Security Badge - subtle authority indicator */}
      <div className="fixed top-4 right-4 text-xs text-gray-500 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 bg-green-700 rounded-full"></span>
        <span>Secured by CAC • v2.4.0</span>
      </div>

      <div className="w-full max-w-md">
        {/* Header with official branding */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-white rounded-xl shadow-sm mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CAC</span>
            </div>
          </div>
          <h1 className="text-2xl font-light text-gray-700 mb-1">
            Corporate Affairs Commission
          </h1>
          <p className="text-sm text-gray-500">Compliance Management System</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">
              Authorized Personnel Only
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to access the system
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-8 mt-6 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  placeholder="e.g., officer@cac.gov.ng"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors text-gray-700 placeholder-gray-400"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={form.password}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors text-gray-700 placeholder-gray-400"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-green-700 to-green-800 text-white py-3 px-4 rounded-lg font-medium hover:from-green-800 hover:to-green-900 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Access System"
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                This is a restricted government system. Unauthorized access is
                prohibited and may result in criminal prosecution under the
                Cybercrime Act.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            © 2026 Corporate Affairs Commission. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
