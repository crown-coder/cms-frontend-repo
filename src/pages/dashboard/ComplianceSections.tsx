import { useEffect, useState, useContext } from "react";
import { getSections, createSection } from "../../services/complianceService";
import type { ComplianceSection } from "../../types";
import { AuthContext } from "../../context/AuthContext";
import { BookOpen, Plus, X, AlertCircle, CheckCircle } from "lucide-react";

const ComplianceSections = () => {
  const { user } = useContext(AuthContext);
  const [sections, setSections] = useState<ComplianceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
  });

  // Check if user can create sections
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

    // Validation
    if (!formData.code.trim()) {
      setError("Section code is required");
      return;
    }

    if (!formData.title.trim()) {
      setError("Section title is required");
      return;
    }

    // Check for duplicate code
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
      setSuccess("Compliance section created successfully!");
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-800">
            Compliance Sections
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all compliance sections in the system
          </p>
        </div>
        {canCreateSections && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Section
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 ml-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 ml-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        </div>
      )}

      {/* Create Section Form */}
      {showForm && canCreateSections && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Create New Section
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ code: "", title: "", description: "" });
                setError("");
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Code <span className="text-red-500">*</span>
              </label>
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for this section
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                placeholder="e.g., Corporate Governance, Financial Reporting"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                placeholder="Optional description of this compliance section..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ code: "", title: "", description: "" });
                  setError("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Section"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-3 text-sm text-gray-600">Loading sections...</p>
          </div>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-xl border border-gray-200 border-dashed">
          <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">
            No compliance sections yet
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {canCreateSections
              ? "Create a new section to get started"
              : "Sections will appear here once they are created"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-800">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    Code: {section.code}
                  </p>
                </div>
              </div>

              {section.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {section.description}
                </p>
              )}

              {section.createdAt && (
                <p className="text-xs text-gray-400 mt-3">
                  Created: {new Date(section.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceSections;
