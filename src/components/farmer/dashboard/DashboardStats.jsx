import { useLanguage } from "../../../context/LanguageContext";
import StatCard from "../../common/StatCard";

export default function DashboardStats({ stats = {}, loading = false }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 rounded-2xl bg-[var(--agri-card)] border border-[var(--agri-border)] p-5 space-y-3 shadow-2xs"
          >
            <div className="h-4 w-24 bg-[var(--agri-hover)] rounded" />
            <div className="h-7 w-16 bg-[var(--agri-hover)] rounded" />
            <div className="h-3 w-32 bg-[var(--agri-hover)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title={t("farmer.statProducts")}
        value={stats.totalProducts ?? 0}
        description={t("farmer.statProductsDesc")}
        to="/farmer/products"
      />

      <StatCard
        title={t("farmer.statReviews")}
        value={stats.reviewCount ?? 0}
        description={t("farmer.statReviewsDesc")}
        to="/farmer/reviews"
      />

      <StatCard
        title={t("farmer.statAvgRating")}
        value={(stats.averageRating ?? 0).toFixed(1)}
        description={t("farmer.statAvgRatingDesc")}
        to="/farmer/reviews"
      />

      <StatCard
        title={t("farmer.statUnreadMessages")}
        value={stats.unreadMessages ?? 0}
        description={t("farmer.statUnreadMessagesDesc")}
        to="/farmer/messages"
      />
    </div>
  );
}
