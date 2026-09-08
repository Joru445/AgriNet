import { Link } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";

import DashboardSection from "../../common/DashboardSection";
import SkeletonBox from "../../common/SkeletonBox";

const PIPELINE_STATUSES = ["pending", "accepted", "reserved", "ongoing", "completed"];

const STATUS_COLORS = {
  pending: "bg-amber-400",
  accepted: "bg-blue-400",
  reserved: "bg-violet-400",
  ongoing: "bg-[#2D6A4F] dark:bg-[var(--agri-brand)]",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

function PipelineFlow({ counts }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col p-3">
      {/* Pipeline flow */}
      <div className="flex items-center gap-1 mb-3">
        {PIPELINE_STATUSES.map((status, i) => (
          <div key={status} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center min-w-0 flex-1">
              <span className={`h-3 w-3 rounded-full ${STATUS_COLORS[status]} shrink-0`} />
              <span className="mt-1 text-[10px] font-semibold text-[var(--agri-text-muted)] truncate text-center">
                {t(`transactions.status.${status}`)}
              </span>
              <span className="text-lg font-black text-[var(--agri-text)]">
                {counts[status] ?? 0}
              </span>
            </div>
            {i < PIPELINE_STATUSES.length - 1 && (
              <i className="ri-arrow-right-s-line text-[var(--agri-text-muted)] text-sm shrink-0 mx-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Cancelled row */}
      {counts.cancelled > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
          <span className="flex-1 text-xs font-medium text-red-600 dark:text-red-400">
            {t("transactions.status.cancelled")}
          </span>
          <span className="text-xs font-bold text-red-700 dark:text-red-300">
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

  if (preorderCount === 0 && reservedCount === 0) return null;

  return (
    <div className="border-t border-[var(--agri-border-subtle)] p-3">
      <p className="text-[11px] font-semibold text-[var(--agri-text-muted)] mb-2 uppercase tracking-wider">
        {t("farmer.preorderVisibility")}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <Link
          to="/farmer/products"
          className="flex items-center gap-2 rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-2.5 py-2 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <span className="flex-1 truncate font-medium text-[var(--agri-text-muted)]">
            {t("farmer.preorderProducts")}
          </span>
          <span className="font-bold text-[var(--agri-text)]">{preorderCount}</span>
        </Link>
        <Link
          to="/farmer/transactions"
          className="flex items-center gap-2 rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-2.5 py-2 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />
          <span className="flex-1 truncate font-medium text-[var(--agri-text-muted)]">
            {t("farmer.reservedInquiries")}
          </span>
          <span className="font-bold text-[var(--agri-text)]">{reservedCount}</span>
        </Link>
        <Link
          to="/farmer/transactions"
          className="flex items-center gap-2 rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 px-2.5 py-2 text-xs transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
          <span className="flex-1 truncate font-medium text-[var(--agri-text-muted)]">
            {t("farmer.pendingPreorders")}
          </span>
          <span className="font-bold text-[var(--agri-text)]">{pendingPreorder}</span>
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
      icon="ri-file-list-3-line"
      compact
      fill
    >
      {loading ? (
        <div className="space-y-2 p-3">
          {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-7" />)}
        </div>
      ) : (
        <>
          {/* Total */}
          <Link
            to="/farmer/transactions"
            className="flex items-baseline gap-2 border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/40 px-3 py-2 transition hover:border-[#2D6A4F]/40 hover:bg-[var(--agri-hover)]"
          >
            <span className="text-2xl font-black text-[var(--agri-text)]">{total}</span>
            <span className="text-xs font-semibold text-[var(--agri-text-muted)]">
              {t("farmer.transactionOverview")}
            </span>
          </Link>

          {/* Pipeline flow visualization */}
          <PipelineFlow counts={counts} />

          {/* Pre-order visibility */}
          <PreOrderSummary stats={stats} />
        </>
      )}
    </DashboardSection>
  );
}
