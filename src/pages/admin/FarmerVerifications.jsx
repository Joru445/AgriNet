import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../components/ui/DashboardSection";
import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import ResponsiveModal from "../../components/ui/ResponsiveModal";
import Button from "../../components/ui/Button";

import { useLanguage } from "../../context/LanguageContext";
import {
  apiListFarmerVerifications,
  apiApproveFarmerVerification,
  apiRejectFarmerVerification,
} from "../../services/farmer.service";
import { showToast } from "../../utils/toast";

const STATUS_TABS = ["pending", "approved", "rejected"];

const STATUS_COLORS = {
  not_applied: {
    color: "text-(--agri-text-muted)",
    bg: "bg-(--agri-hover)",
    border: "border-(--agri-border-subtle)",
  },
  pending: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  approved: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  rejected: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  },
};

function formatDate(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VerificationRow({ verification, onView }) {
  const { t } = useLanguage();
  const status = verification.verificationStatus || "not_applied";
  const colors = STATUS_COLORS[status] || STATUS_COLORS.not_applied;

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 border-b border-(--agri-border-subtle) px-4 sm:px-5 py-3.5 sm:py-4 transition hover:bg-(--agri-hover)/60 last:border-b-0 cursor-pointer group"
      onClick={() => onView(verification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView(verification)}
    >
      {verification.profilePicture ? (
        <img
          src={verification.profilePicture}
          alt={verification.fullname}
          className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl object-cover shadow-2xs border border-(--agri-border-subtle)"
        />
      ) : (
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-sm sm:text-base font-bold text-[#2D6A4F] dark:text-(--agri-brand) shadow-2xs border border-[#2D6A4F]/20">
          {(verification.fullname || "?")[0].toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm sm:text-base font-bold text-(--agri-text) group-hover:text-[#2D6A4F] dark:group-hover:text-(--agri-brand) transition-colors">
            {verification.fullname || t("adminUser.unnamedUser")}
          </p>
          {verification.verified && (
            <i className="ri-verified-badge-fill text-[#2D6A4F] dark:text-(--agri-brand) text-sm sm:text-base shrink-0" />
          )}
        </div>
        <p className="text-xs sm:text-sm text-(--agri-text-muted) truncate mt-0.5">
          {verification.email || verification.username || ""}
        </p>
        {verification.storeName && (
          <p className="text-[11px] sm:text-xs text-(--agri-text-secondary) font-medium truncate mt-0.5">
            <i className="ri-store-2-line mr-1 text-(--agri-text-muted)" />
            {verification.storeName}
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 sm:gap-3 text-right">
        <div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${colors.bg} ${colors.color} ${colors.border} border shadow-2xs`}>
            {t(`farmerVerification.${status}`)}
          </span>
          {verification.verificationSubmittedAt && (
            <p className="mt-1 text-[11px] text-(--agri-text-muted)">
              {formatDate(verification.verificationSubmittedAt)}
            </p>
          )}
        </div>
        <i className="ri-arrow-right-s-line text-lg sm:text-xl text-(--agri-text-muted) transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-(--agri-text)" />
      </div>
    </div>
  );
}

function VerificationDetailModal({ verification, onClose, onApprove, onReject, loading }) {
  const { t } = useLanguage();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!verification) return null;

  const status = verification.verificationStatus || "not_applied";
  const colors = STATUS_COLORS[status] || STATUS_COLORS.not_applied;

  async function handleApprove() {
    await onApprove(verification.uid);
    onClose();
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      showToast.error(t("farmerVerification.rejectionReasonRequired"));
      return;
    }
    await onReject(verification.uid, rejectReason.trim());
    onClose();
  }

  return (
    <ResponsiveModal
      open={Boolean(verification)}
      onClose={onClose}
      title={t("farmerVerification.detailTitle")}
      maxWidth="max-w-md"
    >
        {/* Farmer Info */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-(--agri-hover)/90 border border-(--agri-border-subtle)">
            {verification.profilePicture ? (
              <img
                src={verification.profilePicture}
                alt={verification.fullname}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-base font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
                {(verification.fullname || "?")[0].toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-(--agri-text) truncate">
                  {verification.fullname || t("adminUser.unnamedUser")}
                </p>
                {verification.verified && (
                  <i className="ri-verified-badge-fill text-[#2D6A4F] dark:text-(--agri-brand) text-sm" />
                )}
              </div>
              <p className="text-xs text-(--agri-text-muted) truncate">
                {verification.email || ""}
              </p>
              {verification.storeName && (
                <p className="text-xs text-(--agri-text-muted)">
                  {verification.storeName}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("farmerVerification.status")}
            </label>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${colors.bg} ${colors.color} ${colors.border} border`}>
              {t(`farmerVerification.${status}`)}
            </span>
          </div>

          {/* Timestamps */}
          {verification.verificationSubmittedAt && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("farmerVerification.submittedAt")}
              </label>
              <p className="text-sm text-(--agri-text)">
                {formatDate(verification.verificationSubmittedAt)}
              </p>
            </div>
          )}

          {verification.verificationReviewedAt && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("farmerVerification.reviewedAt")}
              </label>
              <p className="text-sm text-(--agri-text)">
                {formatDate(verification.verificationReviewedAt)}
              </p>
            </div>
          )}

          {verification.verificationRejectionReason && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("farmerVerification.rejectionReason")}
              </label>
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-2">
                <p className="text-xs text-red-600 dark:text-red-400">
                  {verification.verificationRejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {status === "pending" && (
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-(--agri-border-subtle)">
              {!showRejectForm ? (
                <>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading}
                  >
                    {t("farmerVerification.reject")}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApprove}
                    disabled={loading}
                    loading={loading}
                    icon={loading ? undefined : "ri-check-line"}
                  >
                    {t("farmerVerification.approve")}
                  </Button>
                </>
              ) : (
                <div className="w-full space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t("farmerVerification.rejectionReasonPlaceholder")}
                    rows={3}
                    className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/10 resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="cancel"
                      size="sm"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason("");
                      }}
                      disabled={loading}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleReject}
                      disabled={loading || !rejectReason.trim()}
                      loading={loading}
                    >
                      {t("farmerVerification.confirmReject")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </ResponsiveModal>
  );
}

export default function FarmerVerifications() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("pending");
  const [verifications, setVerifications] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

  const loadVerifications = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiListFarmerVerifications({ status, limit: 50 });
      setVerifications(data.verifications || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error("Failed to load verifications:", err);
      setError(err?.message || "Failed to load verifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerifications(tab);
  }, [tab, loadVerifications]);

  async function handleApprove(farmerId) {
    try {
      setActionLoading(true);
      await apiApproveFarmerVerification(farmerId);
      showToast.success(t("farmerVerification.approvedSuccess"));
      await loadVerifications(tab);
    } catch (err) {
      console.error("Failed to approve:", err);
      showToast.error(err?.message || "Failed to approve verification.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(farmerId, reason) {
    try {
      setActionLoading(true);
      await apiRejectFarmerVerification(farmerId, reason);
      showToast.success(t("farmerVerification.rejectedSuccess"));
      await loadVerifications(tab);
    } catch (err) {
      console.error("Failed to reject:", err);
      showToast.error(err?.message || "Failed to reject verification.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-(--agri-page)">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-(--agri-text) tracking-tight">
            {t("farmerVerification.adminTitle")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-(--agri-text-muted) font-medium">
            {t("farmerVerification.adminSubtitle")}
          </p>
        </div>

        {/* Tabs — big, readable, and distinct */}
        <div className="mb-5 flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-(--agri-hover)/80 border border-(--agri-border-subtle) p-1.5 sm:p-2 shadow-xs">
          {STATUS_TABS.map((statusTab) => {
            const active = tab === statusTab;
            const count = counts[statusTab] ?? 0;
            return (
              <button
                key={statusTab}
                type="button"
                onClick={() => setTab(statusTab)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                  active
                    ? "bg-(--agri-card) text-[#2D6A4F] dark:text-(--agri-brand) shadow-sm border border-(--agri-border-subtle)/50"
                    : "text-(--agri-text-muted) hover:text-(--agri-text) hover:bg-(--agri-hover)"
                }`}
              >
                <span>{t(`farmerVerification.${statusTab}`)}</span>
                <span
                  className={`inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-black transition-colors ${
                    active
                      ? "bg-[#2D6A4F]/10 dark:bg-(--agri-brand)/15 text-[#2D6A4F] dark:text-(--agri-brand)"
                      : "bg-black/5 dark:bg-white/5 text-(--agri-text-muted)"
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <ErrorState
            className="mb-4"
            title={t("admin.failedToLoad")}
            message={error}
            onRetry={() => loadVerifications(tab)}
          />
        )}

        {/* Verification List */}
        <DashboardSection
          title={t(`farmerVerification.${tab}List`)}
          subtitle={`${counts[tab] ?? 0} ${t(`farmerVerification.${tab}`).toLowerCase()} verifications`}
          icon={tab === "pending" ? "ri-time-line" : tab === "approved" ? "ri-shield-check-line" : "ri-shield-cross-line"}
          compact
          fill
          className="shadow-sm"
        >
          {loading ? (
            <div className="space-y-2.5 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-(--agri-border-subtle) bg-(--agri-card) shadow-2xs">
                  <SkeletonBox className="h-11 w-11 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-36" />
                    <SkeletonBox className="h-3 w-48" />
                  </div>
                  <SkeletonBox className="h-6 w-20 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--agri-hover) mb-3 text-(--agri-text-muted) shadow-2xs">
                <i className={`text-2xl ${
                  tab === "pending" ? "ri-time-line" : tab === "approved" ? "ri-shield-check-line" : "ri-shield-cross-line"
                }`} />
              </div>
              <p className="text-sm sm:text-base font-bold text-(--agri-text)">
                {t(`farmerVerification.no${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
              </p>
            </div>
          ) : (
            <div>
              {verifications.map((v) => (
                <VerificationRow
                  key={v.uid}
                  verification={v}
                  onView={setSelectedVerification}
                />
              ))}
            </div>
          )}
        </DashboardSection>
      </div>

      <VerificationDetailModal
        verification={selectedVerification}
        onClose={() => setSelectedVerification(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}
