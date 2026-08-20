import ReviewRating from "../farmer/reviews/ReviewRating";
import { formatTimestamp } from "../../utils/date";

export default function ReviewCard({ review, type = "product" }) {
  const isProduct = type === "product";

  const reviewer = review.reviewer ?? {};

  const reviewerName = reviewer.fullname || reviewer.username || "Anonymous";

  const reviewerAvatar = reviewer.profilePicture || "";

  /*
   * Product reviews can contain the transaction proof.
   *
   * Depending on how the review service returns the
   * inquiry, support both:
   *
   * review.inquiry.proof.url
   * review.proof.url
   */
  const proofImage = isProduct
    ? review.inquiry?.proof?.url || review.proof?.url || ""
    : "";

  return (
    <article className="p-4 sm:p-5">
      {/* Reviewer */}
      <div className="flex items-start gap-3">
        {reviewerAvatar ? (
          <img
            src={reviewerAvatar}
            alt={reviewerName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
            {reviewerName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {reviewerName}
              </p>

              {reviewer.username && reviewer.fullname && (
                <p className="text-xs text-gray-400">@{reviewer.username}</p>
              )}
            </div>

            {review.createdAt && (
              <span className="text-xs text-gray-400">
                {formatTimestamp(review.createdAt)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-2">
            <ReviewRating rating={review.rating} />
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment}</p>
      )}

      {/* Product transaction proof */}
      {proofImage && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          <img
            src={proofImage}
            alt="Product transaction proof"
            className="max-h-80 w-full object-cover sm:max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Transaction indicator */}
      {isProduct && review.inquiryId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <i className="ri-checkbox-circle-line text-[#2D6A4F]" />
          Verified transaction review
        </div>
      )}
    </article>
  );
}
