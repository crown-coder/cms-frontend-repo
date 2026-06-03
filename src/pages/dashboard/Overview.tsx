import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboardService";
import type { DashboardSummary } from "../../types";
import {
  Scale,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  CalendarDays,
  Shield,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  AlertCircle,
  Building2,
} from "lucide-react";

const Overview = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getComplianceRate = (): number => {
    if (!data) return 0;
    const total = data.totalCases;
    if (total === 0) return 0;
    return Math.round((data.resolvedCases / total) * 100);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center mx-auto">
              <RefreshCw className="w-7 h-7 text-green-600 animate-spin" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">
            Loading dashboard
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Fetching compliance data...
          </p>
        </div>
      </div>
    );
  }

  const complianceRate = getComplianceRate();
  const totalPenalty = Number(data.totalPenalty) || 0;
  const outstandingBalance = Number(data.outstandingBalance) || 0;

  const outstandingPercentage =
    totalPenalty > 0
      ? Math.round((outstandingBalance / totalPenalty) * 100)
      : 0;

  const casesByState = data.casesByState || [];

  // Metric cards with iOS-style design
  const metricCards = [
    {
      label: "Total Cases",
      value: data.totalCases?.toLocaleString() || "0",
      icon: Scale,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: { value: "12%", positive: true, label: "vs last month" },
    },
    {
      label: "Pending Cases",
      value: data.pendingCases?.toLocaleString() || "0",
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50",
      iconColor: "text-orange-600",
      alert: true,
      alertLabel: "Needs attention",
    },
    {
      label: "Resolved Cases",
      value: data.resolvedCases?.toLocaleString() || "0",
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      iconColor: "text-green-600",
      progress: complianceRate,
      progressLabel: "resolution rate",
    },
    {
      label: "Compliance Rate",
      value: `${complianceRate}%`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: { value: "On track", positive: true, label: "above target" },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header - Glassmorphism style */}
      <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg shadow-black/5 p-6">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">
                {new Date().toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 text-xs font-medium bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-600 shadow-sm"
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/80 rounded-full transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-full hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assigned States Card */}
      {data.assignedStates && data.assignedStates.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-700">
                  Assigned States
                </h3>
                <p className="text-[10px] text-gray-400">
                  {data.assignedStates.length}{" "}
                  {data.assignedStates.length === 1 ? "state" : "states"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {data.assignedStates.map((state: string) => (
                <span
                  key={state}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 text-purple-700 rounded-lg text-xs font-medium border border-purple-100/50 transition-colors hover:bg-purple-100/80"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                  {state}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics - Glass cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-5 hover:shadow-lg hover:shadow-black/10 hover:scale-[1.02] transition-all duration-300"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 ${card.bgLight} rounded-xl`}>
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  {card.trend && (
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${card.trend.positive ? "text-green-600" : "text-red-600"}`}
                    >
                      {card.trend.positive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{card.trend.value}</span>
                    </div>
                  )}
                  {card.alert && (
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-medium mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-800 tracking-tight">
                  {card.value}
                </p>

                {/* Footer */}
                <div className="mt-3">
                  {card.trend && (
                    <p className="text-[11px] text-gray-400">
                      {card.trend.label}
                    </p>
                  )}

                  {card.alert && (
                    <p className="text-[11px] text-orange-600 font-medium">
                      {card.alertLabel}
                    </p>
                  )}

                  {card.progress !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(card.progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">
                        {card.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary - Glass cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <DollarSign className="w-3 h-3 text-gray-600" />
            </div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Penalty
            </p>
          </div>
          <p className="text-lg font-bold text-gray-800 tracking-tight">
            {formatCurrency(Number(data.totalPenalty) || 0)}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <TrendingUp className="w-3 h-3 text-green-600" />
            </div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Paid
            </p>
          </div>
          <p className="text-lg font-bold text-green-600 tracking-tight">
            {formatCurrency(Number(data.totalPaid) || 0)}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <CheckCircle className="w-3 h-3 text-gray-600" />
            </div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Waived
            </p>
          </div>
          <p className="text-lg font-bold text-gray-700 tracking-tight">
            {formatCurrency(Number(data.totalWaived) || 0)}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <AlertCircle className="w-3 h-3 text-orange-600" />
            </div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Outstanding
            </p>
          </div>
          <p className="text-lg font-bold text-orange-600 tracking-tight">
            {formatCurrency(data.outstandingBalance || 0)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                style={{ width: `${Math.min(outstandingPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-500">
              {outstandingPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Cases by State - Glass card */}
      {casesByState.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">
                Cases by State
              </h3>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full ml-auto">
                Last 30 days
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-0.5">
              {casesByState.slice(0, 5).map((item) => {
                const percentage = Math.min(
                  Math.round((item.total / (data.totalCases || 1)) * 100),
                  100,
                );
                return (
                  <div
                    key={item.state}
                    className="flex items-center gap-4 py-2.5 group hover:bg-white/50 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2 w-24">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {item.state}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-12 text-right">
                      {item.total?.toLocaleString()}
                    </span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            percentage > 20
                              ? "bg-gradient-to-r from-orange-500 to-orange-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {casesByState.length > 5 && (
              <button className="mt-4 text-xs font-semibold text-green-600 flex items-center gap-1 hover:text-green-700 transition-colors">
                View all {casesByState.length} states
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400">
                {casesByState.length} states
              </span>
              <span className="text-[11px] font-medium text-gray-600">
                Total: {data.totalCases?.toLocaleString() || 0} cases
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - iOS style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: FileText,
            label: "Generate Report",
            badge: "PDF",
            gradient: "from-blue-500 to-blue-600",
          },
          {
            icon: Scale,
            label: "View Cases",
            badge: data.pendingCases || "0",
            gradient: "from-green-500 to-green-600",
          },
          {
            icon: CalendarDays,
            label: "Schedule",
            badge: "New",
            gradient: "from-purple-500 to-purple-600",
          },
          {
            icon: Shield,
            label: "Audit Trail",
            badge: "Logs",
            gradient: "from-gray-500 to-gray-600",
          },
        ].map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="group relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full">
                  {action.badge}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-3 text-left">
                {action.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Overview;
