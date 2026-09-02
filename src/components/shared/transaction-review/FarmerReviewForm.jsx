import RatingStars from "./RatingStars";
import ReviewTextarea from "./ReviewTextarea";
import { useLanguage } from "../../../context/LanguageContext";

export default function FarmerReviewForm({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  disabled = false,
}) {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-md">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[var(--agri-text)]">
          {t("transactionReview.rateFarmer")}
        </h2>

        <p className="mt-1 text-sm font-medium text-[var(--agri-text-secondary)]">
          {t("transactionReview.rateFarmerDesc")}
        </p>
      </div>

      <RatingStars
        value={rating}
        onChange={onRatingChange}
        disabled={disabled}
      />

      <p className="mt-2 text-xs text-[var(--agri-text-muted)]">
        {rating > 0 ? t("transactionReview.outOfStars") : t("transactionReview.selectRating")}
      </p>

      <div className="mt-4">
        <label
          htmlFor="farmer-review"
          className="mb-2 block text-sm font-medium text-[var(--agri-text-secondary)]"
        >
          {t("transactionReview.commentLabel")}
        </label>

        <ReviewTextarea
          value={comment}
          onChange={onCommentChange}
          disabled={disabled}
          placeholder={t("transactionReview.farmerCommentPlaceholder")}
        />
      </div>
    </section>
  );
}
