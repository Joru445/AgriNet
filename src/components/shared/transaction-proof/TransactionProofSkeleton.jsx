import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the TransactionProof page
 * (src/pages/shared/TransactionProof.jsx): the TransactionProduct card
 * (image + info) followed by a generic action section.
 */
export default function TransactionProofSkeleton() {
  return (
    <div className="space-y-5">
      {/* TransactionProduct */}
      <section className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <SkeletonBox className="h-48 w-full shrink-0 rounded-none sm:h-auto sm:w-48" />

          <div className="flex-1 p-5">
            <SkeletonBox className="h-3 w-24 rounded" />
            <SkeletonBox className="mt-2 h-5 w-3/4 rounded" />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <SkeletonBox className="h-2.5 w-20 rounded" />
                <SkeletonBox className="h-4 w-24 rounded" />
              </div>
              <div className="space-y-1.5">
                <SkeletonBox className="h-2.5 w-20 rounded" />
                <SkeletonBox className="h-4 w-24 rounded" />
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--agri-border-subtle)] pt-4 space-y-1.5">
              <SkeletonBox className="h-2.5 w-24 rounded" />
              <SkeletonBox className="h-4 w-28 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Generic action section */}
      <section className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <SkeletonBox className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBox className="h-4 w-40 rounded" />
            <SkeletonBox className="h-3.5 w-full rounded" />
          </div>
        </div>

        <SkeletonBox className="mt-5 h-11 w-full rounded-xl" />
      </section>
    </div>
  );
}