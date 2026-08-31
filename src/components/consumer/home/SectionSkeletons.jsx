import SkeletonBox from "../../common/SkeletonBox";

export const NearYouSkeleton = () => (
  <div className="space-y-4">
    <SkeletonBox className="h-6 w-32" /> {/* title */}
    <SkeletonBox className="h-48 w-full" /> {/* image grid placeholder */}
  </div>
);

export const RecentProductsSkeleton = () => (
  <div className="space-y-4">
    <SkeletonBox className="h-6 w-28" />
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonBox key={i} className="h-40 w-full rounded" />
      ))}
    </div>
  </div>
);

export const RelevantProductsSkeleton = () => (
  <div className="space-y-4">
    <SkeletonBox className="h-6 w-28" />
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonBox key={i} className="h-40 w-full rounded" />
      ))}
    </div>
  </div>
);
