import { useEffect, useState } from "react";
import ImageViewerModal from "../../ui/ImageViewerModal";
import { formatFullDateTime } from "../../../utils/date";
import useStartConversation from "../../../hooks/useStartConversation";
import { useLanguage } from "../../../context/LanguageContext";
import ResponsiveModal from "../../ui/ResponsiveModal";
import { DURATION_OPTIONS } from "../../../utils/suspensionOptions";
import Button from "../../ui/Button";

function getStatusClasses(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20";
    case "reviewing":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20";
    case "resolved":
      return "bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20";
    case "dismissed":
      return "bg-(--agri-hover) text-(--agri-text-secondary) border border-(--agri-border)";
    default:
      return "bg-(--agri-hover) text-(--agri-text-secondary) border border-(--agri-border)";
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
          <div className="p-4 sm:p-6 space-y-4">
            {/* Reason & Status Card */}
            <div className="rounded-2xl bg-(--agri-card) p-4 sm:p-5 border border-(--agri-border) shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs">
                      <i className="ri-shield-alert-line" />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                      {t("adminReport.reportReason")}
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-(--agri-text) leading-snug">
                    {report.reason || t("adminReport.noReasonProvided")}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize shadow-xs ${getStatusClasses(
                      report.status,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {report.status || "pending"}
                  </span>
                </div>
              </div>

              {report.targetTitle && (
                <div className="rounded-xl bg-(--agri-hover)/60 border border-(--agri-border-subtle) p-3 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                    {t("adminReport.reportedTarget", { type: targetType })}
                  </p>
                  <p className="text-sm font-bold text-(--agri-text) mt-0.5">
                    {report.targetTitle}
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2.5 border-t border-(--agri-border-subtle)">
                {report.createdAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                      <i className="ri-calendar-line text-(--agri-text-muted)" />
                      {t("adminReport.dateTimeSubmitted")}
                    </span>
                    <span className="font-semibold text-(--agri-text)">
                      {formatFullDateTime(report.createdAt)}
                    </span>
                  </div>
                )}

                {report.updatedAt && report.updatedAt !== report.createdAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                      <i className="ri-time-line text-(--agri-text-muted)" />
                      {t("adminReport.lastUpdated")}
                    </span>
                    <span className="font-semibold text-(--agri-text)">
                      {formatFullDateTime(report.updatedAt)}
                    </span>
                  </div>
                )}

                {report.resolvedAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                      <i className="ri-checkbox-circle-line" />
                      {t("adminReport.resolvedAt")}
                    </span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(report.resolvedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description / Explanation Card */}
            <div className="rounded-2xl bg-(--agri-card) p-4 sm:p-5 border border-(--agri-border) shadow-xs hover:shadow-sm transition-shadow space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs">
                  <i className="ri-file-text-line" />
                </span>
                <p className="text-xs font-bold text-(--agri-text) uppercase tracking-wide">
                  {t("adminReport.descriptionTitle")}
                </p>
              </div>
              <div className="rounded-xl bg-(--agri-hover)/70 border border-(--agri-border-subtle) p-3.5 text-xs sm:text-sm leading-relaxed text-(--agri-text) font-medium whitespace-pre-wrap shadow-2xs">
                {report.description || t("adminReport.noDescriptionProvided")}
              </div>
            </div>

            {/* Evidence / Proof Screenshot */}
            {report.evidenceUrl && (
              <div className="rounded-2xl bg-(--agri-card) p-4 sm:p-5 border border-(--agri-border) shadow-xs hover:shadow-sm transition-shadow space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs">
                    <i className="ri-image-line" />
                  </span>
                  <p className="text-xs font-bold text-(--agri-text) uppercase tracking-wide">
                    {t("adminReport.attachedEvidence")}
                  </p>
                </div>
                <div
                  onClick={() => setShowEvidenceViewer(true)}
                  className="relative group inline-block rounded-2xl overflow-hidden border border-(--agri-border) bg-black/5 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={report.evidenceUrl}
                    alt={t("adminReport.reportEvidenceAlt")}
                    className="h-36 sm:h-44 w-auto max-w-[280px] object-cover transition duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEvidenceViewer(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 group-hover:opacity-100 transition duration-200 font-bold text-xs gap-1.5 cursor-pointer backdrop-blur-[1px]"
                  >
                    <i className="ri-zoom-in-line text-base" />
                    {t("adminReport.viewFullscreen")}
                  </button>
                </div>
              </div>
            )}

            {/* Parties Summary & Enforcement Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Reported User & Ban Action */}
              <div className="rounded-2xl border border-red-500/25 bg-red-500/5 dark:bg-red-500/10 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500/15 text-red-600 dark:text-red-400 text-xs">
                        <i className="ri-user-forbid-line" />
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                        {t("adminReport.reportedUser")}
                      </p>
                    </div>
                    {reportedUser && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shadow-2xs ${
                        isUserSuspended ? "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30" : "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30"
                      }`}>
                        {reportedUser.status || "active"}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-bold text-(--agri-text) mt-2">
                    {reportedUser?.fullname || report.reportedUserName || "User"}
                  </p>
                  {reportedUser?.username || report.reportedUserUsername ? (
                    <p className="text-xs text-(--agri-text-secondary) font-medium">
                      @{reportedUser?.username || report.reportedUserUsername}
                    </p>
                  ) : null}
                  {reportedUser?.role && (
                    <span className="inline-block mt-2 rounded-md bg-(--agri-card) px-2 py-0.5 text-[10px] font-bold text-(--agri-text-secondary) capitalize border border-(--agri-border) shadow-2xs">
                      {reportedUser.role}
                    </span>
                  )}
                </div>

                {onToggleUserSuspension && !suspendMode && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon="ri-forbid-line"
                    onClick={handleUserSuspension}
                    disabled={actionLoading}
                    className="w-full shadow-xs"
                  >
                    {isUserSuspended ? t("adminReport.reactivateUser") : t("adminReport.suspendUser")}
                  </Button>
                )}

                {onToggleUserSuspension && suspendMode && (
                  <div className="space-y-3 rounded-xl border border-amber-300/80 dark:border-amber-500/30 bg-white/90 dark:bg-amber-500/10 p-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-error-warning-line text-amber-600 dark:text-amber-400" />
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        {t("adminUser.suspensionOptions")}
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        {t("adminUser.suspensionDuration")}
                      </label>
                      <select
                        value={suspensionDuration}
                        onChange={(e) => setSuspensionDuration(e.target.value)}
                        disabled={actionLoading}
                        className="w-full rounded-lg border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-(--agri-card) px-3 py-2 text-sm font-semibold text-(--agri-text) outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-2xs cursor-pointer disabled:opacity-60"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        {t("adminUser.suspensionReason")} *
                      </label>
                      <textarea
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        placeholder={t("adminUser.suspensionReasonPlaceholder")}
                        rows={2}
                        disabled={actionLoading}
                        className="w-full rounded-lg border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-(--agri-card) px-3 py-2 text-sm text-(--agri-text) outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-2xs resize-none disabled:opacity-60"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="cancel"
                        size="sm"
                        onClick={() => {
                          setSuspendMode(false);
                          setSuspensionDuration("7d");
                          setSuspensionReason("");
                        }}
                        disabled={actionLoading}
                        className="flex-1 shadow-2xs"
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={actionLoading}
                        onClick={handleConfirmSuspend}
                        disabled={!suspensionReason.trim()}
                        className="flex-1 shadow-xs"
                      >
                        {!actionLoading && (
                          <i className="ri-user-unfollow-line" />
                        )}
                        {t("adminReport.suspendUser")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reporter Info & Chat Action */}
              <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-(--agri-primary)/15 text-(--agri-primary) text-xs">
                      <i className="ri-user-voice-line" />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                      {t("adminReport.submittedBy")}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-(--agri-text) mt-2">
                    {report.reporterName || t("adminReport.reporterFallback")}
                  </p>
                  {report.reporterUsername && (
                    <p className="text-xs text-(--agri-text-secondary) font-medium">
                      @{report.reporterUsername}
                    </p>
                  )}
                  {report.reporterRole && (
                    <span className="inline-block mt-2 rounded-md bg-(--agri-hover) px-2 py-0.5 text-[10px] font-bold text-(--agri-text-secondary) capitalize border border-(--agri-border) shadow-2xs">
                      {report.reporterRole}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {report.reporterId && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="ri-chat-1-line"
                      onClick={handleChatReporter}
                      className="w-full shadow-xs"
                      title={t("adminReport.openChat")}
                    >
                      {t("adminReport.chatReporter")}
                    </Button>
                  )}

                  {targetType === "product" && onToggleProductAvailability && (
                    <Button
                      variant={isProductAvailable ? "danger" : "primary"}
                      size="sm"
                      onClick={handleProductAvailability}
                      disabled={actionLoading}
                      className="w-full shadow-xs"
                    >
                      <i className={isProductAvailable ? "ri-eye-off-line" : "ri-eye-line"} />
                      {isProductAvailable ? t("adminReport.unpublishListing") : t("adminReport.republishListing")}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Target Product Details (for product reports) */}
            {targetType === "product" && targetProduct && (
              <div className="rounded-2xl bg-(--agri-card) p-4 sm:p-5 border border-(--agri-border) shadow-xs hover:shadow-sm transition-shadow space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                    <i className="ri-store-2-line" />
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                    {t("adminReport.productDetails")}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminReport.productName")}</span>
                    <span className="font-bold text-(--agri-text) text-sm">{targetProduct.title || "—"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminReport.category")}</span>
                    <span className="font-bold text-(--agri-text) text-sm">{targetProduct.category || "—"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminReport.sellingMode")}</span>
                    <span className="font-bold text-(--agri-text) capitalize text-sm">{targetProduct.sellingMode || "—"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminReport.availability")}</span>
                    <span className={`font-bold text-sm ${targetProduct.available ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {targetProduct.available ? t("adminReport.available") : t("adminReport.unavailable")}
                    </span>
                  </div>
                  {targetProduct.sellingMode === "preorder" && (
                    <>
                      <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                        <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminReport.preOrderLimit")}</span>
                        <span className="font-bold text-(--agri-text) text-sm">{targetProduct.preOrderLimit ?? "—"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                        <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminReport.reserved")}</span>
                        <span className="font-bold text-(--agri-text) text-sm">{targetProduct.reservedQuantity ?? 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Admin Resolution Notes */}
            <div className="rounded-2xl bg-(--agri-card) p-4 sm:p-5 border border-(--agri-border) shadow-xs hover:shadow-sm transition-shadow space-y-2">
              <label htmlFor="admin-resolution-notes" className="flex items-center gap-1.5 text-xs font-bold text-(--agri-text) uppercase tracking-wide cursor-pointer">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] text-xs">
                  <i className="ri-edit-2-line" />
                </span>
                {t("adminReport.moderatorNoteLabel")}
              </label>
              <textarea
                id="admin-resolution-notes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t("adminReport.moderatorNotePlaceholder")}
                className="w-full rounded-xl border border-(--agri-border) bg-(--agri-hover)/50 p-3.5 text-xs sm:text-sm text-(--agri-text) font-medium placeholder-(--agri-text-muted) focus:bg-(--agri-card) focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 focus:outline-none transition resize-none shadow-2xs"
              />
            </div>

            {/* Action Buttons for Admin */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-(--agri-border-subtle)">
              <div className="flex flex-wrap items-center gap-2">
                {report.status === "pending" && onReview && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="ri-search-eye-line"
                    onClick={() => onReview(report.id)}
                    className="shadow-xs"
                  >
                    {t("adminReport.markReviewing")}
                  </Button>
                )}

                {report.status !== "resolved" && onResolve && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon="ri-check-line"
                    onClick={() => onResolve(report.id, adminNotes)}
                    className="shadow-xs"
                  >
                    {t("adminReport.resolveCase")}
                  </Button>
                )}

                {report.status !== "dismissed" && onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="ri-close-circle-line"
                    onClick={() => onDismiss(report.id, adminNotes)}
                    className="shadow-2xs"
                  >
                    {t("adminReport.dismiss")}
                  </Button>
                )}
              </div>

              <Button
                variant="cancel"
                size="md"
                onClick={onClose}
                className="ml-auto shadow-2xs"
              >
                {t("adminReport.close")}
              </Button>
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
