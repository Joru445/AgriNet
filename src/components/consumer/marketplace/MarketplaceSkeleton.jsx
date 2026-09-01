export default function MarketplaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search */}
      <div className="h-12 sm:h-14 w-full rounded-2xl bg-gray-200" />

      {/* Categories */}
      <div className="flex gap-2 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-9 w-28 shrink-0 rounded-2xl bg-gray-200"
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
            <div className="h-5 w-20 rounded bg-gray-200" />

            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-200" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-200" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-3 w-full rounded-full bg-gray-200" />
            </div>
          </div>
        </aside>

        {/* Products */}
        <section className="min-w-0 flex-1 space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="h-5 w-24 rounded bg-gray-200" />

            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-xl bg-gray-200 lg:hidden" />
              <div className="h-9 w-28 rounded-xl bg-gray-200" />
            </div>
          </div>

          <ProductGridSkeleton />

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="h-9 w-9 rounded-xl bg-gray-200" />
            <div className="h-9 w-9 rounded-xl bg-gray-200" />
            <div className="h-9 w-9 rounded-xl bg-gray-200" />
            <div className="h-9 w-9 rounded-xl bg-gray-200" />
          </div>
        </section>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        xl:grid-cols-4
        gap-3
        sm:gap-4
      "
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          {/* Image */}
          <div className="aspect-square bg-gray-200" />

          {/* Content */}
          <div className="p-3 space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200" />

            <div className="h-3 w-1/2 rounded bg-gray-200" />

            <div className="flex items-center justify-between">
              <div className="h-5 w-20 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
