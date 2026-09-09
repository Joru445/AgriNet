import { Link } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";

import DashboardSection from "../../common/DashboardSection";
import SkeletonBox from "../../common/SkeletonBox";

const PIPELINE_STATUSES = ["pending", "accepted", "reserved", "ongoing", "completed"];

const STATUS_CONFIG = {
  pending: { dot: "bg-amber-400", border: "border-amber-200/60 dark:border-amber-500/20", bg: "bg-amber-50/40 dark:bg-amber-500/5" },
  accepted: { dot: "bg-blue-400", border: "border-blue-200/60 dark:border-blue-500/20", bg: "bg-blue-50/40 dark:bg-blue-500/5" },
  reserved: { dot: "bg-violet-400", border: "border-violet-200/60 dark:border-violet-500/20", bg: "bg-violet-50/40 dark:bg-violet-500/5" },
  ongoing: { dot: "bg-[#2D6A4F] dark:bg-[var(--agri-brand)]", border: "border-emerald-200/60 dark:border-emerald-500/20", bg: "bg-emerald-50/40 dark:bg-emerald-500/5" },
  completed: { dot: "bg-emerald-500", border: "border-emerald-200/60 dark:border-emerald-500/20", bg: "bg-emerald-50/40 dark:bg-emerald-500/5" },
  cancelled: { dot: "bg-red-400", border: "border-red-200/60 dark:border-red-500/20", bg: "bg-red-50/40 dark:bg-red-500/5" },
};

function PipelineFlow({ counts }) {
  const { t } = useLanguage();
  return (
    <div className="p-3.5 sm:p-4">
      {/* Pipeline cards in a responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {PIPELINE_STATUSES.map((status) => {
          const count = counts[status] ?? 0;
          const config = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border ${config.border} ${config.bg} text-center transition-all hover:scale-[1.02] shadow-2xs`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${config.dot} shrink-0`} />
                <span className="text-[11px] font-bold text-[var(--agri-text-muted)] truncate">
                  {t(`transactions.status.${status}`)}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[var(--agri-text)]">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cancelled summary pill */}
      {counts.cancelled > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200/80 dark:border-red-500/20 bg-red-50/70 dark:bg-red-500/10 px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-300">
              {t("transactions.status.cancelled")}
            </span>
          </div>
          <span className="text-sm font-black text-red-800 dark:text-red-200">
            {counts.cancelled}
          </span>
        </div>
      )}
    </div>
  );
}

function PreOrderSummary({ stats }) {
  const { t } = useLanguage();
  const preorderCount = stats.preorderCount ?? 0;
  const reservedCount = stats.reservedInquiries ?? 0;
  const pendingPreorder = stats.pendingInquiries ?? 0;

  if (preorderCount === 0 && reservedCount === 0 && pendingPreorder === 0) return null;

  return (
    <div className="border-t border-[var(--agri-border-subtle)] p-3.5 sm:p-4">
      <p className="text-[11px] font-bold text-[var(--agri-text-muted)] mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
        <i className="ri-timer-line text-sm text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
        <span>{t("farmer.preorderVisibility")}</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Link
          to="/farmer/products"
          className="flex items-center justify-between gap-2 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-3 py-2.5 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)] shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
            <span className="truncate font-medium text-[var(--agri-text-muted)]">
              {t("farmer.preorderProducts")}
            </span>
          </div>
          <span className="font-black text-sm text-[var(--agri-text)]">{preorderCount}</span>
        </Link>
        <Link
          to="/farmer/transactions"
          className="flex items-center justify-between gap-2 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-3 py-2.5 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)] shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet-400" />
            <span className="truncate font-medium text-[var(--agri-text-muted)]">
              {t("farmer.reservedInquiries")}
            </span>
          </div>
          <span className="font-black text-sm text-[var(--agri-text)]">{reservedCount}</span>
        </Link>
        <Link
          to="/farmer/transactions"
          className="flex items-center justify-between gap-2 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-3 py-2.5 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)] shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400" />
            <span className="truncate font-medium text-[var(--agri-text-muted)]">
              {t("farmer.pendingPreorders")}
            </span>
          </div>
          <span className="font-black text-sm text-[var(--agri-text)]">{pendingPreorder}</span>
        </Link>
      </div>
    </div>
  );
}

export default function InquiryPipeline({ stats = {}, loading = false }) {
  const { t } = useLanguage();

  const counts = {
    pending: stats.pendingInquiries ?? 0,
    accepted: stats.acceptedInquiries ?? 0,
    reserved: stats.reservedInquiries ?? 0,
    ongoing: stats.ongoingInquiries ?? 0,
    completed: stats.completedInquiries ?? 0,
    cancelled: stats.cancelledInquiries ?? 0,
  };

  const total = stats.totalInquiries ?? 0;

  return (
    <DashboardSection
      title={t("farmer.transactionOverview")}
      subtitle={t("farmer.transactionOverviewSubtitle")}
      icon="ri-file-list-3-line"
      compact
      fill
      headerAction={
        <Link
          to="/farmer/transactions"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2D6A4F]/20 bg-[#2D6A4F]/10 px-2.5 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:bg-[#2D6A4F] hover:text-white transition-all shadow-2xs"
        >
          <span>{t("farmer.totalTransactions")}: {total}</span>
          <i className="ri-arrow-right-s-line text-sm" />
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-7" />)}
        </div>
      ) : (
        <>
          {/* Pipeline flow visualization */}
          <PipelineFlow counts={counts} />

          {/* Pre-order visibility */}
          <PreOrderSummary stats={stats} />
        </>
      )}
    </DashboardSection>
  );
}
