import { useEffect, useState, useContext } from "react";
import {
  getCases,
  resolveCase,
  createCase,
  addComplianceItem,
  getComplianceSections,
  getCaseById,
} from "../../services/caseService";
import type { Case, ComplianceSection } from "../../types";
import { AuthContext } from "../../context/AuthContext";
import {
  Eye,
  Plus,
  CheckCircle,
  X,
  FileText,
  Building2,
  MapPin,
  Clock,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [sections, setSections] = useState<ComplianceSection[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compliance form state for auto-calculation
  const [complianceForm, setComplianceForm] = useState({
    sectionId: "",
    complianceStatus: "non_compliant",
    periodOfNonCompliance: "",
    officersPenalised: "",
    dailyPenaltyRate: "500", // Default daily rate, not sent to backend
    penaltyComputation: "",
    totalPayable: "",
    amountPaid: "",
    notes: "",
  });

  const { user } = useContext(AuthContext);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState<number | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-calculate when period, officers, or daily rate changes
  useEffect(() => {
    const period = Number(complianceForm.periodOfNonCompliance) || 0;
    const officers = Number(complianceForm.officersPenalised) || 0;
    const dailyRate = Number(complianceForm.dailyPenaltyRate) || 0;

    if (period > 0 && officers > 0 && dailyRate > 0) {
      const total = period * dailyRate * officers;

      // Update penalty computation formula
      setComplianceForm((prev) => ({
        ...prev,
        penaltyComputation: `${period} × ₦${dailyRate.toLocaleString()} × ${officers}`,
        totalPayable: total.toString(),
      }));
    } else {
      setComplianceForm((prev) => ({
        ...prev,
        penaltyComputation: "",
        totalPayable: "",
      }));
    }
  }, [
    complianceForm.periodOfNonCompliance,
    complianceForm.officersPenalised,
    complianceForm.dailyPenaltyRate,
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [casesData, sectionsData] = await Promise.all([
        getCases(),
        getComplianceSections(),
      ]);
      setCases(casesData);
      setSections(sectionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCase = async (id: number) => {
    try {
      const data = await getCaseById(id);
      setSelectedCase(data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching case details:", error);
    }
  };

  const handleCreateCase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createCase({
        companyName: formData.get("companyName") as string,
        rcNumber: formData.get("rcNumber") as string,
        address: formData.get("address") as string,
        inspectionDate: formData.get("inspectionDate") as string,
      });

      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  const handleAddCompliance = async (
    e: React.FormEvent<HTMLFormElement>,
    caseId: number,
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create payload with only the fields the API expects
    // dailyPenaltyRate is NOT included in the payload
    const payload = {
      sectionId: Number(complianceForm.sectionId),
      complianceStatus: complianceForm.complianceStatus,
      periodOfNonCompliance: complianceForm.periodOfNonCompliance,
      officersPenalised: Number(complianceForm.officersPenalised),
      penaltyComputation: complianceForm.penaltyComputation,
      totalPayable: complianceForm.totalPayable,
      amountPaid: complianceForm.amountPaid,
      notes: complianceForm.notes,
    };

    try {
      await addComplianceItem(caseId, payload);
      setShowComplianceModal(null);
      // Reset form
      setComplianceForm({
        sectionId: "",
        complianceStatus: "non_compliant",
        periodOfNonCompliance: "",
        officersPenalised: "",
        dailyPenaltyRate: "500",
        penaltyComputation: "",
        totalPayable: "",
        amountPaid: "",
        notes: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error adding compliance item:", error);
      alert(
        "Failed to add compliance item. Please check all fields and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveCase = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to resolve this case? This action cannot be undone.",
      )
    ) {
      try {
        await resolveCase(id, "Resolved");
        fetchData();
      } catch (error) {
        console.error("Error resolving case:", error);
      }
    }
  };

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      resolved: "bg-green-100 text-green-700 border-green-200",
      "in-review": "bg-blue-100 text-blue-700 border-blue-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  // Filter cases based on search and filters
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rcNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesState =
      stateFilter === "all" ||
      (c.state && c.state.toLowerCase() === stateFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesState;
  });

  // Get unique states for filter
  const uniqueStates = Array.from(
    new Set(
      cases.map((c) => c.state).filter((s) => s !== null && s !== undefined),
    ),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-800">
            Cases Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track compliance cases across all states
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Add Case Button - Role Based */}
          {user?.role === "officer" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Case
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company or RC number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
          >
            <option value="all">All States</option>
            {uniqueStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setStateFilter("all");
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S/N
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RC Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penalty
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.map((c, index) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-800">
                        {c.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.rcNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {c.state || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(c.status)}`}
                    >
                      {c.status === "pending" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {c.status === "resolved" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">
                      {formatCurrency(c.totalPenalty)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => handleViewCase(c.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Add Compliance - Pending Cases Only */}
                      {c.status === "pending" && (
                        <button
                          onClick={() => {
                            setShowComplianceModal(c.id);
                            // Reset form when opening modal
                            setComplianceForm({
                              sectionId: "",
                              complianceStatus: "non_compliant",
                              periodOfNonCompliance: "",
                              officersPenalised: "",
                              dailyPenaltyRate: "500",
                              penaltyComputation: "",
                              totalPayable: "",
                              amountPaid: "",
                              notes: "",
                            });
                          }}
                          className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Add Compliance Item"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      {/* Resolve - Role Based */}
                      {c.status === "pending" &&
                        ["super_admin", "enforcement_head"].includes(
                          user?.role || "",
                        ) && (
                          <button
                            onClick={() => handleResolveCase(c.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Resolve Case"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No cases found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing{" "}
              <span className="font-medium">{filteredCases.length}</span> of{" "}
              <span className="font-medium">{cases.length}</span> cases
            </span>
            <span className="text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* =========================
          CREATE CASE MODAL
      ========================= */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Case"
      >
        <form onSubmit={handleCreateCase} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                name="companyName"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RC Number <span className="text-red-500">*</span>
              </label>
              <input
                name="rcNumber"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                placeholder="e.g., RC-123456"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                placeholder="Full business address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="inspectionDate"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Register Case
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================
          ADD COMPLIANCE MODAL WITH DAILY PENALTY RATE
      ========================= */}
      <Modal
        isOpen={showComplianceModal !== null}
        onClose={() => {
          setShowComplianceModal(null);
          setComplianceForm({
            sectionId: "",
            complianceStatus: "non_compliant",
            periodOfNonCompliance: "",
            officersPenalised: "",
            dailyPenaltyRate: "500",
            penaltyComputation: "",
            totalPayable: "",
            amountPaid: "",
            notes: "",
          });
        }}
        title="Add Compliance Item"
      >
        <form
          onSubmit={(e) => handleAddCompliance(e, showComplianceModal!)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance Section <span className="text-red-500">*</span>
              </label>
              <select
                value={complianceForm.sectionId}
                onChange={(e) =>
                  setComplianceForm({
                    ...complianceForm,
                    sectionId: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="">Select a section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.code} - {section.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Compliance Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance Status <span className="text-red-500">*</span>
              </label>
              <select
                value={complianceForm.complianceStatus}
                onChange={(e) =>
                  setComplianceForm({
                    ...complianceForm,
                    complianceStatus: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              >
                <option value="non_compliant">Non-Compliant</option>
                <option value="compliant">Compliant</option>
              </select>
            </div>

            {/* Period of Non-Compliance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period of Non-Compliance (days){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={complianceForm.periodOfNonCompliance}
                onChange={(e) =>
                  setComplianceForm({
                    ...complianceForm,
                    periodOfNonCompliance: e.target.value,
                  })
                }
                required
                min="0"
                placeholder="e.g., 35"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>

            {/* Officers Penalised */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Officers Penalised{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={complianceForm.officersPenalised}
                onChange={(e) =>
                  setComplianceForm({
                    ...complianceForm,
                    officersPenalised: e.target.value,
                  })
                }
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>

            {/* Daily Penalty Rate - FRONTEND ONLY FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Penalty Rate (₦) <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-2">
                  (Frontend only - for calculation)
                </span>
              </label>
              <input
                type="number"
                value={complianceForm.dailyPenaltyRate}
                onChange={(e) =>
                  setComplianceForm({
                    ...complianceForm,
                    dailyPenaltyRate: e.target.value,
                  })
                }
                required
                min="0"
                step="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>

            {/* Penalty Computation - Auto-calculated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penalty Computation Method{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                value={complianceForm.penaltyComputation}
                readOnly
                placeholder="Auto-calculated"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Payable (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={complianceForm.totalPayable}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={complianceForm.amountPaid}
                  onChange={(e) =>
                    setComplianceForm({
                      ...complianceForm,
                      amountPaid: e.target.value,
                    })
                  }
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>
            </div>

            {/* Payment Summary */}
            {complianceForm.totalPayable && complianceForm.amountPaid && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Outstanding Balance:</span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(
                      Number(complianceForm.totalPayable) -
                        Number(complianceForm.amountPaid),
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={complianceForm.notes}
                onChange={(e) =>
                  setComplianceForm({
                    ...complianceForm,
                    notes: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowComplianceModal(null);
                setComplianceForm({
                  sectionId: "",
                  complianceStatus: "non_compliant",
                  periodOfNonCompliance: "",
                  officersPenalised: "",
                  dailyPenaltyRate: "500",
                  penaltyComputation: "",
                  totalPayable: "",
                  amountPaid: "",
                  notes: "",
                });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !complianceForm.totalPayable}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Compliance Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================
          VIEW CASE DETAILS MODAL
      ========================= */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCase(null);
        }}
        title="Case Details"
      >
        {selectedCase && (
          <div className="space-y-6">
            {/* Company Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800">
                  {selectedCase.companyName}
                </h4>
                <p className="text-sm text-gray-500">{selectedCase.rcNumber}</p>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedCase.status)}`}
                >
                  {selectedCase.status.charAt(0).toUpperCase() +
                    selectedCase.status.slice(1)}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">State</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedCase.state}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Penalty</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatCurrency(selectedCase.totalPenalty)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency(selectedCase.totalPaid)}
                </p>
              </div>
            </div>

            {/* Compliance Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Compliance Items
              </h4>
              <div className="space-y-3">
                {selectedCase.complianceItems?.map(
                  (item: any, index: number) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            {item.sectionCode}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.complianceStatus === "compliant"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.complianceStatus}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {item.sectionTitle}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Period (days)</p>
                          <p className="text-sm">
                            {item.periodOfNonCompliance}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Officers</p>
                          <p className="text-sm">{item.officersPenalised}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Computation</p>
                          <p className="text-sm font-mono text-xs">
                            {item.penaltyComputation}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Payable</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(item.totalPayable)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount Paid</p>
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(item.amountPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Outstanding</p>
                          <p className="text-sm font-medium text-amber-600">
                            {formatCurrency(
                              item.totalPayable - item.amountPaid,
                            )}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm text-gray-600">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  ),
                )}

                {(!selectedCase.complianceItems ||
                  selectedCase.complianceItems.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No compliance items recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCase(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedCase.status === "pending" && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setShowComplianceModal(selectedCase.id);
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Add Compliance
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CasesPage;
