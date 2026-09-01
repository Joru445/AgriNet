import ReviewCard from "../../common/ReviewCard";

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return (
      <div className="bg-[var(--agri-card)] rounded-2xl border border-[var(--agri-border)] p-12 text-center text-[var(--agri-text-muted)]">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-xs transition-all hover:shadow-md"
        >
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}
