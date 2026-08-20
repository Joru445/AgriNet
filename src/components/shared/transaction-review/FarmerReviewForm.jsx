import RatingStars from "./RatingStars";
import ReviewTextarea from "./ReviewTextarea";

export default function FarmerReviewForm({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  disabled = false,
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Rate the farmer
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          How was your experience dealing with this farmer?
        </p>
      </div>

      <RatingStars
        value={rating}
        onChange={onRatingChange}
        disabled={disabled}
      />

      <p className="mt-2 text-xs text-gray-400">
        {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
      </p>

      <div className="mt-4">
        <label
          htmlFor="farmer-review"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Comment
        </label>

        <ReviewTextarea
          value={comment}
          onChange={onCommentChange}
          disabled={disabled}
          placeholder="Tell other consumers about your experience with this farmer..."
        />
      </div>
    </section>
  );
}
