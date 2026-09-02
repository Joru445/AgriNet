import { useLanguage } from "../../../context/LanguageContext";

export default function ReviewRating({ rating = 0 }) {
  const { t } = useLanguage();
  const value = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={t("farmerReviews.outOf5Stars", { value: value.toFixed(1) })}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={
            star <= value
              ? "ri-star-fill text-yellow-400"
              : "ri-star-line text-[var(--agri-border)]"
          }
        />
      ))}

      <span className="ml-1 text-xs font-medium text-[var(--agri-text-muted)]">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
