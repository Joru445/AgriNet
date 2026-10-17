import SkeletonBox from "../ui/SkeletonBox";

export function ProfileHeaderSkeleton() {
  return (
    <section className="bg-(--agri-card)" aria-hidden="true">
      <div className="mx-auto max-w-7xl">
        <div className="relative h-56 overflow-hidden bg-(--agri-hover) sm:h-72 md:h-80 lg:h-[380px] sm:rounded-b-2xl" />
      </div>
      <div className="relative mx-auto max-w-7xl -mt-8 px-4 sm:mt-0 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end">
          <div className="flex items-end gap-4">
            <div className="-mt-8 block shrink-0 sm:-mt-16">
              <div className="h-24 w-24 rounded-full border-4 border-(--agri-card) bg-(--agri-hover) shadow-md sm:h-32 sm:w-32" />
            </div>
            <div className="min-w-0 space-y-2 pb-1 sm:pb-3">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-5 w-40 rounded sm:h-7 sm:w-48" />
                <SkeletonBox className="h-5 w-5 rounded-full" />
              </div>
              <SkeletonBox className="h-3.5 w-28 rounded" />
              <SkeletonBox className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pb-1 sm:ml-auto sm:pb-3">
            <SkeletonBox className="h-10 w-24 rounded-xl" />
            <SkeletonBox className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-(--agri-border-subtle) py-3 sm:gap-6 sm:py-4">
          <SkeletonBox className="h-4 w-24 rounded" />
          <SkeletonBox className="h-4 w-32 rounded" />
        </div>
      </div>
    </section>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <section className="grid grid-cols-2 divide-x divide-y divide-(--agri-border-subtle) border-y border-(--agri-border-subtle) bg-(--agri-surface) sm:grid-cols-3" aria-hidden="true">
      {[1, 2, 3].map((item) => (
        <div key={item} className="min-w-[9rem] px-4 py-3 sm:px-5">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="mt-2 h-5 w-14" />
        </div>
      ))}
    </section>
  );
}

export function ProfileContentSkeleton() {
  return (
    <section className="space-y-4 px-4 py-8 sm:px-6" aria-hidden="true">
      <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="mt-4 h-3 w-11/12" />
        <SkeletonBox className="mt-2 h-3 w-2/3" />
        <SkeletonBox className="mt-2 h-3 w-4/5" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4">
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="mt-3 h-3 w-full" />
            <SkeletonBox className="mt-2 h-3 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Complete fallback retained for route-level consumers that need one shell. */
export default function PublicProfileSkeleton() {
  return (
    <main className="mx-auto min-h-full w-full max-w-6xl bg-(--agri-surface) pb-12">
      <ProfileHeaderSkeleton />
      <ProfileStatsSkeleton />
      <ProfileContentSkeleton />
    </main>
  );
}
