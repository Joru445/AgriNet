import { useState } from "react";
import ReviewRating from "../farmer/reviews/ReviewRating";
import { formatTimestamp } from "../../utils/date";
import ImageViewerModal from "./ImageViewerModal";

export default function ReviewCard({ review, type = "product" }) {
  const [activeImage, setActiveImage] = useState(null);
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
            loading="lazy"
            onClick={() => setActiveImage({ src: reviewerAvatar, title: `${reviewerName}'s Profile Picture` })}
            className="h-10 w-10 shrink-0 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
            title="Click to view photo"
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
        <div
          className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 cursor-pointer group relative"
          onClick={() => setActiveImage({ src: proofImage, title: "Transaction Proof" })}
          title="Click to view full screen"
        >
          <img
            src={proofImage}
            alt="Product transaction proof"
            className="max-h-80 w-full object-cover sm:max-h-96 group-hover:scale-[1.01] transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md backdrop-blur-xs flex items-center gap-1">
              <i className="ri-zoom-in-line" /> View Photo
            </span>
          </div>
        </div>
      )}

      {/* Transaction indicator */}
      {isProduct && review.inquiryId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <i className="ri-checkbox-circle-line text-[#2D6A4F]" />
          Verified transaction review
        </div>
      )}

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={Boolean(activeImage)}
        src={activeImage?.src}
        title={activeImage?.title}
        onClose={() => setActiveImage(null)}
      />
    </article>
  );
}
