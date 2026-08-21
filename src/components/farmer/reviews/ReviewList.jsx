import ReviewCard from "../../common/ReviewCard";

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all hover:shadow-md"
        >
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}
