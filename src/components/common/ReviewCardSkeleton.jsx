import SkeletonBox from "./SkeletonBox";

/**
 * Skeleton that mirrors the shared ReviewCard
 * (src/components/common/ReviewCard.jsx): reviewer avatar + name/username,
 * rating, comment lines, and optional transaction proof block.
 */
export default function ReviewCardSkeleton({ showProof = false }) {
  return (
    <article className="p-4 sm:p-5">
      {/* Reviewer */}
      <div className="flex items-start gap-3">
        <SkeletonBox className="h-10 w-10 shrink-0 rounded-full" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1.5">
              <SkeletonBox className="h-4 w-28 rounded" />
              <SkeletonBox className="h-3 w-20 rounded" />
            </div>

            <SkeletonBox className="h-3 w-16 rounded" />
          </div>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-3.5 w-3.5 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="mt-3 space-y-2">
        <SkeletonBox className="h-3.5 w-full rounded" />
        <SkeletonBox className="h-3.5 w-4/5 rounded" />
      </div>

      {/* Transaction proof image */}
      {showProof && (
        <SkeletonBox className="mt-4 h-40 w-full rounded-xl sm:h-56" />
      )}
    </article>
  );
}