import ReviewCardSkeleton from "../../common/ReviewCardSkeleton";

/**
 * Skeleton that mirrors the farmer ReviewList
 * (src/components/farmer/reviews/ReviewList.jsx): a stack of bordered review
 * cards matching ReviewCard's structure.
 */
export default function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-xs"
        >
          <ReviewCardSkeleton />
        </div>
      ))}
    </div>
  );
}