import { Link } from "react-router-dom";
import ReviewCard from "../../common/ReviewCard";

export default function RecentReviews({ reviews }) {
  const displayedReviews = reviews.slice(0, 2);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Latest Reviews</h2>
        <Link
          to="/farmer/reviews"
          className="text-sm font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition hover:underline"
        >
          View all
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
