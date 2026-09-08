import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import DashboardSection from "../../common/DashboardSection";
import ReviewCard from "../../common/ReviewCard";
import SkeletonBox from "../../common/SkeletonBox";

export default function RecentReviews({ reviews = [], loading = false }) {
  const { t } = useLanguage();
  const displayedReviews = reviews.slice(0, 2);

  const headerAction = (
    <Link
      to="/farmer/reviews"
      className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] dark:text-[var(--agri-brand)] transition hover:underline"
    >
      {t("farmer.viewAll")}
      <i className="ri-arrow-right-line text-xs" />
    </Link>
  );

  return (
    <DashboardSection
      title={t("farmer.latestReviews")}
      icon="ri-star-line"
      compact
      headerAction={headerAction}
    >
      {loading ? (
        <div className="space-y-3 p-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <SkeletonBox className="h-3 w-24" />
                  <SkeletonBox className="h-2.5 w-16" />
                </div>
              </div>
              <SkeletonBox className="h-3 w-full" />
              <SkeletonBox className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <i className="ri-star-line text-2xl text-[var(--agri-text-muted)]" />
          <p className="mt-2 text-sm font-medium text-[var(--agri-text-muted)]">
            {t("farmer.noReviewsYet")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--agri-border-subtle)]">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
