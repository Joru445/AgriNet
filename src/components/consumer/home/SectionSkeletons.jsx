import ProductGridSkeleton from "../../shared/product/ProductGridSkeleton";
import SkeletonBox from "../../common/SkeletonBox";

function SectionHeaderSkeleton({ alignItems = "items-end" }) {
  return (
    <div className={`flex ${alignItems} justify-between gap-4`}>
      <div className="min-w-0">
        <SkeletonBox className="h-5 w-32 sm:h-6 sm:w-36" />
        <SkeletonBox className="mt-1.5 h-2.5 sm:h-3 w-40 sm:w-48 rounded-full" />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <SkeletonBox className="h-3 w-14 sm:h-3.5 sm:w-16 rounded" />
      </div>
    </div>
  );
}

export const NearYouSkeleton = () => (
  <section className="space-y-4">
    <SectionHeaderSkeleton />

    <ProductGridSkeleton
      count={4}
      gridClassName="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4"
    />
  </section>
);

export const RecentProductsSkeleton = () => (
  <section className="space-y-4">
    <SectionHeaderSkeleton />

    <ProductGridSkeleton
      count={4}
      gridClassName="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4"
    />
  </section>
);

export const RelevantProductsSkeleton = () => (
  <section className="space-y-4">
    <SectionHeaderSkeleton alignItems="items-center" />

    <ProductGridSkeleton
      count={5}
      gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
    />
  </section>
);