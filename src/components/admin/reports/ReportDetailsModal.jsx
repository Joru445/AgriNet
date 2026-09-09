import { useEffect, useState } from "react";
import ImageViewerModal from "../../common/ImageViewerModal";
import { formatFullDateTime } from "../../../utils/date";
import useStartConversation from "../../../hooks/useStartConversation";
import { useLanguage } from "../../../context/LanguageContext";
import ResponsiveModal from "../../ui/ResponsiveModal";
import { DURATION_OPTIONS } from "../../../utils/suspensionOptions";

function getStatusClasses(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20";
    case "reviewing":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20";
    case "resolved":
      return "bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20";
    case "dismissed":
      return "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] border border-[var(--agri-border)]";
    default:
      return "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] border border-[var(--agri-border)]";
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
  const { t } = useLanguage();
  const startConversation = useStartConversation();
  const [showEvidenceViewer, setShowEvidenceViewer] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendMode, setSuspendMode] = useState(false);
  const [suspensionDuration, setSuspensionDuration] = useState("7d");
  const [suspensionReason, setSuspensionReason] = useState("");

  const targetType = report?.targetType || report?.type || "user";

  const reportedUser = report?.reportedUser || null;
  const targetProduct = report?.targetProduct || null;

  useEffect(() => {
    if (!report) {
      setAdminNotes("");
      setSuspendMode(false);
      setSuspensionDuration("7d");
      setSuspensionReason("");
      return;
    }
    setAdminNotes(report.adminNotes || "");
    setSuspendMode(false);
    setSuspensionDuration("7d");
    setSuspensionReason("");
  }, [report]);

  if (!report) return null;

  const isUserSuspended = reportedUser?.status === "suspended";
  const isProductAvailable = targetProduct?.available !== false;

  const handleUserSuspension = async () => {
    if (!report.reportedUserId || !onToggleUserSuspension) return;

    if (isUserSuspended) {
      setActionLoading(true);
      try {
        await onToggleUserSuspension(report.reportedUserId, "active");
      } finally {
        setActionLoading(false);
      }
    } else {
      setSuspendMode(true);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!report.reportedUserId || !onToggleUserSuspension) return;
    setActionLoading(true);
    try {
      await onToggleUserSuspension(report.reportedUserId, "suspended", {
        durationPreset: suspensionDuration,
        reason: suspensionReason,
      });
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleChatReporter = () => {
    if (!report?.reporterId) return;
    onClose?.();
    startConversation({
      uid: report.reporterId,
      fullname: report.reporterName || t("adminReport.reporterFallback"),
      username: report.reporterUsername || "",
      role: report.reporterRole || "consumer",
    });
  };

  return (
    <>
      <ResponsiveModal
        open={Boolean(report)}
        onClose={onClose}
        title={t("adminReport.investigationTitle")}
        maxWidth="max-w-xl"
      >
          <div className="p-6 space-y-4">
            {/* Reason & Status Card */}
            <div className="rounded-2xl bg-[var(--agri-card)] p-4 border border-[var(--agri-border-subtle)] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    {t("adminReport.reportReason")}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-[var(--agri-text)]">
                    {report.reason || t("adminReport.noReasonProvided")}
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
                <div className="pt-2.5 border-t border-[var(--agri-border-subtle)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    {t("adminReport.reportedTarget", { type: targetType })}
                  </p>
                  <p className="text-sm font-bold text-[var(--agri-text)] mt-0.5">
                    {report.targetTitle}
                  </p>
                </div>
              )}

              {report.createdAt && (
                <div className="pt-2.5 border-t border-[var(--agri-border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    {t("adminReport.dateTimeSubmitted")}
                  </span>
                  <span className="font-bold text-[var(--agri-text)]">
                    {formatFullDateTime(report.createdAt)}
                  </span>
                </div>
              )}

              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    {t("adminReport.lastUpdated")}
                  </span>
                  <span className="font-bold text-[var(--agri-text)]">
                    {formatFullDateTime(report.updatedAt)}
                  </span>
                </div>
              )}

              {report.resolvedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    {t("adminReport.resolvedAt")}
                  </span>
                  <span className="font-bold text-[var(--agri-text)]">
                    {formatFullDateTime(report.resolvedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Description / Explanation Card */}
            <div className="rounded-2xl bg-[var(--agri-card)] p-4 border border-[var(--agri-border-subtle)] shadow-xs space-y-1.5">
              <p className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wide">
                {t("adminReport.descriptionTitle")}
              </p>
              <div className="rounded-xl bg-[var(--agri-hover)]/80 border border-[var(--agri-border-subtle)] p-3.5 text-xs sm:text-sm leading-relaxed text-[var(--agri-text)] font-medium whitespace-pre-wrap">
                {report.description || t("adminReport.noDescriptionProvided")}
              </div>
            </div>

            {/* Evidence / Proof Screenshot */}
            {report.evidenceUrl && (
              <div className="rounded-2xl bg-[var(--agri-card)] p-4 border border-[var(--agri-border-subtle)] shadow-xs space-y-2">
                <p className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wide">
                  {t("adminReport.attachedEvidence")}
                </p>
                <div
                  onClick={() => setShowEvidenceViewer(true)}
                  className="relative group inline-block rounded-2xl overflow-hidden border border-[var(--agri-border)] bg-black/5 shadow-xs cursor-pointer"
                >
                  <img
                    src={report.evidenceUrl}
                    alt={t("adminReport.reportEvidenceAlt")}
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
                    {t("adminReport.viewFullscreen")}
                  </button>
                </div>
              </div>
            )}

            {/* Parties Summary & Enforcement Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reported User & Ban Action */}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      {t("adminReport.reportedUser")}
                    </p>
                    {reportedUser && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shadow-2xs ${
                        isUserSuspended ? "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30" : "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30"
                      }`}>
                        {reportedUser.status || "active"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[var(--agri-text)] mt-1.5">
                    {reportedUser?.fullname || report.reportedUserName || "User"}
                  </p>
                  {reportedUser?.username || report.reportedUserUsername ? (
                    <p className="text-xs text-[var(--agri-text-secondary)] font-medium">
                      @{reportedUser?.username || report.reportedUserUsername}
                    </p>
                  ) : null}
                  {reportedUser?.role && (
                    <span className="inline-block mt-1.5 rounded-md bg-[var(--agri-hover)] px-2 py-0.5 text-[10px] font-bold text-[var(--agri-text-secondary)] capitalize border border-[var(--agri-border)]">
                      {reportedUser.role}
                    </span>
                  )}
                </div>

                {onToggleUserSuspension && !suspendMode && (
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
                    {isUserSuspended ? t("adminReport.reactivateUser") : t("adminReport.suspendUser")}
                  </button>
                )}

                {onToggleUserSuspension && suspendMode && (
                  <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                      {t("adminUser.suspensionOptions")}
                    </p>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {t("adminUser.suspensionDuration")}
                      </label>
                      <select
                        value={suspensionDuration}
                        onChange={(e) => setSuspensionDuration(e.target.value)}
                        disabled={actionLoading}
                        className="w-full rounded-lg border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-[var(--agri-card)] px-3 py-2 text-sm font-semibold text-[var(--agri-text)] outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 cursor-pointer disabled:opacity-60"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {t("adminUser.suspensionReason")} *
                      </label>
                      <textarea
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        placeholder={t("adminUser.suspensionReasonPlaceholder")}
                        rows={2}
                        disabled={actionLoading}
                        className="w-full rounded-lg border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-[var(--agri-card)] px-3 py-2 text-sm text-[var(--agri-text)] outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 resize-none disabled:opacity-60"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSuspendMode(false);
                          setSuspensionDuration("7d");
                          setSuspensionReason("");
                        }}
                        disabled={actionLoading}
                        className="flex-1 py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-500/30 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition cursor-pointer disabled:opacity-60"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSuspend}
                        disabled={actionLoading || !suspensionReason.trim()}
                        className="flex-1 py-2 px-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer shadow-xs active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <i className="ri-loader-4-line animate-spin text-sm" />
                            {t("adminUser.saving")}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <i className="ri-user-unfollow-line" />
                            {t("adminReport.suspendUser")}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reporter Info & Chat Action */}
              <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                    {t("adminReport.submittedBy")}
                  </p>
                  <p className="text-sm font-bold text-[var(--agri-text)] mt-1.5">
                    {report.reporterName || t("adminReport.reporterFallback")}
                  </p>
                  {report.reporterUsername && (
                    <p className="text-xs text-[var(--agri-text-secondary)] font-medium">
                      @{report.reporterUsername}
                    </p>
                  )}
                  {report.reporterRole && (
                    <span className="inline-block mt-1.5 rounded-md bg-[var(--agri-hover)] px-2 py-0.5 text-[10px] font-bold text-[var(--agri-text-secondary)] capitalize border border-[var(--agri-border)]">
                      {report.reporterRole}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {report.reporterId && (
                    <button
                      type="button"
                      onClick={handleChatReporter}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] hover:bg-[#D8F3DC] dark:hover:bg-[var(--agri-brand-bg)] border border-[#2D6A4F]/20 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                      title={t("adminReport.openChat")}
                    >
                      <i className="ri-chat-1-line text-sm font-bold" />
                      {t("adminReport.chatReporter")}
                    </button>
                  )}

                  {targetType === "product" && onToggleProductAvailability && (
                    <button
                      type="button"
                      onClick={handleProductAvailability}
                      disabled={actionLoading}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                        isProductAvailable
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                          : "border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/20"
                      }`}
                    >
                      <i className={isProductAvailable ? "ri-eye-off-line" : "ri-eye-line"} />
                      {isProductAvailable ? t("adminReport.unpublishListing") : t("adminReport.republishListing")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Target Product Details (for product reports) */}
            {targetType === "product" && targetProduct && (
              <div className="rounded-2xl bg-[var(--agri-card)] p-4 border border-[var(--agri-border-subtle)] shadow-xs space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  {t("adminReport.productDetails")}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminReport.productName")}:</span>
                    <span className="ml-1 font-bold text-[var(--agri-text)]">{targetProduct.title || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminReport.category")}:</span>
                    <span className="ml-1 font-bold text-[var(--agri-text)]">{targetProduct.category || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminReport.sellingMode")}:</span>
                    <span className="ml-1 font-bold text-[var(--agri-text)] capitalize">{targetProduct.sellingMode || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminReport.availability")}:</span>
                    <span className={`ml-1 font-bold ${targetProduct.available ? "text-green-600" : "text-red-600"}`}>
                      {targetProduct.available ? t("adminReport.available") : t("adminReport.unavailable")}
                    </span>
                  </div>
                  {targetProduct.sellingMode === "preorder" && (
                    <>
                      <div>
                        <span className="text-[var(--agri-text-muted)]">{t("adminReport.preOrderLimit")}:</span>
                        <span className="ml-1 font-bold text-[var(--agri-text)]">{targetProduct.preOrderLimit ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-[var(--agri-text-muted)]">{t("adminReport.reserved")}:</span>
                        <span className="ml-1 font-bold text-[var(--agri-text)]">{targetProduct.reservedQuantity ?? 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Admin Resolution Notes */}
            <div className="rounded-2xl bg-[var(--agri-card)] p-4 border border-[var(--agri-border-subtle)] shadow-xs space-y-1.5">
              <label htmlFor="admin-resolution-notes" className="block text-xs font-bold text-[var(--agri-text)] uppercase tracking-wide">
                {t("adminReport.moderatorNoteLabel")}
              </label>
              <textarea
                id="admin-resolution-notes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t("adminReport.moderatorNotePlaceholder")}
                className="w-full rounded-xl border border-[var(--agri-border)] bg-[var(--agri-hover)]/50 p-3 text-xs sm:text-sm text-[var(--agri-text)] font-medium placeholder-[var(--agri-text-muted)] focus:bg-[var(--agri-card)] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 focus:outline-none transition resize-none"
              />
            </div>

            {/* Action Buttons for Admin */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--agri-border-subtle)]">
              <div className="flex flex-wrap items-center gap-2">
                {report.status === "pending" && onReview && (
                  <button
                    type="button"
                    onClick={() => onReview(report.id)}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/10 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
                  >
                    <i className="ri-search-eye-line mr-1.5" />
                    {t("adminReport.markReviewing")}
                  </button>
                )}

                {report.status !== "resolved" && onResolve && (
                  <button
                    type="button"
                    onClick={() => onResolve(report.id, adminNotes)}
                    className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] text-xs font-bold text-white hover:bg-[#1B4332] transition cursor-pointer"
                  >
                    <i className="ri-check-line mr-1.5" />
                    {t("adminReport.resolveCase")}
                  </button>
                )}

                {report.status !== "dismissed" && onDismiss && (
                  <button
                    type="button"
                    onClick={() => onDismiss(report.id, adminNotes)}
                    className="px-3.5 py-2 rounded-xl border border-[var(--agri-border)] text-xs font-bold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
                  >
                    <i className="ri-close-circle-line mr-1.5" />
                    {t("adminReport.dismiss")}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[var(--agri-hover)] text-xs sm:text-sm font-bold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer ml-auto"
              >
                {t("adminReport.close")}
              </button>
            </div>
          </div>
      </ResponsiveModal>

      {showEvidenceViewer && report.evidenceUrl && (
        <ImageViewerModal
          isOpen={showEvidenceViewer}
          onClose={() => setShowEvidenceViewer(false)}
          src={report.evidenceUrl}
          imageUrl={report.evidenceUrl}
          title={t("adminReport.evidencePhotoTitle")}
        />
      )}
    </>
  );
}
