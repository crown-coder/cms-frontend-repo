import { useEffect, useState, useContext } from "react";
import { getSections, createSection } from "../../services/complianceService";
import type { ComplianceSection } from "../../types";
import { AuthContext } from "../../context/AuthContext";
import {
  BookOpen,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Code,
  Calendar,
  ChevronRight,
} from "lucide-react";

const ComplianceSections = () => {
  const { user } = useContext(AuthContext);
  const [sections, setSections] = useState<ComplianceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
  });

  const canCreateSections =
    user?.role === "super_admin" || user?.role === "enforcement_head";

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

      setSections([...sections, newSection]);
      setFormData({ code: "", title: "", description: "" });
      setShowForm(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5 text-green-600 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-700">Loading sections</p>
          <p className="text-xs text-gray-400 mt-1">
            Fetching compliance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-light text-gray-800 tracking-tight">
            Compliance Sections
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {sections.length} {sections.length === 1 ? "section" : "sections"}{" "}
            total
          </p>
        </div>

        {canCreateSections && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Section</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs text-green-600 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            {success}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        </div>
      )}

      {/* Create Section Form */}
      {showForm && canCreateSections && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Create New Section
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ code: "", title: "", description: "" });
                setError("");
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Section Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Unique identifier for this section
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Section Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Corporate Governance"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600/20 focus:border-green-600 bg-gray-50/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ code: "", title: "", description: "" });
                    setError("");
                  }}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sections Grid */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600">
            No compliance sections
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {canCreateSections
              ? "Create your first section to get started"
              : "Sections will appear here once created"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {section.title}
                      </h3>
                      <button
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === section.id ? null : section.id,
                          )
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${expandedSection === section.id ? "rotate-90" : ""}`}
                        />
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-0.5">
                      {section.code}
                    </p>
                  </div>
                </div>

                {(expandedSection === section.id || section.description) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {section.description ? (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {section.description}
                      </p>
                    ) : (
                      expandedSection === section.id && (
                        <p className="text-xs text-gray-400 italic">
                          No description provided
                        </p>
                      )
                    )}

                    {section.createdAt && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-[10px] text-gray-400">
                          Created{" "}
                          {new Date(section.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceSections;
