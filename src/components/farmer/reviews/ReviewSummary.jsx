import { useLanguage } from "../../../context/LanguageContext";
import ReviewRating from "./ReviewRating";

export default function ReviewSummary({ averageRating, reviewCount }) {
  const { t } = useLanguage();

  return (
    <div className="bg-[var(--agri-card)] rounded-2xl border border-[var(--agri-border)] p-6">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-5xl font-bold text-[var(--agri-text)]">
          {averageRating.toFixed(1)}
        </h2>

        <div className="mt-2">
          <ReviewRating rating={Math.round(averageRating)} size="text-xl" />
        </div>

        <p className="mt-3 text-sm text-[var(--agri-text-muted)]">
          {t("farmer.basedOnReviews", { count: reviewCount })}
        </p>
      </div>
    </div>
  );
}
