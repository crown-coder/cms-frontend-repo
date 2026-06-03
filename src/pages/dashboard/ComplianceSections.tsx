import { useEffect, useState, useContext, useRef } from "react";
import { getSections, createSection } from "../../services/complianceService";
import type { ComplianceSection } from "../../types";
import { AuthContext } from "../../context/AuthContext";
import {
  BookOpen,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  Hash,
  FileText,
  Clock,
  ArrowUpDown,
  Copy,
  Check,
  Layers,
} from "lucide-react";

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 max-w-lg w-full max-h-[85vh] overflow-hidden">
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

const ComplianceSections = () => {
  const { user } = useContext(AuthContext);
  const [sections, setSections] = useState<ComplianceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"code" | "title" | "createdAt">(
    "code",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
  });

  const canCreateSections =
    user?.role === "super_admin" || user?.role === "enforcement_head";

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

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSections();
      setSections(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load compliance sections";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSections();
    setIsRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.code.trim()) {
      setError("Section code is required");
      return;
    }

    if (!formData.title.trim()) {
      setError("Section title is required");
      return;
    }

    if (
      sections.some(
        (section) => section.code.toLowerCase() === formData.code.toLowerCase(),
      )
    ) {
      setError("A section with this code already exists");
      return;
    }

    setIsSubmitting(true);

    try {
      const newSection = await createSection({
        code: formData.code.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });

      setSections([newSection, ...sections]);
      setFormData({ code: "", title: "", description: "" });
      setShowCreateModal(false);
      setSuccess("Section created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create compliance section";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (field: "code" | "title" | "createdAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter and sort sections
  const filteredSections = sections
    .filter((section) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        section.code.toLowerCase().includes(term) ||
        section.title.toLowerCase().includes(term) ||
        section.description?.toLowerCase().includes(term)
      );
    })
    .sort((a: any, b: any) => {
      const aVal = (a[sortField] || "").toString().toLowerCase();
      const bVal = (b[sortField] || "").toString().toLowerCase();
      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-7 h-7 text-green-600 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            Loading sections
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Fetching compliance data...
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
              Compliance Sections
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {filteredSections.length}{" "}
              {filteredSections.length === 1 ? "section" : "sections"} found
              {searchTerm && ` for "${searchTerm}"`}
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

            {canCreateSections && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-xs font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Section</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50/90 backdrop-blur-xl border border-green-200 rounded-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50/90 backdrop-blur-xl border border-red-200 rounded-2xl flex items-center gap-3 animate-slide-up">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Search and Sort Bar */}
      {sections.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search sections by code, title, or description..."
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
                onClick={() => handleSort("code")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-colors ${
                  sortField === "code"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                <Hash className="w-3 h-3" />
                Code
                {sortField === "code" && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleSort("title")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-colors ${
                  sortField === "title"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                <FileText className="w-3 h-3" />
                Title
                {sortField === "title" && <ArrowUpDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleSort("createdAt")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-colors ${
                  sortField === "createdAt"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                <Clock className="w-3 h-3" />
                Date
                {sortField === "createdAt" && (
                  <ArrowUpDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {sections.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-md shadow-black/5 border-dashed p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-600">
            No compliance sections
          </p>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
            {canCreateSections
              ? "Create your first compliance section to start tracking violations"
              : "Sections will appear here once they are created by an administrator"}
          </p>
          {canCreateSections && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-xs font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Section
            </button>
          )}
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-md shadow-black/5 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-600">No results found</p>
          <p className="text-xs text-gray-400 mt-1.5">
            No sections match "{searchTerm}". Try a different search term.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-3 text-xs font-medium text-green-600 hover:text-green-700"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Table View - Professional and clean */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50">
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th
                      className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center gap-1">
                        Code
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-1">
                        Title
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th
                      className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredSections.map((section, index) => (
                    <tr
                      key={section.id}
                      className="hover:bg-white/50 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-sm text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-green-600 bg-green-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {section.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(section.code)}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy code"
                          >
                            {copiedCode === section.code ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            {section.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-gray-500 max-w-xs truncate">
                          {section.description || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {section.createdAt
                            ? new Date(section.createdAt).toLocaleDateString(
                                "en-NG",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-5 py-3.5 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Showing {filteredSections.length}{" "}
                  {filteredSections.length === 1 ? "section" : "sections"}
                </span>
                <span className="text-[10px] text-gray-400">
                  Sorted by {sortField === "createdAt" ? "date" : sortField} (
                  {sortDirection === "asc" ? "ascending" : "descending"})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <Layers className="w-3.5 h-3.5 text-green-600" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {sections.length}
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  With Description
                </p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {sections.filter((s) => s.description).length}
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <Hash className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Unique Codes
                </p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {new Set(sections.map((s) => s.code)).size}
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md shadow-black/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Latest
                </p>
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">
                {sections[0]?.code || "—"}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Create Section Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ code: "", title: "", description: "" });
          setError("");
        }}
        title="Create Compliance Section"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Section Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., SEC001, COMP-A"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Unique identifier (uppercase, no spaces)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Section Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g., Corporate Governance, Financial Reporting"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what this compliance section covers and how it should be applied..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ code: "", title: "", description: "" });
                setError("");
              }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Section"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplianceSections;
