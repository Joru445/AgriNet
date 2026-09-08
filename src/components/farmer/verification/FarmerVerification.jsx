import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import { getMyVerification, submitVerification } from "../../../services/farmer.service";
import { showToast } from "../../../utils/toast";

const STATUS_CONFIG = {
  not_applied: {
    color: "text-[var(--agri-text-muted)]",
    bgColor: "bg-[var(--agri-hover)]",
    borderColor: "border-[var(--agri-border-subtle)]",
    icon: "ri-shield-line",
    labelKey: "farmerVerification.notApplied",
  },
  pending: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-500/30",
    icon: "ri-time-line",
    labelKey: "farmerVerification.pending",
  },
  approved: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-500/30",
    icon: "ri-shield-check-line",
    labelKey: "farmerVerification.approved",
  },
  rejected: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/30",
    icon: "ri-shield-cross-line",
    labelKey: "farmerVerification.rejected",
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

export default function FarmerVerification() {
  const { t } = useLanguage();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyVerification();
      setVerification(data);
    } catch (err) {
      console.error("Failed to load verification:", err);
      setError(err?.message || "Failed to load verification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerification();
  }, [loadVerification]);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      await submitVerification();
      showToast.success(t("farmerVerification.submittedSuccess"));
      await loadVerification();
    } catch (err) {
      console.error("Failed to submit verification:", err);
      showToast.error(err?.message || "Failed to submit verification.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="mb-6">
        <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
          {t("farmerVerification.title")}
        </h2>
        <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 rounded bg-[var(--agri-hover)]" />
            <div className="h-3 w-48 rounded bg-[var(--agri-hover)]" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-6">
        <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
          {t("farmerVerification.title")}
        </h2>
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={loadVerification}
            className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300 underline"
          >
            {t("common.retry")}
          </button>
        </div>
      </section>
    );
  }

  const status = verification?.verificationStatus || "not_applied";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_applied;
  const canSubmit = status === "not_applied" || status === "rejected";

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
        {t("farmerVerification.title")}
      </h2>

      <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} overflow-hidden shadow-sm`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}>
              <i className={`${config.icon} text-lg`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${config.color}`}>
                  {t(config.labelKey)}
                </p>
                {(verification?.verificationStatus === "approved" || verification?.verified) && (
                  <i className="ri-verified-badge-fill text-[#2D6A4F] dark:text-[var(--agri-brand)] text-sm" />
                )}
              </div>

              {status === "not_applied" && (
                <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
                  {t("farmerVerification.notAppliedDesc")}
                </p>
              )}

              {status === "pending" && verification?.verificationSubmittedAt && (
                <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
                  {t("farmerVerification.submittedOn", { date: formatDate(verification.verificationSubmittedAt) })}
                </p>
              )}

              {status === "approved" && verification?.verificationReviewedAt && (
                <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
                  {t("farmerVerification.approvedOn", { date: formatDate(verification.verificationReviewedAt) })}
                </p>
              )}

              {status === "rejected" && (
                <div className="mt-2">
                  {verification?.verificationRejectionReason && (
                    <div className="rounded-lg bg-red-100 dark:bg-red-500/20 p-2 mb-2">
                      <p className="text-[11px] font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider mb-1">
                        {t("farmerVerification.rejectionReason")}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {verification.verificationRejectionReason}
                      </p>
                    </div>
                  )}
                  {verification?.verificationReviewedAt && (
                    <p className="text-xs text-[var(--agri-text-muted)]">
                      {t("farmerVerification.rejectedOn", { date: formatDate(verification.verificationReviewedAt) })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {canSubmit && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-[#2D6A4F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1B4332] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin" />
                    {t("farmerVerification.submitting")}
                  </span>
                ) : (
                  t("farmerVerification.submitApplication")
                )}
              </button>
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-bold text-[var(--agri-text)] transition hover:bg-[var(--agri-hover)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin" />
                    {t("farmerVerification.submitting")}
                  </span>
                ) : (
                  t("farmerVerification.resubmitApplication")
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
