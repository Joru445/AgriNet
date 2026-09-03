import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the shared consumer ProductCard
 * (src/components/common/ProductCard.jsx) so the loading state
 * has the same structure, aspect ratio and footer.
 */
export default function ProductCardSkeleton({ showFooter = true }) {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-md">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--agri-hover)]">
        {/* Category pill - top left */}
        <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5 flex w-20 items-center gap-1 rounded-full bg-[var(--agri-card)] px-1.5 py-0.5 sm:px-2.5 sm:py-1">
          <SkeletonBox className="h-3 w-3 rounded-full" />
        </div>

        {/* Stock badge - top right corner */}
        <div className="absolute top-0 right-0 rounded-bl-xl sm:rounded-bl-2xl bg-[var(--agri-hover)] px-2 py-0.5 sm:px-3 sm:py-1">
          <SkeletonBox className="h-2.5 sm:h-3 w-12 rounded-full" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 pt-1 space-y-2 sm:space-y-3">
        <div>
          {/* Name row */}
          <div className="flex justify-between gap-2">
            <SkeletonBox className="h-3.5 sm:h-4 w-3/4 rounded" />
            <SkeletonBox className="h-2.5 sm:h-3 w-12 shrink-0 rounded" />
          </div>

          {/* Price + unit */}
          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-2">
              <SkeletonBox className="h-4 sm:h-5 w-16 rounded" />
              <SkeletonBox className="h-2.5 sm:h-3 w-8 rounded" />
            </div>
          </div>
        </div>

        {/* Footer: rating & distance */}
        {showFooter && (
          <div className="pt-2 sm:pt-3 border-t border-[var(--agri-border-subtle)] flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <SkeletonBox className="h-3 sm:h-3.5 w-3 sm:w-3.5 rounded-full" />
              <SkeletonBox className="h-3 sm:h-3.5 w-10 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <SkeletonBox className="h-3 sm:h-3.5 w-3 sm:w-3.5 rounded-full" />
              <SkeletonBox className="h-3 sm:h-3.5 w-12 rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}