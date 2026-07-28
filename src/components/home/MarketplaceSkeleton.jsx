export default function MarketplaceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Search */}
      <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse" />

      {/* Categories */}
      <div className="mt-5 flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-24 rounded-full bg-gray-200 animate-pulse"
          />
        ))}
      </div>

      <div className="mt-8 flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-2xl border bg-white p-5 space-y-5 animate-pulse">
            <div className="h-5 w-32 rounded bg-gray-200" />

            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-4/5 rounded bg-gray-200" />
              <div className="h-4 w-3/5 rounded bg-gray-200" />
            </div>

            <div className="h-10 w-full rounded-lg bg-gray-200" />
          </div>
        </aside>

        {/* Products */}
        <section className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />

            <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border bg-white animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />

                <div className="space-y-4 p-4">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div className="h-4 w-16 rounded bg-gray-200" />
                    <div className="h-4 w-16 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
