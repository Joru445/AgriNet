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
    <div className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-card)]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3.5 py-2.5 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[var(--agri-text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-star-fill text-amber-400 text-sm" />
                <span className="font-medium text-[var(--agri-text-muted)]">{t("farmer.secondaryRating")}:</span>
                <span className="font-bold text-[var(--agri-text)]">{(stats.averageRating ?? 0).toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-chat-smile-2-line text-purple-500 text-sm" />
                <span className="font-medium text-[var(--agri-text-muted)]">{t("farmer.secondaryReviews")}:</span>
                <span className="font-bold text-[var(--agri-text)]">{stats.reviewCount ?? 0}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-forbid-2-line text-rose-500 text-sm" />
                <span className="font-medium text-[var(--agri-text-muted)]">{t("farmer.secondaryUnavailable")}:</span>
                <span className="font-bold text-[var(--agri-text)]">{stats.unavailableProducts ?? 0}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-bookmark-line text-violet-500 text-sm" />
                <span className="font-medium text-[var(--agri-text-muted)]">{t("farmer.secondaryReserved")}:</span>
                <span className="font-bold text-[var(--agri-text)]">{stats.reservedInquiries ?? 0}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-mail-line text-blue-500 text-sm" />
                <span className="font-medium text-[var(--agri-text-muted)]">{t("farmer.statUnreadMessages")}:</span>
                <span className="font-bold text-[var(--agri-text)]">{stats.unreadMessages ?? 0}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
