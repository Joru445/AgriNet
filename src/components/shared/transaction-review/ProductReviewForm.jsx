import RatingStars from "./RatingStars";
import ReviewTextarea from "./ReviewTextarea";

export default function ProductReviewForm({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  disabled = false,
}) {
  return (
    <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-md">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[var(--agri-text)]">
          Rate the Product
        </h2>

        <p className="mt-1 text-sm font-medium text-[var(--agri-text-secondary)]">
          How satisfied are you with the product you received?
        </p>
      </div>

      <RatingStars
        value={rating}
        onChange={onRatingChange}
        disabled={disabled}
      />

      <p className="mt-2 text-xs text-[var(--agri-text-muted)]">
        {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
      </p>

      <div className="mt-4">
        <label
          htmlFor="product-review"
          className="mb-2 block text-sm font-medium text-[var(--agri-text-secondary)]"
        >
          Comment
        </label>

        <ReviewTextarea
          value={comment}
          onChange={onCommentChange}
          disabled={disabled}
          placeholder="Tell other consumers about the quality of this product..."
        />
      </div>
    </section>
  );
}
