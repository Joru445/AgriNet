import useReviews from "../../hooks/useReviews";

import ReviewSummary from "../../components/reviews/ReviewSummary";
import RatingDistribution from "../../components/reviews/RatingDistribution";
import ReviewList from "../../components/reviews/ReviewList";
import ReviewSkeleton from "../../components/reviews/ReviewSkeleton";

export default function Reviews() {
  const {
    loading,

    reviews,

    reviewCount,
    averageRating,

    distribution,
    getPercentage,
  } = useReviews();

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 pb-16 md:pb-0">
        <ReviewSkeleton />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B4332]">Reviews</h1>

        <p className="mt-1 text-sm text-gray-500">
          See what customers are saying about your products.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <ReviewSummary
            averageRating={averageRating}
            reviewCount={reviewCount}
          />

          <RatingDistribution
            distribution={distribution}
            getPercentage={getPercentage}
          />
        </div>

        <ReviewList reviews={reviews} />
      </div>
    </main>
  );
}
