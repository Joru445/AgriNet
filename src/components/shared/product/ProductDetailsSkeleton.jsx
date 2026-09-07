import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the redesigned ProductDetails page layout:
 * two-column hero (gallery left, info right), then description + reviews.
 */
export default function ProductDetailsSkeleton() {
  return (
    <div className="grid gap-0 lg:grid-cols-2 lg:gap-8 lg:items-start">
      {/* Gallery */}
      <div className="space-y-2 lg:sticky lg:top-0">
        <SkeletonBox className="aspect-square w-full" />

        <div className="flex gap-2 overflow-x-auto px-1 py-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBox key={index} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col">
        {/* ProductInfo */}
        <section className="px-4 pt-5 sm:px-6 lg:pt-6">
          <SkeletonBox className="h-7 sm:h-8 w-3/4 rounded mb-3" />

          <div className="flex items-baseline gap-3">
            <SkeletonBox className="h-8 sm:h-9 w-32 rounded" />
            <SkeletonBox className="h-5 w-16 rounded" />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <SkeletonBox className="h-6 w-28 rounded-full" />
            <SkeletonBox className="h-6 w-20 rounded-full" />
            <SkeletonBox className="h-6 w-24 rounded-full" />
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--agri-border-subtle)] flex items-center gap-3">
            <SkeletonBox className="h-6 w-20 rounded-md" />
            <SkeletonBox className="h-4 w-28 rounded" />
            <SkeletonBox className="h-4 w-32 rounded" />
          </div>
        </section>

        {/* Description */}
        <section className="px-4 sm:px-6 mt-4 sm:mt-5">
          <SkeletonBox className="h-5 w-40 rounded mb-3" />
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-full rounded" />
            <SkeletonBox className="h-4 w-full rounded" />
            <SkeletonBox className="h-4 w-5/6 rounded" />
          </div>
        </section>

        {/* Seller */}
        <section className="mx-4 sm:mx-6 mt-4 sm:mt-5 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)] p-4">
          <div className="flex items-center gap-3.5">
            <SkeletonBox className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBox className="h-4 sm:h-5 w-32 rounded" />
              <SkeletonBox className="h-3 w-40 rounded" />
            </div>
            <SkeletonBox className="h-8 w-24 shrink-0 rounded-lg" />
          </div>
        </section>

        {/* CTA Button */}
        <section className="px-4 sm:px-6 mt-4 sm:mt-5 pb-2">
          <SkeletonBox className="h-12 w-full rounded-xl" />
        </section>
      </div>
    </div>
  );
}
