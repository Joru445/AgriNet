import { useState } from "react";
import ReviewRating from "../farmer/reviews/ReviewRating";
import { formatTimestamp } from "../../utils/date";
import ImageViewerModal from "./ImageViewerModal";
import { useLanguage } from "../../context/LanguageContext";

export default function ReviewCard({ review, type = "product" }) {
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState(null);
  const isProduct = type === "product";

  const reviewer = review.reviewer ?? {};

  const reviewerName = reviewer.fullname || reviewer.username || t("reviews.anonymous");

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
            onClick={() => setActiveImage({ src: reviewerAvatar, title: t("profile.picOf", { name: reviewerName }) })}
            className="h-9 w-9 shrink-0 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
            title={t("reviews.clickToViewPhoto")}
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-sm font-semibold text-[var(--agri-text-muted)]">
            {reviewerName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--agri-text)]">
                {reviewerName}
              </p>

              {reviewer.username && reviewer.fullname && (
                <p className="text-xs text-[var(--agri-text-muted)]">@{reviewer.username}</p>
              )}
            </div>

            {review.createdAt && (
              <span className="text-xs text-[var(--agri-text-muted)]">
                {formatTimestamp(review.createdAt)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-1.5">
            <ReviewRating rating={review.rating} />
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-2.5 text-sm leading-6 text-[var(--agri-text-secondary)]">{review.comment}</p>
      )}

      {/* Product transaction proof — small thumbnail */}
      {proofImage && (
        <button
          type="button"
          className="mt-3 overflow-hidden rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)] cursor-pointer group inline-flex"
          onClick={() => setActiveImage({ src: proofImage, title: t("reviews.transactionProof") })}
          title={t("reviews.clickToViewFullScreen")}
        >
          <img
            src={proofImage}
            alt={t("reviews.proofImageAlt")}
            className="h-20 w-20 sm:h-24 sm:w-24 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </button>
      )}

      {/* Transaction indicator */}
      {isProduct && review.inquiryId && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--agri-text-muted)]">
          <i className="ri-checkbox-circle-line text-[#2D6A4F]" />
          {t("reviews.verifiedTransactionReview")}
        </div>
      )}

      <ImageViewerModal
        isOpen={Boolean(activeImage)}
        src={activeImage?.src}
        title={activeImage?.title}
        onClose={() => setActiveImage(null)}
      />
    </article>
  );
}
