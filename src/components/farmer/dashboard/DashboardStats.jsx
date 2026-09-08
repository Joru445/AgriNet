import { useLanguage } from "../../../context/LanguageContext";
import StatCard from "../../common/StatCard";

export default function DashboardStats({ stats = {}, loading = false }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-24 rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-3 space-y-2 shadow-2xs"
          >
            <div className="h-3.5 w-20 bg-[var(--agri-hover)] rounded" />
            <div className="h-6 w-14 bg-[var(--agri-hover)] rounded" />
            <div className="h-3 w-28 bg-[var(--agri-hover)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        compact
        title={t("farmer.statProducts")}
        value={stats.totalProducts ?? 0}
        description={t("farmer.statProductsDesc")}
        to="/farmer/products"
      />

      <StatCard
        compact
        title={t("farmer.statPreOrders")}
        value={stats.preorderCount ?? 0}
        description={t("farmer.statPreOrdersDesc")}
        to="/farmer/transactions"
      />

      <StatCard
        compact
        title={t("farmer.statReviews")}
        value={stats.reviewCount ?? 0}
        description={t("farmer.statReviewsDesc")}
        to="/farmer/reviews"
      />

      <StatCard
        compact
        title={t("farmer.statAvgRating")}
        value={(stats.averageRating ?? 0).toFixed(1)}
        description={t("farmer.statAvgRatingDesc")}
        to="/farmer/reviews"
      />

      <StatCard
        compact
        title={t("farmer.statUnreadMessages")}
        value={stats.unreadMessages ?? 0}
        description={t("farmer.statUnreadMessagesDesc")}
        to="/farmer/messages"
      />
    </div>
  );
}
