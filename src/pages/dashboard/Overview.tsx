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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700">Loading dashboard</p>
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

  // Card configuration with colors
  const metricCards = [
    {
      label: "Total Cases",
      value: data.totalCases?.toLocaleString() || "0",
      icon: Scale,
      color: "green" as const,
      trend: { value: "+12%", label: "from last month", positive: true },
      subtitle: "All time",
    },
    {
      label: "Pending Cases",
      value: data.pendingCases?.toLocaleString() || "0",
      icon: Clock,
      color: "orange" as const,
      alert: true,
      alertLabel: "Requires attention",
      subtitle: "Active",
    },
    {
      label: "Resolved Cases",
      value: data.resolvedCases?.toLocaleString() || "0",
      icon: CheckCircle,
      color: "green" as const,
      progress: complianceRate,
      progressLabel: "resolved",
      subtitle: "Resolved",
    },
    {
      label: "Compliance Rate",
      value: `${complianceRate}%`,
      icon: TrendingUp,
      color: "green" as const,
      trend: { value: "Above target", positive: true },
      subtitle: "Performance",
    },
  ];

  const getColorClasses = (color: "green" | "orange") => {
    const colors = {
      green: {
        iconBg: "bg-green-50",
        icon: "text-green-600",
        value: "text-gray-800",
        trend: "text-green-600",
        alert: "text-orange-600",
        progressBg: "bg-green-600",
      },
      orange: {
        iconBg: "bg-orange-50",
        icon: "text-orange-600",
        value: "text-gray-800",
        trend: "text-green-600",
        alert: "text-orange-600",
        progressBg: "bg-orange-500",
      },
    };
    return colors[color];
  };

  return (
    <div className="space-y-8">
      {/* Header - Clean and minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-light text-gray-800 tracking-tight">
            Overview
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Controls - Refined */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-white text-gray-600"
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
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid - Sleek cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {card.subtitle}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p
                className={`text-2xl font-semibold ${colors.value} tracking-tight`}
              >
                {card.value}
              </p>

              {/* Footer - Trend or Progress */}
              <div className="mt-3">
                {card.trend && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-[11px] text-green-600 font-medium">
                      {card.trend.value}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {card.trend.label}
                    </span>
                  </div>
                )}

                {card.alert && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    <span className="text-[11px] text-orange-600 font-medium">
                      {card.alertLabel}
                    </span>
                  </div>
                )}

                {card.progress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.progressBg} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(card.progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {card.progress}% {card.progressLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary - Compact cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            Total Penalty
          </p>
          <p className="text-xl font-semibold text-gray-800 tracking-tight">
            {formatCurrency(Number(data.totalPenalty) || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            Total Paid
          </p>
          <p className="text-xl font-semibold text-green-600 tracking-tight">
            {formatCurrency(Number(data.totalPaid) || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            Total Waived
          </p>
          <p className="text-xl font-semibold text-gray-700 tracking-tight">
            {formatCurrency(Number(data.totalWaived) || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            Outstanding
          </p>
          <p className="text-xl font-semibold text-orange-600 tracking-tight">
            {formatCurrency(data.outstandingBalance || 0)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(outstandingPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {outstandingPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Cases by State - Clean table */}
      {casesByState.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-700">
                Cases by State
              </h3>
              <span className="text-[10px] text-gray-400 ml-auto">
                Last 30 days
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-1">
              {casesByState.slice(0, 5).map((item) => {
                const percentage = Math.min(
                  Math.round((item.total / (data.totalCases || 1)) * 100),
                  100,
                );
                return (
                  <div
                    key={item.state}
                    className="flex items-center gap-4 py-2.5 group hover:bg-gray-50/50 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-700 w-24 truncate">
                      {item.state}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {item.total?.toLocaleString()}
                    </span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage > 20 ? "bg-orange-500" : "bg-green-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {casesByState.length > 5 && (
              <button className="mt-4 text-xs text-green-600 font-medium flex items-center gap-1 hover:text-green-700 transition-colors">
                View all {casesByState.length} states
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {casesByState.length} states
              </span>
              <span className="text-[11px] text-gray-500">
                Total: {data.totalCases?.toLocaleString() || 0} cases
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Minimal buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Generate Report", badge: "PDF" },
          { icon: Scale, label: "View Cases", badge: data.pendingCases || "0" },
          { icon: CalendarDays, label: "Schedule", badge: "New" },
          { icon: Shield, label: "Audit Trail", badge: "Logs" },
        ].map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="group flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-green-50 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                  {action.label}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 group-hover:text-green-600 transition-colors">
                {action.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Overview;
