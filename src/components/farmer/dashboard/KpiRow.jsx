import StatCard from "../../common/StatCard";
import SkeletonBox from "../../common/SkeletonBox";
import { useLanguage } from "../../../context/LanguageContext";

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-2.5 shadow-2xs">
      <SkeletonBox className="h-3 w-16" />
      <SkeletonBox className="mt-1 h-6 w-10" />
      <SkeletonBox className="mt-1 h-2.5 w-20" />
    </div>
  );
}

export default function KpiRow({ stats = {}, loading = false }) {
  const { t } = useLanguage();

  return (
    <div className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-card)]/50 px-4 py-2.5">
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
          : (
            <>
              <StatCard compact title={t("farmer.statProducts")} value={stats.totalProducts ?? 0} to="/farmer/products" />
              <StatCard compact title={t("farmer.statAvailable")} value={stats.availableProducts ?? 0} to="/farmer/products" />
              <StatCard compact title={t("farmer.statPreOrders")} value={stats.preorderCount ?? 0} to="/farmer/transactions" />
              <StatCard compact title={t("farmer.statInquiries")} value={stats.totalInquiries ?? 0} to="/farmer/transactions" />
              <StatCard compact title={t("farmer.statOngoing")} value={stats.ongoingInquiries ?? 0} to="/farmer/transactions" />
              <StatCard compact title={t("farmer.statCompleted")} value={stats.completedInquiries ?? 0} to="/farmer/transactions" />
            </>
          )}
      </div>

      {!loading && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--agri-text-muted)]">
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            {t("farmer.secondaryRating")}: <b className="text-[var(--agri-text)]">{(stats.averageRating ?? 0).toFixed(1)}</b>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-purple-400" />
            {t("farmer.secondaryReviews")}: <b className="text-[var(--agri-text)]">{stats.reviewCount ?? 0}</b>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-red-400" />
            {t("farmer.secondaryUnavailable")}: <b className="text-[var(--agri-text)]">{stats.unavailableProducts ?? 0}</b>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            {t("farmer.secondaryReserved")}: <b className="text-[var(--agri-text)]">{stats.reservedInquiries ?? 0}</b>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-blue-400" />
            {t("farmer.statUnreadMessages")}: <b className="text-[var(--agri-text)]">{stats.unreadMessages ?? 0}</b>
          </span>
        </div>
      )}
    </div>
  );
}
