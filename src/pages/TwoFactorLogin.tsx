import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginTwoFactor } from "../services/twoFactorService";
import OtpInput from "../components/OtpInput";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Scale,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const TwoFactorLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [twoFactorToken] = useState(
    () => sessionStorage.getItem("twoFactorToken") || "",
  );
  const [twoFactorUser] = useState(() => {
    const data = sessionStorage.getItem("twoFactorUser");
    return data ? JSON.parse(data) : null;
  });

  useEffect(() => {
    if (!twoFactorToken) {
      navigate("/");
    }
  }, [twoFactorToken, navigate]);

  const [timeRemaining, setTimeRemaining] = useState(
    30 - (Math.floor(Date.now() / 1000) % 30),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(30 - (Math.floor(Date.now() / 1000) % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!twoFactorToken) {
      setError("Session expired. Please sign in again.");
      return;
    }

    if (!useRecovery && otp.length !== 6) {
      setError("Enter the 6-digit code from your authenticator.");
      return;
    }

    if (useRecovery && recoveryCode.trim().length < 6) {
      setError("Enter a valid recovery code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginTwoFactor({
        token: twoFactorToken,
        otp: useRecovery ? undefined : otp,
        recoveryCode: useRecovery ? recoveryCode.trim() : undefined,
        rememberDevice,
      });

      login(res.user, res.token);
      setTimeout(() => {
        sessionStorage.removeItem("twoFactorToken");
        sessionStorage.removeItem("twoFactorUser");
        navigate("/dashboard");
      }, 0);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Side - Green Background with Content */}
      <div className="relative flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 overflow-hidden min-h-[40vh] lg:min-h-screen">
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
            Two-Factor
            <br />
            Authentication
          </h1>
          <p className="text-lg text-green-300/80 font-light mb-10 leading-relaxed max-w-md">
            Enter the verification code from your authenticator app to complete
            sign in.
          </p>

          {/* Security Features */}
          <div className="space-y-5 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Authenticator App
                </p>
                <p className="text-xs text-green-300/60 mt-0.5">
                  Codes refresh every 30 seconds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <KeyRound className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Recovery Codes
                </p>
                <p className="text-xs text-green-300/60 mt-0.5">
                  Use backup codes if you lose access
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Enhanced Security
                </p>
                <p className="text-xs text-green-300/60 mt-0.5">
                  Protects your account from unauthorized access
                </p>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-xs text-green-300/40 leading-relaxed max-w-md">
              This system is protected under the Cybercrime Act. Unauthorized
              access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - White Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white relative min-h-[60vh] lg:min-h-screen">
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
              Two-Factor Authentication
            </h1>
            <p className="text-xs text-gray-500 mt-1">Verify your identity</p>
          </div>

          {/* User Info Banner */}
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Signed in as
                </p>
                <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">
                  {twoFactorUser?.email || "user@cac.gov.ng"}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Verify your identity
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              {useRecovery
                ? "Enter a recovery code to sign in"
                : "Enter the 6-digit code from your authenticator app"}
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
            {/* OTP Input or Recovery Code */}
            {!useRecovery ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Authenticator Code
                </label>
                <OtpInput value={otp} onChange={setOtp} />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-500">
                      New code in{" "}
                      <span className="font-semibold text-green-600">
                        {timeRemaining}s
                      </span>
                    </p>
                  </div>
                  {/* Circular timer */}
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="2"
                        strokeDasharray={`${(timeRemaining / 30) * 88} 88`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Recovery Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(event) => setRecoveryCode(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                    placeholder="Enter a recovery code"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Recovery codes are one-time use only.
                </p>
              </div>
            )}

            {/* Remember Device */}
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(event) => setRememberDevice(event.target.checked)}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Remember this device
                </p>
                <p className="text-[11px] text-gray-400">
                  Skip 2FA on this device for 30 days
                </p>
              </div>
            </label>

            {/* Toggle Recovery/Authenticator */}
            <button
              type="button"
              onClick={() => {
                setUseRecovery(!useRecovery);
                setError("");
                setOtp("");
                setRecoveryCode("");
              }}
              className="w-full text-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors py-2"
            >
              {useRecovery ? (
                <span className="flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Use authenticator app instead
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Use recovery code instead
                </span>
              )}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-600/10 hover:shadow-xl hover:shadow-green-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {useRecovery ? "Verify Recovery Code" : "Verify Code"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                sessionStorage.removeItem("twoFactorToken");
                sessionStorage.removeItem("twoFactorUser");
                navigate("/");
              }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
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

export default TwoFactorLogin;
