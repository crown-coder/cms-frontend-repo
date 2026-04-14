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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle background pattern - adds texture without being distracting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.gray.200)_1px,transparent_0)] bg-[size:40px_40px] opacity-40"></div>

      {/* Minimal security indicator */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 text-xs text-gray-400 flex items-center gap-1.5 z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
        </span>
        <span className="tracking-wide">v2.4.0</span>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Refined header - cleaner and more balanced */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-green-700 to-green-800 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-green-900/5">
              <span className="text-white font-semibold text-xl tracking-tight">
                CAC
              </span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-gray-800 tracking-tight">
            Corporate Affairs Commission
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-light">
            Compliance Management System
          </p>
        </div>

        {/* Login card - cleaner with better spacing */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-4">
            <h2 className="text-base font-medium text-gray-800 tracking-tight">
              Sign in to continue
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Authorized access only
            </p>
          </div>

          {/* Error message - more refined */}
          {error && (
            <div className="mx-6 sm:mx-8 mb-4 p-3.5 bg-red-50/80 rounded-xl border border-red-100">
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

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8 pt-2">
            <div className="space-y-5">
              {/* Email field - refined */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={form.email}
                    placeholder="officer@cac.gov.ng"
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600 transition-all duration-200 text-gray-700 placeholder:text-gray-400 bg-gray-50/50 group-hover:bg-white"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
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

              {/* Password field - refined with show/hide */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-green-700 hover:text-green-800 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600 transition-all duration-200 text-gray-700 placeholder:text-gray-400 bg-gray-50/50 group-hover:bg-white"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg
                        className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button - refined */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-7 bg-gradient-to-b from-green-700 to-green-800 text-white py-2.5 px-4 rounded-xl text-sm font-medium hover:from-green-800 hover:to-green-900 focus:outline-none focus:ring-2 focus:ring-green-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Verifying...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Security notice - cleaner */}
            <p className="mt-5 text-[11px] text-gray-400 text-center leading-relaxed">
              Restricted system. Unauthorized access is prohibited and
              prosecutable under the Cybercrime Act.
            </p>
          </form>
        </div>

        {/* Footer - minimal */}
        <p className="text-center mt-6 text-[11px] text-gray-400">
          © 2026 Corporate Affairs Commission
        </p>
      </div>
    </div>
  );
};

export default Login;
