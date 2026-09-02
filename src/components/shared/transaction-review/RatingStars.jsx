import { useLanguage } from "../../../context/LanguageContext";

export default function RatingStars({
  value = 0,
  onChange,
  disabled = false,
  size = "text-xl",
}) {
  const { t } = useLanguage();

  return (
    <div
      className="flex items-center gap-1"
      role={onChange ? "radiogroup" : undefined}
      aria-label={t("transactionReview.ratingAria")}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        if (!onChange) {
          return (
            <i
              key={star}
              className={`
                ri-star-fill
                ${size}
                ${active ? "text-yellow-400" : "text-gray-200"}
              `}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="
              rounded
              transition
              hover:scale-110
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label={star > 1 ? t("transactionReview.starAriaPlural", { count: star }) : t("transactionReview.starAria", { count: star })}
            aria-pressed={active}
          >
            <i
              className={`
                ri-star-fill
                ${size}
                ${active ? "text-yellow-400" : "text-gray-200"}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}
