export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-gray-200 shadow-2xs"
        >
          <div className="aspect-square bg-gray-200" />

          <div className="space-y-3 p-3 sm:p-4">
            <div className="h-4 sm:h-5 w-3/4 rounded bg-gray-200" />
            <div className="h-5 sm:h-6 w-1/2 rounded bg-gray-200" />

            <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 sm:h-3 w-2/3 rounded bg-gray-200" />
                <div className="h-2 sm:h-2.5 w-1/2 rounded bg-gray-200" />
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-100">
              <div className="h-3 sm:h-4 w-16 rounded bg-gray-200" />
              <div className="h-3 sm:h-4 w-20 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketplaceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
      {/* Search & Categories Skeleton */}
      <div className="space-y-4">
        <div className="h-14 w-full max-w-4xl mx-auto rounded-2xl bg-gray-200" />
        <div className="flex justify-center gap-2 overflow-hidden py-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 pt-2">
        {/* Desktop Filters Skeleton */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="rounded-2xl bg-white p-5 space-y-6 border border-gray-200">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-8 w-full rounded-lg bg-gray-200" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-9 w-full rounded-xl bg-gray-200" />
            </div>
          </div>
        </aside>

        {/* Products Section Skeleton */}
        <section className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between h-10 rounded-xl bg-gray-200" />

          {/* Product Grid */}
          <ProductGridSkeleton />
        </section>
      </div>
    </div>
  );
}
