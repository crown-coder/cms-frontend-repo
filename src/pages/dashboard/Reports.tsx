import { useEffect, useState } from "react";
import { generateReport } from "../../services/reportService";
import {
  FileText,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  CalendarDays,
  FileOutput,
  Shield,
  Clock,
  TrendingUp,
  DollarSign,
  FileCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const Reports = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quick date presets
  const [activePreset, setActivePreset] = useState<string>("30days");

  // Initialize dates (default to last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    let start = new Date();

    switch (preset) {
      case "7days":
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "thisYear":
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case "lastYear":
        start = new Date(today.getFullYear() - 1, 0, 1);
        break;
      default:
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate) {
      setError("Both start and end dates are required");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setIsLoading(true);
      const pdfBlob = await generateReport(start, end);

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compliance-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Report generated and downloaded successfully");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error("Failed to generate report:", err);
      setError(err.response?.data?.message || "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRangeLabel = () => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  const datePresets = [
    { id: "7days", label: "Last 7 days" },
    { id: "30days", label: "Last 30 days" },
    { id: "90days", label: "Last 90 days" },
    { id: "thisYear", label: "This year" },
    { id: "lastYear", label: "Last year" },
  ];

  const reportIncludes = [
    { icon: TrendingUp, text: "Executive summary with key metrics" },
    { icon: FileText, text: "Detailed case information and status" },
    { icon: CheckCircle, text: "Compliance tracking details" },
    { icon: DollarSign, text: "Financial summary (penalties & payments)" },
    { icon: Clock, text: "Payment status and outstanding balances" },
  ];

  return (
    <div className="space-y-5">
      {/* Header - Glass card */}
      <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg shadow-black/5 p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              Reports
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Generate and download compliance reports as PDF
            </p>
          </div>

          {startDate && endDate && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700">
                {getDateRangeLabel()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="p-4 bg-red-50/90 backdrop-blur-xl border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50/90 backdrop-blur-xl border border-green-200 rounded-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-green-600">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Form - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">
                Generate Report
              </h2>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleGenerateReport} className="space-y-6">
              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Quick Select
                </label>
                <div className="flex flex-wrap gap-2">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-full transition-all ${
                        activePreset === preset.id
                          ? "bg-gray-800 text-white shadow-md"
                          : "bg-white/80 text-gray-500 hover:bg-white border border-gray-200/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setActivePreset("");
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setActivePreset("");
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range Indicator */}
              {startDate && endDate && (
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CalendarDays className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        {new Date(startDate).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" — "}
                        {new Date(endDate).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {getDateRangeLabel()} selected
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/10 hover:shadow-xl hover:shadow-green-600/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Generating Report...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Generate & Download PDF
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Report Info */}
        <div className="space-y-5">
          {/* Report Details Card */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <FileOutput className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Report Details
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Type</span>
                <span className="text-xs font-semibold text-gray-700">
                  Compliance & Case Summary
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Format</span>
                <span className="text-xs font-semibold text-gray-700">
                  PDF Document
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500">Access</span>
                <span className="text-xs font-semibold text-gray-700">
                  Role-Based Filtering
                </span>
              </div>
            </div>
          </div>

          {/* What's Included Card */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <FileCheck className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">
                  What's Included
                </h2>
              </div>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {reportIncludes.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pt-1">
                        {item.text}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-gray-50/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-5 flex items-start gap-3">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Reports are generated based on your role permissions. Sensitive
              data is protected and access is logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
