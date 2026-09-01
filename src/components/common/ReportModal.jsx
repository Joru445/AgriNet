import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createReport, getActiveReportForTarget } from "../../services/report.service";
import { uploadReportProof } from "../../services/cloudinary.service";
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

function formatCleanTitle(title, fallback) {
  if (!title) return fallback || "Reported Item";
  return title.replace(/\s*\([a-zA-Z0-9_-]{6,}\)\s*/g, "").trim() || fallback || "Reported Item";
}

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
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [activeReport, setActiveReport] = useState(null);
  const [checkingActive, setCheckingActive] = useState(true);

  const reportedUid = reportedUser?.uid || reportedUser?.id;
  const displayTargetTitle = formatCleanTitle(
    targetTitle,
    reportedUser?.fullname || (reportedUser?.username ? `@${reportedUser.username}` : "Reported Target"),
  );

  // Check if an unresolved report already exists for this target
  useEffect(() => {
    let isCancelled = false;

    if (isOpen && profile?.uid) {
      setSelectedReason("");
      setDescription("");
      setEvidenceFile(null);
      setEvidencePreview(null);
      setError(null);
      setSubmitting(false);
      setCheckingActive(true);

      getActiveReportForTarget({
        reporterId: profile.uid,
        targetId: targetId || reportedUid,
        reportedUserId: reportedUid,
        targetType,
      })
        .then((existing) => {
          if (!isCancelled) {
            setActiveReport(existing);
            setCheckingActive(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setCheckingActive(false);
          }
        });
    } else {
      setActiveReport(null);
      setCheckingActive(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, profile?.uid, targetId, reportedUid, targetType]);

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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedReason) {
      setError("Please select a reason for your report.");
      return;
    }

    if (!profile?.uid) {
      setError("You must be logged in to submit a report.");
      return;
    }

    if (!reportedUid) {
      setError("Target user could not be identified.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let evidenceUrl = "";
      let evidencePublicId = "";

      if (evidenceFile) {
        try {
          const uploadRes = await uploadReportProof(evidenceFile);
          evidenceUrl = uploadRes.url;
          evidencePublicId = uploadRes.publicId;
        } catch (uploadErr) {
          console.warn("Evidence proof upload failed:", uploadErr);
          showToast.warning("Could not upload screenshot proof, submitting report without attachment.");
        }
      }

      await createReport({
        reporterId: profile.uid,
        reporterName: profile.fullname || profile.username || "Anonymous",
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
        targetTitle: displayTargetTitle,

        reason: selectedReason,
        description: description.trim(),
        evidenceUrl,
        evidencePublicId,
      });

      showToast.success("Report submitted! Our moderation team will investigate and contact you if needed.");
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
        className="relative w-full max-w-lg rounded-3xl bg-[var(--agri-card)] shadow-2xl border border-[var(--agri-border-subtle)] overflow-hidden my-auto anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/90">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              activeReport ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              <i className={activeReport ? "ri-shield-check-line text-xl" : "ri-alert-line text-xl font-bold"} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--agri-text)] leading-tight">
                {activeReport ? "Report Under Review" : "Submit a Report"}
              </h2>
              <p className="text-xs text-[var(--agri-text-muted)] font-medium mt-0.5">
                {activeReport ? "An active report is already being investigated" : "Help us keep AgriNet safe and trustworthy"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--agri-text-muted)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text-secondary)] transition cursor-pointer"
            aria-label="Close modal"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        {checkingActive ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <i className="ri-loader-4-line animate-spin text-3xl text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            <p className="text-xs text-[var(--agri-text-muted)] font-medium">Checking report status...</p>
          </div>
        ) : activeReport ? (
          /* Active Report Already Exists Screen */
          <div className="p-5 sm:p-6 space-y-4">
            {/* Target Info Summary */}
            <div className="flex items-center justify-between rounded-2xl bg-[var(--agri-card)] border border-[var(--agri-border-subtle)] shadow-xs p-3.5">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                  Target: {getTargetLabel()}
                </span>
                <p className="text-xs sm:text-sm font-bold text-[var(--agri-text)] truncate mt-0.5">
                  {displayTargetTitle}
                </p>
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold px-3 py-1 capitalize shrink-0 ml-2 shadow-2xs">
                {activeReport.status === "reviewing" ? "Under Investigation" : "Pending Review"}
              </span>
            </div>

            {/* Submitted Report Summary */}
            <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4 shadow-xs space-y-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  Submitted Reason
                </p>
                <p className="text-sm font-bold text-[var(--agri-text)] mt-0.5">
                  {activeReport.reason}
                </p>
              </div>

              {activeReport.description && (
                <div className="pt-2.5 border-t border-[var(--agri-border-subtle)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    Your Explanation
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--agri-text)] mt-1 leading-relaxed font-medium">
                    {activeReport.description}
                  </p>
                </div>
              )}

              {activeReport.evidenceUrl && (
                <div className="pt-2.5 border-t border-[var(--agri-border-subtle)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)] mb-1.5">
                    Attached Evidence
                  </p>
                  <img
                    src={activeReport.evidenceUrl}
                    alt="Submitted proof"
                    className="h-24 w-auto max-w-[200px] object-cover rounded-xl border border-[var(--agri-border)] shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* Moderator Contact Notice Banner */}
            <div className="rounded-2xl border border-[#2D6A4F]/25 bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] p-4 shadow-xs text-xs sm:text-sm text-[#1B4332] dark:text-[var(--agri-brand-light)] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                <i className="ri-information-fill text-base" />
                <span>Notice from Moderation Team</span>
              </div>
              <p className="leading-relaxed font-medium">
                We have received your report and our team is actively investigating the matter.
                <strong> We will contact you via your registered email or messages if further details or action are needed.</strong>
              </p>
              <p className="text-[11px] text-[#2D6A4F] dark:text-[var(--agri-brand)]/80 pt-1">
                You can only submit one report at a time for this item until the current report is resolved.
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[#2D6A4F] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#1B4332] active:scale-95 transition shadow-md hover:shadow-lg cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        ) : (
          /* Normal Submission Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
            {/* Target Info Summary */}
            <div className="flex items-center justify-between rounded-2xl bg-[var(--agri-card)] border border-[var(--agri-border-subtle)] shadow-xs p-3.5">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                  Reporting {getTargetLabel()}
                </span>
                <p className="text-xs sm:text-sm font-bold text-[var(--agri-text)] truncate mt-0.5">
                  {displayTargetTitle}
                </p>
              </div>
              {reportedUser?.username && (
                <span className="text-xs font-semibold text-[var(--agri-text-secondary)] bg-[var(--agri-hover)] border border-[var(--agri-border)] px-2.5 py-1 rounded-lg shrink-0 ml-2 shadow-2xs">
                  @{reportedUser.username}
                </span>
              )}
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--agri-text)] mb-2 uppercase tracking-wide">
                Why are you reporting this? <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2">
                {REPORT_REASONS.map((item) => {
                  const isSelected = selectedReason === item.label;
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none shadow-2xs ${
                        isSelected
                          ? "border-[#2D6A4F] bg-[#E8F5EE]/40 dark:bg-[var(--agri-brand-bg-alt)]/40 ring-2 ring-[#2D6A4F]/20 shadow-xs"
                          : "border-[var(--agri-border-subtle)] bg-[var(--agri-card)] hover:bg-[var(--agri-hover)] hover:border-[var(--agri-border)] hover:shadow-xs"
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
                        className="mt-0.5 h-4 w-4 text-[#2D6A4F] dark:text-[var(--agri-brand)] focus:ring-[#2D6A4F] cursor-pointer"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-[var(--agri-text)]">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[var(--agri-text-muted)] mt-0.5 leading-normal">
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
              <label htmlFor="report-description" className="block text-xs sm:text-sm font-bold text-[var(--agri-text)] mb-1.5 uppercase tracking-wide">
                Additional Details <span className="text-[var(--agri-text-muted)] font-normal lowercase">(optional)</span>
              </label>
              <textarea
                id="report-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide any extra context, messages, or details to assist our review..."
                className="w-full rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 p-3.5 text-xs sm:text-sm text-[var(--agri-text)] font-medium placeholder-[var(--agri-text-muted)] focus:bg-[var(--agri-input-bg)] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 focus:outline-none shadow-2xs transition resize-none"
              />
            </div>

            {/* Evidence / Screenshot Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--agri-text)] mb-1.5 uppercase tracking-wide">
                Attach Screenshot / Proof <span className="text-[var(--agri-text-muted)] font-normal lowercase">(optional)</span>
              </label>
              {evidencePreview ? (
                <div className="relative inline-block rounded-2xl overflow-hidden border border-[var(--agri-border)] bg-[var(--agri-hover)] shadow-xs">
                  <img
                    src={evidencePreview}
                    alt="Proof preview"
                    className="h-28 w-auto max-w-[240px] object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFile(null);
                      setEvidencePreview(null);
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition shadow-sm cursor-pointer"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <i className="ri-close-line text-base" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3.5 p-3.5 rounded-2xl border-2 border-dashed border-[var(--agri-border)] hover:border-[#2D6A4F] bg-[var(--agri-hover)]/70 hover:bg-[#E8F5EE] dark:hover:bg-[var(--agri-brand-bg-alt)]/30 dark:bg-[var(--agri-brand-bg-alt)]/30 cursor-pointer shadow-2xs transition select-none">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEvidenceFile(file);
                        setEvidencePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)] shadow-xs border border-[var(--agri-border)]">
                    <i className="ri-image-add-line text-xl font-bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-[var(--agri-text)]">Upload screenshot or photo proof</span>
                    <p className="text-[11px] text-[var(--agri-text-muted)] mt-0.5">PNG, JPG, WEBP receipt or chat evidence</p>
                  </div>
                </label>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-bold shadow-2xs">
                <i className="ri-error-warning-line text-base shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--agri-border-subtle)]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-[var(--agri-border)] text-xs sm:text-sm font-bold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] active:scale-95 transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !selectedReason}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-alert-fill text-base" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
