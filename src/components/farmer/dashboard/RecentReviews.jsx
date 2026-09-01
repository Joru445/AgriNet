import { Link } from "react-router-dom";
import ReviewCard from "../../common/ReviewCard";

export default function RecentReviews({ reviews = [], loading = false }) {
  const displayedReviews = reviews.slice(0, 2);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--agri-text)]">Latest Reviews</h2>
        <Link
          to="/farmer/reviews"
          className="text-sm font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition hover:underline"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--agri-hover)]" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-[var(--agri-hover)] rounded" />
                  <div className="h-3 w-20 bg-[var(--agri-hover)] rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-[var(--agri-hover)] rounded" />
              <div className="h-3 w-4/5 bg-[var(--agri-hover)] rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--agri-border)] bg-[var(--agri-card)] p-10 text-center text-[var(--agri-text-muted)]">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
