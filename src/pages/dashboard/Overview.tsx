import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboardService";
import type { DashboardSummary } from "../../types";
import {
  Scale,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">
              Loading dashboard data...
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Please wait while we fetch the latest compliance information
            </p>
          </div>
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

  // Safely handle casesByState with fallback
  const casesByState = data.casesByState || [];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-800">
              Dashboard Overview
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 bg-white"
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* Export Button */}
            <button
              onClick={() => {
                // Add export functionality here
                console.log("Export report");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Export report"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cases Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-400">All time</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Cases</p>
          <p className="text-3xl font-semibold text-gray-800">
            {data.totalCases?.toLocaleString() || 0}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from last month</span>
          </div>
        </div>

        {/* Pending Cases Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Pending Cases</p>
          <p className="text-3xl font-semibold text-gray-800">
            {data.pendingCases?.toLocaleString() || 0}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Requires attention</span>
          </div>
        </div>

        {/* Resolved Cases Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-400">Resolved</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Resolved Cases</p>
          <p className="text-3xl font-semibold text-gray-800">
            {data.resolvedCases?.toLocaleString() || 0}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(complianceRate, 100)}%` }}
                role="progressbar"
                aria-valuenow={complianceRate}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {complianceRate}% resolved
            </span>
          </div>
        </div>

        {/* Compliance Rate Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-400">Performance</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Compliance Rate</p>
          <p className="text-3xl font-semibold text-gray-800">
            {complianceRate}%
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>Above target</span>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Penalty Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Total Penalty Amount</p>
          <p className="text-2xl font-semibold text-gray-800">
            {formatCurrency(Number(data.totalPenalty) || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Accumulated penalties to date
          </p>
        </div>

        {/* Total Paid Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Total Paid</p>
          <p className="text-2xl font-semibold text-green-600">
            {formatCurrency(Number(data.totalPaid) || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Successfully collected</p>
        </div>

        {/* Outstanding Balance Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Outstanding Balance</p>
          <p className="text-2xl font-semibold text-amber-600">
            {formatCurrency(data.outstandingBalance || 0)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(outstandingPercentage, 100)}%` }}
                role="progressbar"
                aria-valuenow={outstandingPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {outstandingPercentage}% outstanding
            </span>
          </div>
        </div>
      </div>

      {/* Regional Data Section */}
      {casesByState && casesByState.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Cases by State</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Regional distribution of compliance cases
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Last 30 days</span>
            </div>
          </div>

          {/* Table */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">State</th>
                  <th className="pb-3">Cases</th>
                  <th className="pb-3">Distribution</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {casesByState.map((item) => {
                  const totalCases = data.totalCases || 1; // Avoid division by zero
                  const percentage = Math.min(
                    Math.round((item.total / totalCases) * 100),
                    100,
                  );
                  return (
                    <tr
                      key={item.state || `state-${Math.random()}`}
                      className="text-sm hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 font-medium text-gray-800">
                        {item.state}
                      </td>
                      <td className="py-3 text-gray-600">
                        {item.total?.toLocaleString() || 0}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                              role="progressbar"
                              aria-valuenow={percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            percentage > 20
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {percentage > 20 ? "High volume" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Total States: {casesByState.length}
                </span>
                <span className="text-gray-500">
                  National Total: {data.totalCases?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => console.log("Generate Compliance Report")}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600/30 hover:shadow-md transition-all group"
          aria-label="Generate Compliance Report"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
            Generate Compliance Report
          </span>
          <span className="text-xs text-gray-400 group-hover:text-green-600">
            PDF
          </span>
        </button>
        <button
          onClick={() => console.log("View All Cases")}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600/30 hover:shadow-md transition-all group"
          aria-label="View All Cases"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
            View All Cases
          </span>
          <span className="text-xs text-gray-400 group-hover:text-green-600">
            {data.pendingCases || 0} pending
          </span>
        </button>
        <button
          onClick={() => console.log("Schedule Enforcement")}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600/30 hover:shadow-md transition-all group"
          aria-label="Schedule Enforcement"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
            Schedule Enforcement
          </span>
          <span className="text-xs text-gray-400 group-hover:text-green-600">
            New
          </span>
        </button>
        <button
          onClick={() => console.log("View Audit Trail")}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600/30 hover:shadow-md transition-all group"
          aria-label="View Audit Trail"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
            View Audit Trail
          </span>
          <span className="text-xs text-gray-400 group-hover:text-green-600">
            Security
          </span>
        </button>
      </div>
    </div>
  );
};

export default Overview;
