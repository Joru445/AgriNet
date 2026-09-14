import { useState } from "react";

import { useLanguage } from "../../context/LanguageContext";

import ReviewCard from "./ReviewCard";
import ReviewEmpty from "./ReviewEmpty";

export default function ReviewSection({
  title,
  reviews = [],
  loading = false,
  type = "product",
}) {
  const { t } = useLanguage();
  const isProduct = type === "product";
  const [showAll, setShowAll] = useState(false);
  const sectionTitle = title || t("reviews.title");

  if (loading) {
    return (
      <section className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) mt-6 shadow-xs">
        <div className="border-b border-(--agri-border-subtle) px-4 py-4 sm:px-5">
          <div className="h-5 w-24 animate-pulse rounded bg-(--agri-hover)" />
        </div>

        <div className="divide-y divide-(--agri-border-subtle)">
          {[1, 2].map((item) => (
            <div key={item} className="p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-(--agri-hover)" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-(--agri-hover)" />
                  <div className="h-3 w-24 animate-pulse rounded bg-(--agri-hover)" />
                  <div className="h-4 w-full animate-pulse rounded bg-(--agri-hover)" />
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
    <section className="rounded-2xl border border-(--agri-border) bg-(--agri-card) shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--agri-border-subtle) px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-(--agri-text)">{sectionTitle}</h2>

          <p className="mt-0.5 text-xs text-(--agri-text-muted)">
            {reviews.length} {reviews.length === 1 ? t("reviews.reviewSingular") : t("reviews.reviewPlural")}
          </p>
        </div>

        {reviews.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-(--agri-green-mid) dark:text-(--agri-brand) hover:text-(--agri-green-dark) dark:hover:text-(--agri-brand-light) hover:underline flex items-center gap-1 transition-colors"
          >
            {showAll ? t("reviews.showLess") : t("reviews.viewAll")}
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
          <div className="divide-y divide-(--agri-border-subtle)">
            {displayedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} type={type} />
            ))}
          </div>

          {/* Shopee-style View All Reviews Button */}
          {reviews.length > 2 && (
            <div className="border-t border-(--agri-border-subtle) p-3 bg-(--agri-hover)/70 text-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-(--agri-green-mid) dark:text-(--agri-brand) hover:text-(--agri-green-dark) dark:hover:text-(--agri-brand-light) transition-colors py-1.5 px-4 rounded-lg hover:bg-(--agri-card) cursor-pointer"
              >
                <span>
                  {showAll
                    ? t("reviews.showLessReviews")
                    : t("reviews.viewAllReviews", { count: reviews.length })}
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
