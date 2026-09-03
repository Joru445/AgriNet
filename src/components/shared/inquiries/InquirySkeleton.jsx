import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the InquiryTable grid
 * (src/components/shared/inquiries/InquiryTable.jsx + InquiryRow.jsx):
 * a grid of inquiry cards with a header, product/counterparty body and an
 * action footer.
 */
function InquiryCardSkeleton() {
  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--agri-border)] bg-[var(--agri-hover)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-4 w-4 rounded" />
          <SkeletonBox className="h-3 w-24 rounded" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SkeletonBox className="hidden h-3 w-24 rounded sm:block" />
          <SkeletonBox className="h-6 w-16 rounded-full" />
          <SkeletonBox className="h-7 w-7 rounded-lg" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <SkeletonBox className="h-20 w-20 shrink-0 rounded-2xl sm:h-24 sm:w-24" />

          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBox className="h-4 w-3/4 rounded" />

            <div className="flex items-baseline gap-2">
              <SkeletonBox className="h-4 w-16 rounded" />
              <SkeletonBox className="h-3 w-10 rounded" />
            </div>

            <div className="pt-1.5 flex items-center gap-1.5">
              <SkeletonBox className="h-3 w-3 rounded-full" />
              <SkeletonBox className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/60 px-4 py-3 sm:px-5">
        <SkeletonBox className="h-9 w-32 rounded-xl" />
        <SkeletonBox className="h-9 w-20 rounded-xl" />
      </div>
    </article>
  );
}

export default function InquirySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <InquiryCardSkeleton key={index} />
      ))}
    </div>
  );
}