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
            className="h-10 w-10 shrink-0 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
            title={t("reviews.clickToViewPhoto")}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-sm font-semibold text-[var(--agri-text-muted)]">
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
          <div className="mt-2">
            <ReviewRating rating={review.rating} />
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-sm leading-6 text-[var(--agri-text-secondary)]">{review.comment}</p>
      )}

      {/* Product transaction proof */}
      {proofImage && (
        <div
          className="mt-4 overflow-hidden rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)] cursor-pointer group relative"
          onClick={() => setActiveImage({ src: proofImage, title: t("reviews.transactionProof") })}
          title={t("reviews.clickToViewFullScreen")}
        >
          <img
            src={proofImage}
            alt={t("reviews.proofImageAlt")}
            className="max-h-80 w-full object-cover sm:max-h-96 group-hover:scale-[1.01] transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md backdrop-blur-xs flex items-center gap-1">
              <i className="ri-zoom-in-line" /> {t("reviews.viewPhoto")}
            </span>
          </div>
        </div>
      )}

      {/* Transaction indicator */}
      {isProduct && review.inquiryId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--agri-text-muted)]">
          <i className="ri-checkbox-circle-line text-[#2D6A4F]" />
          {t("reviews.verifiedTransactionReview")}
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
