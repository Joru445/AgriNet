import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the ProductDetails page layout
 * (src/pages/shared/ProductDetails.jsx): ProductGallery on the left and
 * ProductInfo / ProductDescription / ProductSeller / ProductActions on the
 * right, matching the real section order and container classes.
 */
export default function ProductDetailsSkeleton() {
  return (
    <div className="grid gap-2 sm:gap-5 lg:grid-cols-2 lg:gap-8 lg:items-start">
      {/* Gallery */}
      <div className="space-y-2 md:space-y-4 lg:sticky lg:top-0">
        <SkeletonBox className="aspect-square w-full sm:rounded-2xl md:rounded-3xl sm:border sm:border-[var(--agri-border)] rounded-2xl" />

        <div className="flex gap-2 sm:gap-3 overflow-x-auto px-2 py-1 sm:px-0">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBox key={index} className="h-20 w-20 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-2 sm:space-y-4 lg:space-y-5">
        {/* ProductInfo */}
        <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex justify-between gap-3">
            <SkeletonBox className="h-7 sm:h-8 w-3/4 rounded" />
            <SkeletonBox className="h-6 w-6 shrink-0 rounded-lg" />
          </div>

          <div className="mt-4 flex items-center gap-3.5">
            <SkeletonBox className="h-8 sm:h-9 w-32 rounded" />
            <SkeletonBox className="h-6 w-16 rounded" />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <SkeletonBox className="h-6 w-28 rounded-full" />
            <SkeletonBox className="h-6 w-20 rounded-full" />
            <SkeletonBox className="h-6 w-24 rounded-full" />
          </div>

          <div className="mt-4 pt-3.5 border-t-2 border-[var(--agri-border-subtle)] flex items-center gap-2.5">
            <SkeletonBox className="h-6 w-20 rounded-md" />
            <SkeletonBox className="h-4 w-28 rounded" />
            <SkeletonBox className="h-4 w-32 rounded" />
          </div>
        </section>

        {/* ProductDescription */}
        <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-sm">
          <SkeletonBox className="mb-3 h-5 w-40 rounded" />
          <div className="space-y-2">
            <SkeletonBox className="h-3.5 sm:h-4 w-full rounded" />
            <SkeletonBox className="h-3.5 sm:h-4 w-full rounded" />
            <SkeletonBox className="h-3.5 sm:h-4 w-5/6 rounded" />
          </div>
        </section>

        {/* ProductSeller */}
        <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <SkeletonBox className="h-14 w-14 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBox className="h-4 sm:h-5 w-32 rounded" />
              <SkeletonBox className="h-3 sm:h-3.5 w-40 rounded" />
            </div>

            <SkeletonBox className="h-9 w-24 shrink-0 rounded-xl" />
          </div>
        </section>

        {/* ProductActions */}
        <section className="sticky bottom-0">
          <SkeletonBox className="h-13 w-full rounded-2xl" />
        </section>
      </div>
    </div>
  );
}