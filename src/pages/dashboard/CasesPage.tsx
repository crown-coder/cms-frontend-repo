import { useEffect, useState, useContext } from "react";
import {
  getCases,
  resolveCase,
  createCase,
  addComplianceItem,
  getComplianceSections,
  getCaseById,
} from "../../services/caseService";
import { getPayments, recordPayment } from "../../services/paymentService";
import type { Case, ComplianceSection, Payment } from "../../types";
import { AuthContext } from "../../context/AuthContext";
import {
  Eye,
  Plus,
  CheckCircle,
  X,
  FileText,
  Building2,
  MapPin,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from "lucide-react";

// Modal Component - Refined
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-60px)]">
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
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Compliance form state
  const [complianceForm, setComplianceForm] = useState({
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

  const { user } = useContext(AuthContext);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState<number | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveErrors, setResolveErrors] = useState<string[]>([]);
  const [resolvePayload, setResolvePayload] = useState({
    resolutionType: "payment_complete" as
      | "payment_complete"
      | "penalty_waived"
      | "suspended",
    remark: "",
    penaltyReduction: "",
    suspensionReason: "",
    suspendedUntil: "",
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
  });
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [expandedComplianceItem, setExpandedComplianceItem] = useState<
    number | null
  >(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const period = Number(complianceForm.periodOfNonCompliance) || 0;
    const officers = Number(complianceForm.officersPenalised) || 0;
    const dailyRate = Number(complianceForm.dailyPenaltyRate) || 0;

    if (period > 0 && officers > 0 && dailyRate > 0) {
      const total = period * dailyRate * officers;
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
      setCurrentPage(1);
    }
  };

  const fetchCaseDetails = async (id: number) => {
    try {
      const [caseData, paymentsData] = await Promise.all([
        getCaseById(id),
        getPayments(id),
      ]);
      setSelectedCase(caseData);
      setPayments(paymentsData);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching case details:", error);
    }
  };

  const handleViewCase = async (id: number) => {
    setPaymentSuccess("");
    setPaymentError("");
    setPaymentForm({ amount: "", paymentDate: "" });
    setExpandedComplianceItem(null);
    await fetchCaseDetails(id);
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

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCase) return;

    setPaymentError("");
    setPaymentSuccess("");
    setIsRecordingPayment(true);

    const paymentAmount = Number(paymentForm.amount);
    const outstandingBalance =
      Number(selectedCase.totalPenalty) - Number(selectedCase.totalPaid);

    if (paymentAmount <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      setIsRecordingPayment(false);
      return;
    }

    if (paymentAmount > outstandingBalance) {
      setPaymentError(
        `Amount exceeds outstanding balance (${formatCurrency(outstandingBalance)}).`,
      );
      setIsRecordingPayment(false);
      return;
    }

    const payload: any = { amount: paymentAmount };
    if (paymentForm.paymentDate) {
      payload.paymentDate = new Date(paymentForm.paymentDate).toISOString();
    }

    try {
      await recordPayment(selectedCase.id, payload);
      setPaymentSuccess("Payment recorded successfully.");
      setPaymentForm({ amount: "", paymentDate: "" });
      await fetchCaseDetails(selectedCase.id);
      fetchData();
    } catch (error: any) {
      setPaymentError(
        error?.response?.data?.message || "Unable to record payment.",
      );
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleAddCompliance = async (
    e: React.FormEvent<HTMLFormElement>,
    caseId: number,
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

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

  const handleOpenResolveModal = (id: number) => {
    setShowResolveModal(id);
    setResolveErrors([]);
    setResolvePayload({
      resolutionType: "payment_complete",
      remark: "",
      penaltyReduction: "",
      suspensionReason: "",
      suspendedUntil: "",
    });
  };

  const handleResolveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showResolveModal) return;

    const caseToResolve = cases.find((c) => c.id === showResolveModal);
    setIsResolving(true);
    setResolveErrors([]);

    if (
      resolvePayload.resolutionType === "payment_complete" &&
      caseToResolve &&
      Number(caseToResolve.totalPaid) < Number(caseToResolve.totalPenalty)
    ) {
      setResolveErrors([
        "Full payment is required before completing this case.",
      ]);
      setIsResolving(false);
      return;
    }

    if (resolvePayload.resolutionType === "penalty_waived") {
      const penaltyReduction = Number(resolvePayload.penaltyReduction);
      if (!resolvePayload.penaltyReduction || penaltyReduction <= 0) {
        setResolveErrors(["Penalty reduction must be greater than zero."]);
        setIsResolving(false);
        return;
      }
      if (
        caseToResolve &&
        penaltyReduction > Number(caseToResolve.totalPenalty)
      ) {
        setResolveErrors([
          "Penalty reduction cannot exceed the total penalty amount.",
        ]);
        setIsResolving(false);
        return;
      }
    }

    if (
      resolvePayload.resolutionType === "suspended" &&
      !resolvePayload.suspensionReason.trim()
    ) {
      setResolveErrors(["Suspension reason is required."]);
      setIsResolving(false);
      return;
    }

    const payload: any = { resolutionType: resolvePayload.resolutionType };
    if (resolvePayload.remark.trim())
      payload.remark = resolvePayload.remark.trim();
    if (resolvePayload.resolutionType === "penalty_waived") {
      payload.penaltyReduction = Number(resolvePayload.penaltyReduction);
    }
    if (resolvePayload.resolutionType === "suspended") {
      if (resolvePayload.suspensionReason.trim()) {
        payload.suspensionReason = resolvePayload.suspensionReason.trim();
      }
      if (resolvePayload.suspendedUntil) {
        payload.suspendedUntil = resolvePayload.suspendedUntil;
      }
    }

    try {
      await resolveCase(showResolveModal, payload);
      setShowResolveModal(null);
      fetchData();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || error?.response?.data?.error;
      const validationErrors = error?.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        setResolveErrors(validationErrors);
      } else if (backendMessage) {
        setResolveErrors([backendMessage]);
      } else {
        setResolveErrors(["Failed to resolve case. Please try again."]);
      }
    } finally {
      setIsResolving(false);
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
    const styles: Record<string, string> = {
      pending: "bg-orange-50 text-orange-600 border-orange-200",
      in_progress: "bg-blue-50 text-blue-600 border-blue-200",
      escalated: "bg-purple-50 text-purple-600 border-purple-200",
      resolved: "bg-green-50 text-green-600 border-green-200",
      suspended: "bg-gray-50 text-gray-500 border-gray-200",
    };
    return styles[status] || styles.pending;
  };

  const getStatusDot = (status: string) => {
    const dots: Record<string, string> = {
      pending: "bg-orange-500",
      in_progress: "bg-blue-500",
      escalated: "bg-purple-500",
      resolved: "bg-green-500",
      suspended: "bg-gray-400",
    };
    return dots[status] || "bg-gray-400";
  };

  const getComplianceStatusBadge = (status: string) => {
    return status === "compliant"
      ? "bg-green-50 text-green-600 border-green-200"
      : "bg-red-50 text-red-600 border-red-200";
  };

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rcNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesState = stateFilter === "all" || c.state === stateFilter;
    return matchesSearch && matchesStatus && matchesState;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift(-1);
    if (currentPage + delta < totalPages - 1) range.push(-1);
    return range;
  };

  // Get unique states
  const uniqueStates = Array.from(
    new Set(cases.map((c) => c.state).filter(Boolean)),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-700">Loading cases</p>
          <p className="text-xs text-gray-400 mt-1">Fetching case data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-light text-gray-800 tracking-tight">
            Cases
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredCases.length}{" "}
            {filteredCases.length === 1 ? "case" : "cases"} total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {user?.role === "officer" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search company or RC number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(statusFilter !== "all" || stateFilter !== "all") && (
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
            >
              <option value="all">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setStateFilter("all");
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  RC Number
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Penalty
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCases.map((c, index) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                        {c.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.rcNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {c.state || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`}
                      ></span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(c.totalPenalty)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewCase(c.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {c.status === "pending" && (
                        <button
                          onClick={() => {
                            setShowComplianceModal(c.id);
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
                          className="p-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Add Compliance"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {c.status === "pending" &&
                        ["super_admin", "enforcement_head"].includes(
                          user?.role || "",
                        ) && (
                          <button
                            onClick={() => handleOpenResolveModal(c.id)}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Resolve Case"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="text-gray-400">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No cases found</p>
                      <p className="text-xs mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCases.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 bg-white"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <span className="text-xs text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredCases.length)} of{" "}
                {filteredCases.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {totalPages <= 7 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )
              ) : (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                      currentPage === 1
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    1
                  </button>

                  {getVisiblePages().map((page, idx) =>
                    page === -1 ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-green-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE CASE MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Case"
      >
        <form onSubmit={handleCreateCase} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                name="companyName"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                RC Number <span className="text-red-500">*</span>
              </label>
              <input
                name="rcNumber"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                placeholder="e.g., RC-123456"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Business Address <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                placeholder="Full business address"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Inspection Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="inspectionDate"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
            >
              Register Case
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD COMPLIANCE MODAL */}
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
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
            >
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code} - {section.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
            >
              <option value="non_compliant">Non-Compliant</option>
              <option value="compliant">Compliant</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Period (days) <span className="text-red-500">*</span>
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Officers <span className="text-red-500">*</span>
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Daily Rate (₦) <span className="text-red-500">*</span>
              <span className="text-gray-400 ml-1 text-[10px]">
                (calculation only)
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Total Payable (₦)
              </label>
              <input
                type="number"
                value={complianceForm.totalPayable}
                readOnly
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>
          </div>

          {complianceForm.totalPayable && complianceForm.amountPaid && (
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Outstanding:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(
                    Number(complianceForm.totalPayable) -
                      Number(complianceForm.amountPaid),
                  )}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Notes
            </label>
            <textarea
              value={complianceForm.notes}
              onChange={(e) =>
                setComplianceForm({ ...complianceForm, notes: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 resize-none"
              placeholder="Additional information..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !complianceForm.totalPayable}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* RESOLVE CASE MODAL */}
      <Modal
        isOpen={showResolveModal !== null}
        onClose={() => {
          setShowResolveModal(null);
          setResolveErrors([]);
        }}
        title="Resolve Case"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Resolution Type <span className="text-red-500">*</span>
            </label>
            <select
              value={resolvePayload.resolutionType}
              onChange={(e) =>
                setResolvePayload((prev) => ({
                  ...prev,
                  resolutionType: e.target.value as
                    | "payment_complete"
                    | "penalty_waived"
                    | "suspended",
                }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
            >
              <option value="payment_complete">Payment Complete</option>
              <option value="penalty_waived">Penalty Waived</option>
              <option value="suspended">Suspend Case</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Remark
            </label>
            <textarea
              value={resolvePayload.remark}
              onChange={(e) =>
                setResolvePayload((prev) => ({
                  ...prev,
                  remark: e.target.value,
                }))
              }
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 resize-none"
              placeholder="Optional note"
            />
          </div>

          {resolvePayload.resolutionType === "penalty_waived" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Penalty Reduction (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={resolvePayload.penaltyReduction}
                onChange={(e) =>
                  setResolvePayload((prev) => ({
                    ...prev,
                    penaltyReduction: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                placeholder="Enter amount"
              />
            </div>
          )}

          {resolvePayload.resolutionType === "suspended" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Suspension Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolvePayload.suspensionReason}
                  onChange={(e) =>
                    setResolvePayload((prev) => ({
                      ...prev,
                      suspensionReason: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 resize-none"
                  placeholder="Reason for suspension"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Suspended Until
                </label>
                <input
                  type="date"
                  value={resolvePayload.suspendedUntil}
                  onChange={(e) =>
                    setResolvePayload((prev) => ({
                      ...prev,
                      suspendedUntil: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600"
                />
              </div>
            </>
          )}

          {resolveErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                {resolveErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowResolveModal(null);
                setResolveErrors([]);
              }}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResolving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResolving ? "Resolving..." : "Confirm"}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW CASE DETAILS MODAL */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCase(null);
          setExpandedComplianceItem(null);
        }}
        title="Case Details"
      >
        {selectedCase && (
          <div className="space-y-4">
            {/* Company Header */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">
                  {selectedCase.companyName}
                </h4>
                <p className="text-xs text-gray-500">{selectedCase.rcNumber}</p>
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(selectedCase.status)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedCase.status)}`}
                  ></span>
                  {selectedCase.status.replace("_", " ")}
                </span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-1">
                  State
                </p>
                <p className="text-xs font-medium text-gray-800">
                  {selectedCase.state || "N/A"}
                </p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-1">
                  Total Penalty
                </p>
                <p className="text-xs font-medium text-gray-800">
                  {formatCurrency(selectedCase.totalPenalty)}
                </p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-1">
                  Total Paid
                </p>
                <p className="text-xs font-medium text-green-600">
                  {formatCurrency(selectedCase.totalPaid)}
                </p>
              </div>
            </div>

            {/* Resolution Details (if resolved) */}
            {selectedCase.status !== "pending" && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-2">
                  Resolution Details
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="text-gray-700">
                      {selectedCase.resolutionType
                        ?.split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ") || "N/A"}
                    </span>
                  </p>
                  {selectedCase.penaltyReduction != null && (
                    <p>
                      <span className="text-gray-500">Penalty Reduction:</span>{" "}
                      <span className="text-gray-700">
                        {formatCurrency(selectedCase.penaltyReduction)}
                      </span>
                    </p>
                  )}
                  {selectedCase.suspensionReason && (
                    <p>
                      <span className="text-gray-500">Suspension Reason:</span>{" "}
                      <span className="text-gray-700">
                        {selectedCase.suspensionReason}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Compliance Items Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700">
                  Compliance Items
                </h4>
                <span className="text-[10px] text-gray-400">
                  {selectedCase.complianceItems?.length || 0} items
                </span>
              </div>

              {selectedCase.complianceItems &&
              selectedCase.complianceItems.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCase.complianceItems.map(
                    (item: any, index: number) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedComplianceItem(
                              expandedComplianceItem === item.id
                                ? null
                                : item.id,
                            )
                          }
                          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-gray-400">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                              {item.sectionCode}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getComplianceStatusBadge(item.complianceStatus)}`}
                            >
                              {item.complianceStatus}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                              expandedComplianceItem === item.id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {expandedComplianceItem === item.id && (
                          <div className="px-3 pb-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-800 mt-2">
                              {item.sectionTitle}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div>
                                <p className="text-[10px] text-gray-400">
                                  Period (days)
                                </p>
                                <p className="text-xs text-gray-700">
                                  {item.periodOfNonCompliance}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400">
                                  Officers
                                </p>
                                <p className="text-xs text-gray-700">
                                  {item.officersPenalised}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[10px] text-gray-400">
                                  Computation
                                </p>
                                <p className="text-xs font-mono text-gray-600">
                                  {item.penaltyComputation}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400">
                                  Total Payable
                                </p>
                                <p className="text-xs font-medium text-gray-800">
                                  {formatCurrency(item.totalPayable)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400">
                                  Amount Paid
                                </p>
                                <p className="text-xs font-medium text-green-600">
                                  {formatCurrency(item.amountPaid)}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[10px] text-gray-400">
                                  Outstanding
                                </p>
                                <p className="text-xs font-medium text-orange-600">
                                  {formatCurrency(
                                    item.totalPayable - item.amountPaid,
                                  )}
                                </p>
                              </div>
                            </div>

                            {item.notes && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400">
                                  Notes
                                </p>
                                <p className="text-xs text-gray-600">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400">
                    No compliance items recorded
                  </p>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700">
                  Payment History
                </h4>
                <span className="text-[10px] text-gray-400">
                  {payments.length} payments
                </span>
              </div>
              {payments.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xs font-medium text-gray-800">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                  No payments recorded
                </p>
              )}
            </div>

            {/* Record Payment */}
            {selectedCase.status === "pending" && (
              <form
                onSubmit={handleRecordPayment}
                className="space-y-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Outstanding:</span>
                  <span className="text-sm font-medium text-orange-600">
                    {formatCurrency(
                      Number(selectedCase.totalPenalty) -
                        Number(selectedCase.totalPaid),
                    )}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="Amount"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-white"
                />
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paymentDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-white"
                />
                {paymentError && (
                  <p className="text-xs text-red-600">{paymentError}</p>
                )}
                {paymentSuccess && (
                  <p className="text-xs text-green-600">{paymentSuccess}</p>
                )}
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="w-full py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isRecordingPayment ? "Recording..." : "Record Payment"}
                </button>
              </form>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCase(null);
                  setExpandedComplianceItem(null);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedCase.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowComplianceModal(selectedCase.id);
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                  >
                    Add Compliance
                  </button>
                  {["super_admin", "enforcement_head"].includes(
                    user?.role || "",
                  ) && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleOpenResolveModal(selectedCase.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Resolve Case
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CasesPage;
