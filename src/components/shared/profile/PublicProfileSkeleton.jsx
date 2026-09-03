import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the PublicProfileHeader component
 * (src/components/shared/profile/PublicProfileHeader.jsx): cover photo,
 * overlapping avatar, name/username, action buttons and the stats row.
 */
export default function PublicProfileSkeleton() {
  return (
    <div className="bg-[var(--agri-card)]">
      {/* Cover */}
      <div className="mx-auto max-w-7xl">
        <div className="relative h-56 overflow-hidden bg-[var(--agri-hover)] sm:h-72 md:h-80 lg:h-[380px] sm:rounded-b-2xl" />
      </div>

      {/* Profile info */}
      <div className="relative mx-auto max-w-7xl -mt-8 px-4 sm:mt-0 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-4">
          {/* Avatar + text */}
          <div className="flex items-end gap-4">
            <div className="block shrink-0 -mt-8 sm:-mt-16">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-[var(--agri-card)] bg-[var(--agri-hover)] shadow-md" />
            </div>

            <div className="min-w-0 pb-1 sm:pb-3 space-y-2">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-5 w-40 sm:h-7 sm:w-48 rounded" />
                <SkeletonBox className="h-5 w-5 rounded-full" />
              </div>
              <SkeletonBox className="h-3.5 w-28 rounded" />
              <SkeletonBox className="h-5 w-20 rounded-full" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto pb-1 sm:pb-3">
            <SkeletonBox className="h-10 w-28 rounded-xl" />
            <SkeletonBox className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-3 sm:py-4 border-t border-[var(--agri-border-subtle)]">
          <SkeletonBox className="h-4 w-16 rounded" />
          <SkeletonBox className="h-4 w-32 rounded" />
          <SkeletonBox className="h-4 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}