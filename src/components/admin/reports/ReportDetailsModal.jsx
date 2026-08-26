import { useEffect, useState } from "react";
import ImageViewerModal from "../../common/ImageViewerModal";
import { getUserProfile } from "../../../services/user.service";
import { getProductById } from "../../../services/product.service";
import { formatFullDateTime } from "../../../utils/date";
import useStartConversation from "../../../hooks/useStartConversation";

function getStatusClasses(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "reviewing":
      return "bg-blue-100 text-blue-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    case "dismissed":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function ReportDetailsModal({
  report,
  onClose,
  onReview,
  onResolve,
  onDismiss,
  onToggleUserSuspension,
  onToggleProductAvailability,
}) {
  const startConversation = useStartConversation();
  const [showEvidenceViewer, setShowEvidenceViewer] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [reportedUserProfile, setReportedUserProfile] = useState(null);
  const [targetProduct, setTargetProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const targetType = report?.targetType || report?.type || "user";

  useEffect(() => {
    if (!report) {
      setAdminNotes("");
      setReportedUserProfile(null);
      setTargetProduct(null);
      return;
    }

    setAdminNotes(report.adminNotes || "");

    // Fetch reported user live status
    if (report.reportedUserId) {
      getUserProfile(report.reportedUserId)
        .then(setReportedUserProfile)
        .catch(() => {});
    }

    // Fetch target product if target is a product
    if (targetType === "product" && report.targetId) {
      getProductById(report.targetId)
        .then(setTargetProduct)
        .catch(() => {});
    }
  }, [report, targetType]);

  if (!report) return null;

  const isUserSuspended = reportedUserProfile?.status === "suspended";
  const isProductAvailable = targetProduct?.available !== false;

  const handleUserSuspension = async () => {
    if (!report.reportedUserId || !onToggleUserSuspension) return;
    setActionLoading(true);
    try {
      const nextStatus = isUserSuspended ? "active" : "suspended";
      await onToggleUserSuspension(report.reportedUserId, nextStatus);
      setReportedUserProfile((prev) => prev ? { ...prev, status: nextStatus } : prev);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProductAvailability = async () => {
    if (!report.targetId || !onToggleProductAvailability) return;
    setActionLoading(true);
    try {
      const nextAvailable = !isProductAvailable;
      await onToggleProductAvailability(report.targetId, nextAvailable);
      setTargetProduct((prev) => prev ? { ...prev, available: nextAvailable } : prev);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChatReporter = () => {
    if (!report?.reporterId) return;
    onClose?.();
    startConversation({
      uid: report.reporterId,
      fullname: report.reporterName || "Reporter",
      username: report.reporterUsername || "",
      role: report.reporterRole || "consumer",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl border border-gray-100 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <i className="ri-alert-line text-xl" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  Report Investigation
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Review case details and execute moderation actions
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-200/70 hover:text-gray-700 transition cursor-pointer"
              aria-label="Close"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            {/* Reason & Status Card */}
            <div className="rounded-2xl bg-white p-4 border border-gray-200/90 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Report Reason
                  </p>
                  <p className="mt-0.5 text-base font-bold text-gray-900">
                    {report.reason || "No reason provided"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize shadow-2xs ${getStatusClasses(
                      report.status,
                    )}`}
                  >
                    {report.status || "pending"}
                  </span>
                </div>
              </div>

              {report.targetTitle && (
                <div className="pt-2.5 border-t border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Reported Target ({targetType})
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {report.targetTitle}
                  </p>
                </div>
              )}

              {report.createdAt && (
                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Date & Time Submitted
                  </span>
                  <span className="font-bold text-gray-800">
                    {formatFullDateTime(report.createdAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Description / Explanation Card */}
            <div className="rounded-2xl bg-white p-4 border border-gray-200/90 shadow-xs space-y-1.5">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Description / User Explanation
              </p>
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-3.5 text-xs sm:text-sm leading-relaxed text-gray-900 font-medium whitespace-pre-wrap">
                {report.description || "No additional description provided."}
              </div>
            </div>

            {/* Evidence / Proof Screenshot */}
            {report.evidenceUrl && (
              <div className="rounded-2xl bg-white p-4 border border-gray-200/90 shadow-xs space-y-2">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  Attached Evidence
                </p>
                <div
                  onClick={() => setShowEvidenceViewer(true)}
                  className="relative group inline-block rounded-2xl overflow-hidden border border-gray-200 bg-black/5 shadow-xs cursor-pointer"
                >
                  <img
                    src={report.evidenceUrl}
                    alt="Report evidence"
                    className="h-36 w-auto max-w-[280px] object-cover transition duration-200 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEvidenceViewer(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    <i className="ri-zoom-in-line text-base" />
                    View Fullscreen & Zoom
                  </button>
                </div>
              </div>
            )}

            {/* Parties Summary & Enforcement Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reported User & Ban Action */}
              <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Reported User
                    </p>
                    {reportedUserProfile && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shadow-2xs ${
                        isUserSuspended ? "bg-red-200 text-red-900 border border-red-300" : "bg-green-100 text-green-900 border border-green-200"
                      }`}>
                        {reportedUserProfile.status || "active"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1.5">
                    {report.reportedUserName || "User"}
                  </p>
                  {report.reportedUserUsername && (
                    <p className="text-xs text-gray-600 font-medium">
                      @{report.reportedUserUsername}
                    </p>
                  )}
                </div>

                {onToggleUserSuspension && (
                  <button
                    type="button"
                    onClick={handleUserSuspension}
                    disabled={actionLoading}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                      isUserSuspended
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    <i className={isUserSuspended ? "ri-user-follow-line" : "ri-user-unfollow-line"} />
                    {isUserSuspended ? "Reactivate User" : "Suspend User"}
                  </button>
                )}
              </div>

              {/* Reporter Info & Chat Action */}
              <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Submitted By
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1.5">
                    {report.reporterName || "Reporter"}
                  </p>
                  {report.reporterUsername && (
                    <p className="text-xs text-gray-600 font-medium">
                      @{report.reporterUsername}
                    </p>
                  )}
                  {report.reporterRole && (
                    <span className="inline-block mt-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 capitalize border border-gray-200">
                      {report.reporterRole}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {report.reporterId && (
                    <button
                      type="button"
                      onClick={handleChatReporter}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#2D6A4F] bg-[#E8F5EE] hover:bg-[#D8F3DC] border border-[#2D6A4F]/20 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                      title="Open chat with reporter"
                    >
                      <i className="ri-chat-1-line text-sm font-bold" />
                      Chat Reporter
                    </button>
                  )}

                  {targetType === "product" && onToggleProductAvailability && (
                    <button
                      type="button"
                      onClick={handleProductAvailability}
                      disabled={actionLoading}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                        isProductAvailable
                          ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          : "border border-green-300 bg-green-50 text-green-900 hover:bg-green-100"
                      }`}
                    >
                      <i className={isProductAvailable ? "ri-eye-off-line" : "ri-eye-line"} />
                      {isProductAvailable ? "Unpublish Listing" : "Republish Listing"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Resolution Notes */}
            <div className="rounded-2xl bg-white p-4 border border-gray-200/90 shadow-xs space-y-1.5">
              <label htmlFor="admin-resolution-notes" className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
                Moderator Note / Explanation for Reporter
              </label>
              <textarea
                id="admin-resolution-notes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional internal note or resolution comment sent to the reporter..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs sm:text-sm text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 focus:outline-none transition resize-none"
              />
            </div>

            {/* Action Buttons for Admin */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                {report.status === "pending" && onReview && (
                  <button
                    type="button"
                    onClick={() => onReview(report.id)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <i className="ri-search-eye-line mr-1.5" />
                    Reviewing
                  </button>
                )}

                {report.status !== "resolved" && onResolve && (
                  <button
                    type="button"
                    onClick={() => onResolve(report.id, adminNotes)}
                    className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] text-xs font-bold text-white hover:bg-[#1B4332] transition cursor-pointer"
                  >
                    <i className="ri-check-line mr-1.5" />
                    Resolve Case
                  </button>
                )}

                {report.status !== "dismissed" && onDismiss && (
                  <button
                    type="button"
                    onClick={() => onDismiss(report.id, adminNotes)}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <i className="ri-close-circle-line mr-1.5" />
                    Dismiss
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Fullscreen Zoom Modal */}
      {showEvidenceViewer && report.evidenceUrl && (
        <ImageViewerModal
          isOpen={showEvidenceViewer}
          onClose={() => setShowEvidenceViewer(false)}
          src={report.evidenceUrl}
          imageUrl={report.evidenceUrl}
          title="Report Evidence Photo"
        />
      )}
    </>
  );
}
