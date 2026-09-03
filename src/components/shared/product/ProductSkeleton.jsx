import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the farmer ProductGrid/ProductCard
 * (src/components/farmer/products/ProductGrid.jsx + ProductCard.jsx)
 * used on the My Products page.
 */
function FarmerProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-sm">
      {/* Image + badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--agri-hover)]">
        <SkeletonBox className="absolute left-1.5 top-1.5 flex w-20 items-center gap-1 rounded-full bg-[var(--agri-card)] px-1.5 py-0.5" />

        <SkeletonBox className="absolute top-0 right-0 h-4 w-12 rounded-bl-lg" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 space-y-2">
        <div>
          <div className="min-h-[2.4em] space-y-1.5">
            <SkeletonBox className="h-2.5 sm:h-3 w-4/5 rounded" />
            <SkeletonBox className="h-2.5 sm:h-3 w-3/5 rounded" />
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-2">
              <SkeletonBox className="h-3.5 sm:h-4 w-14 rounded" />
              <SkeletonBox className="h-2.5 w-8 rounded" />
            </div>
            <SkeletonBox className="h-2.5 w-10 rounded" />
          </div>
        </div>

        {/* Footer action buttons */}
        <div className="pt-2 border-t border-[var(--agri-border)] flex items-center gap-1.5">
          <SkeletonBox className="flex-1 h-7 rounded-lg" />
          <SkeletonBox className="h-7 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <FarmerProductCardSkeleton key={i} />
      ))}
    </div>
  );
}