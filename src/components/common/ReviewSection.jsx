import { useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewEmpty from "./ReviewEmpty";

export default function ReviewSection({
  title = "Reviews",
  reviews = [],
  loading = false,
  type = "product",
}) {
  const isProduct = type === "product";
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white mt-6 shadow-xs">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2].map((item) => (
            <div key={item} className="p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-[#1B4332]">{title}</h2>

          <p className="mt-0.5 text-xs text-gray-500">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {reviews.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] hover:underline flex items-center gap-1 transition-colors"
          >
            {showAll ? "Show Less" : "View All"}
            <i
              className={
                showAll
                  ? "ri-arrow-up-s-line text-sm"
                  : "ri-arrow-right-s-line text-sm"
              }
            />
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <ReviewEmpty type={isProduct ? "product" : "farmer"} />
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {displayedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} type={type} />
            ))}
          </div>

          {/* Shopee-style View All Reviews Button */}
          {reviews.length > 2 && (
            <div className="border-t border-gray-100 p-3 bg-gray-50/70 text-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition-colors py-1.5 px-4 rounded-lg hover:bg-white cursor-pointer"
              >
                <span>
                  {showAll
                    ? "Show Less Reviews"
                    : `View All Reviews (${reviews.length})`}
                </span>
                <i
                  className={
                    showAll
                      ? "ri-arrow-up-s-line text-base"
                      : "ri-arrow-right-s-line text-base"
                  }
                />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
