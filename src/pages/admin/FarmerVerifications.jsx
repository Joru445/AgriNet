import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../components/common/DashboardSection";
import SkeletonBox from "../../components/common/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";

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
    color: "text-[var(--agri-text-muted)]",
    bg: "bg-[var(--agri-hover)]",
    border: "border-[var(--agri-border-subtle)]",
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

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
        active
          ? "bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)] shadow-2xs"
          : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1 text-[10px] opacity-70">({count})</span>
      )}
    </button>
  );
}

function VerificationRow({ verification, onView }) {
  const { t } = useLanguage();
  const status = verification.verificationStatus || "not_applied";
  const colors = STATUS_COLORS[status] || STATUS_COLORS.not_applied;

  return (
    <div
      className="flex items-center gap-3 border-b border-[var(--agri-border-subtle)] px-4 py-3 transition hover:bg-[var(--agri-hover)]/60 last:border-b-0 cursor-pointer"
      onClick={() => onView(verification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView(verification)}
    >
      {verification.profilePicture ? (
        <img
          src={verification.profilePicture}
          alt={verification.fullname}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          {(verification.fullname || "?")[0].toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
            {verification.fullname || t("adminUser.unnamedUser")}
          </p>
          {verification.verified && (
            <i className="ri-verified-badge-fill text-[#2D6A4F] dark:text-[var(--agri-brand)] text-sm shrink-0" />
          )}
        </div>
        <p className="text-xs text-[var(--agri-text-muted)] truncate">
          {verification.email || verification.username || ""}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.color} ${colors.border} border`}>
          {t(`farmerVerification.${status}`)}
        </span>
        {verification.verificationSubmittedAt && (
          <p className="mt-0.5 text-[10px] text-[var(--agri-text-muted)]">
            {formatDate(verification.verificationSubmittedAt)}
          </p>
        )}
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
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[var(--agri-card)] p-5 sm:p-6 shadow-2xl border border-[var(--agri-border)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--agri-border)]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--agri-text)] tracking-tight">
              {t("farmerVerification.detailTitle")}
            </h3>
            <p className="text-xs font-medium text-[var(--agri-text-muted)]">
              {t("farmerVerification.detailSubtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--agri-text-muted)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text-secondary)] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Farmer Info */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
            {verification.profilePicture ? (
              <img
                src={verification.profilePicture}
                alt={verification.fullname}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-base font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                {(verification.fullname || "?")[0].toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-[var(--agri-text)] truncate">
                  {verification.fullname || t("adminUser.unnamedUser")}
                </p>
                {verification.verified && (
                  <i className="ri-verified-badge-fill text-[#2D6A4F] dark:text-[var(--agri-brand)] text-sm" />
                )}
              </div>
              <p className="text-xs text-[var(--agri-text-muted)] truncate">
                {verification.email || ""}
              </p>
              {verification.storeName && (
                <p className="text-xs text-[var(--agri-text-muted)]">
                  {verification.storeName}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
              {t("farmerVerification.status")}
            </label>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${colors.bg} ${colors.color} ${colors.border} border`}>
              {t(`farmerVerification.${status}`)}
            </span>
          </div>

          {/* Timestamps */}
          {verification.verificationSubmittedAt && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("farmerVerification.submittedAt")}
              </label>
              <p className="text-sm text-[var(--agri-text)]">
                {formatDate(verification.verificationSubmittedAt)}
              </p>
            </div>
          )}

          {verification.verificationReviewedAt && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("farmerVerification.reviewedAt")}
              </label>
              <p className="text-sm text-[var(--agri-text)]">
                {formatDate(verification.verificationReviewedAt)}
              </p>
            </div>
          )}

          {verification.verificationRejectionReason && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
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
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--agri-border-subtle)]">
              {!showRejectForm ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading}
                    className="py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {t("farmerVerification.reject")}
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold hover:bg-[#1B4332] active:scale-[0.99] transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <i className="ri-loader-4-line animate-spin text-sm" />
                    ) : (
                      <i className="ri-check-line text-sm" />
                    )}
                    {t("farmerVerification.approve")}
                  </button>
                </>
              ) : (
                <div className="w-full space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t("farmerVerification.rejectionReasonPlaceholder")}
                    rows={3}
                    className="w-full rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3.5 py-2.5 text-sm text-[var(--agri-text)] outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/10 resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason("");
                      }}
                      disabled={loading}
                      className="py-2 px-3 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] text-xs font-bold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={loading || !rejectReason.trim()}
                      className="py-2 px-4 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <i className="ri-loader-4-line animate-spin" />
                      ) : (
                        t("farmerVerification.confirmReject")
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--agri-text)]">
            {t("farmerVerification.adminTitle")}
          </h1>
          <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
            {t("farmerVerification.adminSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 rounded-lg bg-[var(--agri-hover)] p-0.5">
          {STATUS_TABS.map((statusTab) => (
            <TabButton
              key={statusTab}
              active={tab === statusTab}
              onClick={() => setTab(statusTab)}
              label={t(`farmerVerification.${statusTab}`)}
              count={counts[statusTab]}
            />
          ))}
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
          icon={tab === "pending" ? "ri-time-line" : tab === "approved" ? "ri-shield-check-line" : "ri-shield-cross-line"}
          compact
          fill
        >
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-16" />
              ))}
            </div>
          ) : verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <i className={`text-3xl text-[var(--agri-text-muted)] ${
                tab === "pending" ? "ri-time-line" : tab === "approved" ? "ri-shield-check-line" : "ri-shield-cross-line"
              }`} />
              <p className="mt-2 text-sm font-medium text-[var(--agri-text-muted)]">
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
