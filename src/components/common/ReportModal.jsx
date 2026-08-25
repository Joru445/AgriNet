import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createReport } from "../../services/report.service";
import { showToast } from "../../utils/toast";

const REPORT_REASONS = [
  {
    id: "scam_fraud",
    label: "Scam or Fraud",
    description: "Dishonest transactions, payment fraud, fake receipts, or non-delivery",
    icon: "ri-alarm-warning-line",
    color: "text-red-600 bg-red-50",
  },
  {
    id: "bullying_harassment",
    label: "Bullying or Harassment",
    description: "Abusive language, threats, intimidation, hate speech, or stalking",
    icon: "ri-user-unfollow-line",
    color: "text-orange-600 bg-orange-50",
  },
  {
    id: "human_trafficking",
    label: "Human Trafficking or Exploitation",
    description: "Forced labor, modern slavery, severe exploitation, or abuse",
    icon: "ri-hand-sanitizer-line",
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: "prohibited_goods",
    label: "Fake or Prohibited Products",
    description: "Deceptive descriptions, counterfeit goods, illegal or unsafe items",
    icon: "ri-prohibited-line",
    color: "text-amber-600 bg-amber-50",
  },
  {
    id: "inappropriate_content",
    label: "Inappropriate Content",
    description: "Explicit images, violence, vulgarity, or offensive material",
    icon: "ri-eye-off-line",
    color: "text-rose-600 bg-rose-50",
  },
  {
    id: "spam_impersonation",
    label: "Spam or Impersonation",
    description: "Unsolicited ads, bot messages, fake accounts, or identity theft",
    icon: "ri-spam-line",
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "other",
    label: "Other Issue",
    description: "Any other violation or safety concern not listed above",
    icon: "ri-more-line",
    color: "text-gray-600 bg-gray-50",
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType = "user",
  targetId = null,
  targetTitle = "",
  reportedUser = null,
}) {
  const { profile } = useAuth();

  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setDescription("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const reportedUid = reportedUser?.uid || reportedUser?.id;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedReason) {
      setError("Please select a reason for your report.");
      return;
    }

    if (selectedReason === "Other Issue" && !description.trim()) {
      setError("Please provide details for 'Other Issue'.");
      return;
    }

    if (!profile?.uid) {
      setError("You must be logged in to submit a report.");
      return;
    }

    if (!reportedUid) {
      setError("Unable to identify the user being reported.");
      return;
    }

    if (profile.uid === reportedUid) {
      setError("You cannot submit a report against yourself.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await createReport({
        reporterId: profile.uid,
        reporterName: profile.fullname || profile.username || "User",
        reporterUsername: profile.username || "",
        reporterEmail: profile.email || "",
        reporterRole: profile.role || "consumer",

        reportedUserId: reportedUid,
        reportedUserName: reportedUser.fullname || reportedUser.username || "User",
        reportedUserUsername: reportedUser.username || "",
        reportedUserRole: reportedUser.role || "",
        reportedUserEmail: reportedUser.email || "",

        targetType,
        targetId: targetId || reportedUid,
        targetTitle: targetTitle || reportedUser.fullname || reportedUser.username || "Reported Item",

        reason: selectedReason,
        description: description.trim(),
      });

      showToast.success("Report submitted. Our moderation team will review it.");
      onClose?.();
    } catch (err) {
      console.error("Failed to submit report:", err);
      setError(err?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function getTargetLabel() {
    switch (targetType) {
      case "message":
        return "Conversation / Message";
      case "inquiry":
        return "Purchase Inquiry";
      case "product":
        return "Product Listing";
      case "profile":
      case "user":
      default:
        return "User Account";
    }
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <i className="ri-shield-alert-line text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Submit a Report
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Help us keep AgriNet safe and trustworthy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-200/70 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close modal"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Info Summary */}
          <div className="flex items-center justify-between rounded-2xl bg-[#E8F5EE]/60 border border-[#2D6A4F]/15 px-3.5 py-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F]">
                Reporting {getTargetLabel()}
              </span>
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {targetTitle || reportedUser?.fullname || `@${reportedUser?.username}` || "Target Item"}
              </p>
            </div>
            {reportedUser?.username && (
              <span className="text-xs font-semibold text-gray-500 shrink-0 ml-2">
                @{reportedUser.username}
              </span>
            )}
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
              Why are you reporting this? <span className="text-red-500">*</span>
            </label>

            <div className="space-y-2">
              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.label;
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-[#2D6A4F] bg-[#E8F5EE]/40 ring-2 ring-[#2D6A4F]/20 shadow-xs"
                        : "border-gray-200/90 bg-white hover:bg-gray-50/80 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={item.label}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedReason(item.label);
                        setError(null);
                      }}
                      className="mt-0.5 h-4 w-4 text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-normal">
                        {item.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label htmlFor="report-description" className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
              Additional Details <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="report-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any extra context, messages, or details to assist our review..."
              className="w-full rounded-2xl border border-gray-200/90 p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 focus:outline-none transition resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-700 font-medium">
              <i className="ri-error-warning-line text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedReason}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-red-700 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base" />
                  Submitting...
                </>
              ) : (
                <>
                  <i className="ri-shield-alert-fill text-base" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
