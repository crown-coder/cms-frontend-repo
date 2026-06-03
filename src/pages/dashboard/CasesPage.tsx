import { useEffect, useState, useContext, useRef } from "react";
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
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";

// Glass Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 max-w-2xl w-full max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-70px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [sections, setSections] = useState<ComplianceSection[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);

  // Visible columns
  const [visibleColumns, setVisibleColumns] = useState({
    company: true,
    rcNumber: true,
    state: true,
    status: true,
    penalty: true,
    inspectionDate: false,
    address: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Bulk selection
  const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, stateFilter]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
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
      alert("Failed to add compliance item.");
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
      if (resolvePayload.suspensionReason.trim())
        payload.suspensionReason = resolvePayload.suspensionReason.trim();
      if (resolvePayload.suspendedUntil)
        payload.suspendedUntil = resolvePayload.suspendedUntil;
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCases(new Set());
      setSelectAll(false);
    } else {
      setSelectedCases(new Set(paginatedCases.map((c) => c.id)));
      setSelectAll(true);
    }
  };

  const handleSelectCase = (id: number) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      setSelectAll(false);
    } else {
      newSelected.add(id);
      if (newSelected.size === paginatedCases.length) setSelectAll(true);
    }
    setSelectedCases(newSelected);
  };

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      debouncedSearch === "" ||
      c.companyName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.rcNumber.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesState = stateFilter === "all" || c.state === stateFilter;
    return matchesSearch && matchesStatus && matchesState;
  });

  // Sort cases
  const sortedCases = [...filteredCases].sort((a: any, b: any) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = sortedCases.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setSelectedCases(new Set());
    setSelectAll(false);
  };

  const getVisiblePages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const uniqueStates = Array.from(
    new Set(cases.map((c) => c.state).filter(Boolean)),
  ).sort();

  // Status counts for quick filters
  const statusCounts = {
    all: cases.length,
    pending: cases.filter((c) => c.status === "pending").length,
    in_progress: cases.filter((c) => c.status === "in_progress").length,
    resolved: cases.filter((c) => c.status === "resolved").length,
    suspended: cases.filter((c) => c.status === "suspended").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-7 h-7 text-green-600 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Loading cases</p>
          <p className="text-xs text-gray-400 mt-1.5">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header - Glass card */}
      <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg shadow-black/5 p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Cases
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {filteredCases.length.toLocaleString()}{" "}
              {filteredCases.length === 1 ? "case" : "cases"} found
              {debouncedSearch && ` for "${debouncedSearch}"`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white/80 rounded-full transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full hover:bg-white transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {user?.role === "officer" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-xs font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Case</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Quick Filters */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search with shortcut hint */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search companies, RC numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 text-sm bg-gray-100/70 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all placeholder:text-gray-400 text-gray-700"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-200/50 rounded-md">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-full transition-colors ${
                showFilters || statusFilter !== "all" || stateFilter !== "all"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-white/80 border border-gray-200/50 text-gray-600 hover:bg-white"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(statusFilter !== "all" || stateFilter !== "all") && (
                <span className="w-5 h-5 bg-green-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {
                    [statusFilter !== "all", stateFilter !== "all"].filter(
                      Boolean,
                    ).length
                  }
                </span>
              )}
            </button>

            <button
              onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-white/80 border border-gray-200/50 rounded-full text-gray-600 hover:bg-white transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </button>
          </div>
        </div>

        {/* Quick status filters */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {Object.entries(statusCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key === "all" ? "all" : key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors ${
                statusFilter === key ||
                (key === "all" && statusFilter === "all")
                  ? "bg-gray-800 text-white"
                  : "bg-white/80 text-gray-500 hover:bg-gray-100 border border-gray-200/50"
              }`}
            >
              {key === "all" ? "All" : key.replace("_", " ")}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-200/50">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-white/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                State
              </label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm bg-white/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700"
              >
                <option value="all">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setStateFilter("all");
                  setSortField("createdAt");
                  setSortDirection("desc");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}

        {/* Column customizer */}
        {showColumnCustomizer && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Toggle Columns
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(visibleColumns).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-gray-200/50 rounded-full text-xs cursor-pointer hover:bg-white transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      setVisibleColumns({ ...visibleColumns, [key]: !value })
                    }
                    className="w-3.5 h-3.5 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedCases.size > 0 && (
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-lg px-4 py-3 flex items-center justify-between">
          <p className="text-xs font-medium text-white">
            {selectedCases.size} {selectedCases.size === 1 ? "case" : "cases"}{" "}
            selected
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors">
              Export Selected
            </button>
            <button
              onClick={() => {
                setSelectedCases(new Set());
                setSelectAll(false);
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Table - Glass card */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                {visibleColumns.company && (
                  <th
                    className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("companyName")}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                )}
                {visibleColumns.rcNumber && (
                  <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    RC Number
                  </th>
                )}
                {visibleColumns.state && (
                  <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {visibleColumns.penalty && (
                  <th
                    className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("totalPenalty")}
                  >
                    <div className="flex items-center gap-1">
                      Penalty
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                )}
                {visibleColumns.inspectionDate && (
                  <th className="px-4 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Inspection Date
                  </th>
                )}
                <th className="px-4 py-3.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {paginatedCases.map((c, index) => (
                <tr
                  key={c.id}
                  className={`hover:bg-white/50 transition-colors ${
                    selectedCases.has(c.id) ? "bg-green-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCases.has(c.id)}
                      onChange={() => handleSelectCase(c.id)}
                      className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-medium">
                    {startIndex + index + 1}
                  </td>
                  {visibleColumns.company && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewCase(c.id)}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[180px] hover:text-green-600 transition-colors">
                          {c.companyName}
                        </span>
                      </button>
                    </td>
                  )}
                  {visibleColumns.rcNumber && (
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600 bg-gray-100/80 px-2 py-1 rounded-lg">
                        {c.rcNumber}
                      </span>
                    </td>
                  )}
                  {visibleColumns.state && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {c.state || "—"}
                      </div>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`}
                        ></span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusBadge(c.status)}`}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.penalty && (
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(c.totalPenalty)}
                      </span>
                    </td>
                  )}
                  {visibleColumns.inspectionDate && (
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.inspectionDate
                        ? new Date(c.inspectionDate).toLocaleDateString()
                        : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => handleViewCase(c.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
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
                          className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
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
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
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
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        No cases found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {debouncedSearch
                          ? `No results for "${debouncedSearch}". Try adjusting your search or filters.`
                          : "Try adjusting your filters or create a new case."}
                      </p>
                      {debouncedSearch && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-3 text-xs font-medium text-green-600 hover:text-green-700"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Glass */}
        {filteredCases.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-gray-500 font-medium">
                per page · {startIndex + 1}–
                {Math.min(endIndex, filteredCases.length)} of{" "}
                {filteredCases.length.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-0.5">
                {getVisiblePages().map((page, idx) =>
                  typeof page === "string" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-gray-400 text-xs"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 text-xs font-semibold rounded-xl transition-all ${
                        currentPage === page
                          ? "bg-gray-800 text-white shadow-md"
                          : "text-gray-600 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                name="companyName"
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                RC Number <span className="text-red-500">*</span>
              </label>
              <input
                name="rcNumber"
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all font-mono"
                placeholder="e.g., RC-123456"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Business Address <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                placeholder="Full business address"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Inspection Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="inspectionDate"
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
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
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="non_compliant">Non-Compliant</option>
              <option value="compliant">Compliant</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Daily Rate (₦) <span className="text-red-500">*</span>{" "}
              <span className="text-gray-400 font-normal">
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
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Total Payable (₦)
              </label>
              <input
                type="number"
                value={complianceForm.totalPayable}
                readOnly
                className="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>
          {complianceForm.totalPayable && complianceForm.amountPaid && (
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex justify-between text-sm">
                <span className="text-orange-600 font-medium">
                  Outstanding:
                </span>
                <span className="font-bold text-orange-700">
                  {formatCurrency(
                    Number(complianceForm.totalPayable) -
                      Number(complianceForm.amountPaid),
                  )}
                </span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Notes
            </label>
            <textarea
              value={complianceForm.notes}
              onChange={(e) =>
                setComplianceForm({ ...complianceForm, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
              placeholder="Additional information..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowComplianceModal(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !complianceForm.totalPayable}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Resolution Type <span className="text-red-500">*</span>
            </label>
            <select
              value={resolvePayload.resolutionType}
              onChange={(e) =>
                setResolvePayload((prev) => ({
                  ...prev,
                  resolutionType: e.target.value as any,
                }))
              }
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="payment_complete">Payment Complete</option>
              <option value="penalty_waived">Penalty Waived</option>
              <option value="suspended">Suspend Case</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
              placeholder="Optional note"
            />
          </div>
          {resolvePayload.resolutionType === "penalty_waived" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                placeholder="Enter amount"
              />
            </div>
          )}
          {resolvePayload.resolutionType === "suspended" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                  placeholder="Reason for suspension"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>
            </>
          )}
          {resolveErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                {resolveErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowResolveModal(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResolving}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20 disabled:opacity-50"
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
          <div className="space-y-5">
            {/* Company Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md shadow-green-600/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800">
                  {selectedCase.companyName}
                </h4>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedCase.rcNumber}
                </p>
              </div>
              <span className="ml-auto">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold ${getStatusBadge(selectedCase.status)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedCase.status)}`}
                  ></span>
                  {selectedCase.status.replace("_", " ")}
                </span>
              </span>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  State
                </p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedCase.state || "N/A"}
                </p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  Inspection Date
                </p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {selectedCase.inspectionDate
                    ? new Date(selectedCase.inspectionDate).toLocaleDateString(
                        "en-NG",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  Total Penalty
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(selectedCase.totalPenalty)}
                </p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  Total Paid
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedCase.totalPaid)}
                </p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl col-span-2">
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  Outstanding Balance
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(
                    Number(selectedCase.totalPenalty) -
                      Number(selectedCase.totalPaid),
                  )}
                </p>
              </div>
            </div>

            {/* Address */}
            {selectedCase.address && (
              <div className="p-3.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  Business Address
                </p>
                <p className="text-sm text-gray-700">{selectedCase.address}</p>
              </div>
            )}

            {/* Resolution Details (if resolved/suspended) */}
            {selectedCase.status !== "pending" && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Resolution Details
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold text-gray-800">
                      {selectedCase.resolutionType
                        ?.split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ") || "N/A"}
                    </span>
                  </div>
                  {selectedCase.penaltyReduction != null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Penalty Reduction</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedCase.penaltyReduction)}
                      </span>
                    </div>
                  )}
                  {selectedCase.suspensionReason && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Suspension Reason</span>
                      <span className="font-semibold text-gray-800">
                        {selectedCase.suspensionReason}
                      </span>
                    </div>
                  )}
                  {selectedCase.suspendedUntil && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Suspended Until</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(
                          selectedCase.suspendedUntil,
                        ).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {(selectedCase as any).remark && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Remark</span>
                      <span className="font-semibold text-gray-800">
                        {(selectedCase as any).remark}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compliance Items Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Compliance Items
                </h4>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {selectedCase.complianceItems?.length || 0} items
                </span>
              </div>

              {selectedCase.complianceItems &&
              selectedCase.complianceItems.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedCase.complianceItems.map(
                    (item: any, index: number) => (
                      <div
                        key={item.id}
                        className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white/50 hover:shadow-md transition-all"
                      >
                        <button
                          onClick={() =>
                            setExpandedComplianceItem(
                              expandedComplianceItem === item.id
                                ? null
                                : item.id,
                            )
                          }
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500">
                              #{index + 1}
                            </span>
                            <div>
                              <span className="text-sm font-semibold text-gray-800 block">
                                {item.sectionTitle || item.sectionCode}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {item.sectionCode}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getComplianceStatusBadge(item.complianceStatus)}`}
                            >
                              {item.complianceStatus === "non_compliant"
                                ? "Non-Compliant"
                                : "Compliant"}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                              expandedComplianceItem === item.id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {expandedComplianceItem === item.id && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                  Period (days)
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {item.periodOfNonCompliance}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                  Officers
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {item.officersPenalised}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                  Computation
                                </p>
                                <p className="text-xs font-mono text-gray-700">
                                  {item.penaltyComputation}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                  Total Payable
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {formatCurrency(item.totalPayable)}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                  Amount Paid
                                </p>
                                <p className="text-sm font-bold text-green-600">
                                  {formatCurrency(item.amountPaid)}
                                </p>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-xl col-span-2 border border-orange-100">
                                <p className="text-[10px] text-orange-500 uppercase font-semibold mb-1">
                                  Outstanding
                                </p>
                                <p className="text-sm font-bold text-orange-700">
                                  {formatCurrency(
                                    item.totalPayable - item.amountPaid,
                                  )}
                                </p>
                              </div>
                            </div>

                            {item.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                                  Notes
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
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
                <div className="text-center py-10 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    No compliance items recorded
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add compliance items to track violations
                  </p>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Payment History
                </h4>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {payments.length}{" "}
                  {payments.length === 1 ? "payment" : "payments"}
                </span>
              </div>
              {payments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-green-100 rounded-xl flex items-center justify-center text-xs font-bold text-green-600">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-gray-800">
                            {formatCurrency(payment.amount)}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "en-NG",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200">
                  <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    No payments recorded
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Record payments to track financial progress
                  </p>
                </div>
              )}
            </div>

            {/* Record Payment - Only for pending cases */}
            {selectedCase.status === "pending" && (
              <form
                onSubmit={handleRecordPayment}
                className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100"
              >
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Record Payment
                </h4>

                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-orange-600">
                    Outstanding Balance
                  </span>
                  <span className="text-lg font-bold text-orange-700">
                    {formatCurrency(
                      Number(selectedCase.totalPenalty) -
                        Number(selectedCase.totalPaid),
                    )}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Amount (₦) <span className="text-red-500">*</span>
                  </label>
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
                    placeholder="Enter payment amount"
                    required
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked && selectedCase) {
                        const outstanding =
                          Number(selectedCase.totalPenalty) -
                          Number(selectedCase.totalPaid);
                        setPaymentForm((prev) => ({
                          ...prev,
                          amount: String(outstanding),
                        }));
                      } else {
                        setPaymentForm((prev) => ({ ...prev, amount: "" }));
                      }
                    }}
                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="text-xs text-gray-600">
                    Pay complete outstanding balance
                  </span>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{paymentError}</p>
                  </div>
                )}
                {paymentSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-600">{paymentSuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecordingPayment
                    ? "Recording Payment..."
                    : "Record Payment"}
                </button>
              </form>
            )}

            {/* Actions Footer */}
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCase(null);
                  setExpandedComplianceItem(null);
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Close
              </button>
              {selectedCase.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowComplianceModal(selectedCase.id);
                    }}
                    className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
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
                      className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
                    >
                      Resolve Case
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CasesPage;
