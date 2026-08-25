import useReviews from "../../hooks/useReviews";

import ReviewSummary from "../../components/farmer/reviews/ReviewSummary";
import RatingDistribution from "../../components/farmer/reviews/RatingDistribution";
import ReviewList from "../../components/farmer/reviews/ReviewList";
import ReviewSkeleton from "../../components/farmer/reviews/ReviewSkeleton";

export default function Reviews() {
  const {
    loading,

    reviews,

    reviewCount,
    averageRating,

    distribution,
    getPercentage,
  } = useReviews();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B4332]">Reviews</h1>

        <p className="mt-1 text-sm text-gray-500">
          See what customers are saying about your products.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse flex flex-col items-center justify-center space-y-3 shadow-2xs">
              <div className="h-12 w-20 bg-gray-200 rounded-xl" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-3 w-36 bg-gray-100 rounded" />
            </div>
          ) : (
            <ReviewSummary
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-pulse shadow-2xs">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                  <div className="h-2 flex-1 bg-gray-100 rounded-full" />
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <RatingDistribution
              distribution={distribution}
              getPercentage={getPercentage}
            />
          )}
        </div>

        {loading ? (
          <ReviewSkeleton />
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </div>
    </main>
  );
}
