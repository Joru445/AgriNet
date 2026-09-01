export default function MarketplaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search */}
      <div className="h-12 sm:h-14 w-full rounded-2xl bg-[var(--agri-hover)]" />

      {/* Categories */}
      <div className="flex gap-2 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-9 w-28 shrink-0 rounded-2xl bg-[var(--agri-hover)]"
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 space-y-5">
            <div className="h-5 w-20 rounded bg-[var(--agri-hover)]" />

            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-[var(--agri-hover)]" />
              <div className="h-10 w-full rounded-xl bg-[var(--agri-hover)]" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-[var(--agri-hover)]" />
              <div className="h-10 w-full rounded-xl bg-[var(--agri-hover)]" />
              <div className="h-10 w-full rounded-xl bg-[var(--agri-hover)]" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-[var(--agri-hover)]" />
              <div className="h-3 w-full rounded-full bg-[var(--agri-hover)]" />
            </div>
          </div>
        </aside>

        {/* Products */}
        <section className="min-w-0 flex-1 space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="h-5 w-24 rounded bg-[var(--agri-hover)]" />

            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-xl bg-[var(--agri-hover)] lg:hidden" />
              <div className="h-9 w-28 rounded-xl bg-[var(--agri-hover)]" />
            </div>
          </div>

          <ProductGridSkeleton />

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="h-9 w-9 rounded-xl bg-[var(--agri-hover)]" />
            <div className="h-9 w-9 rounded-xl bg-[var(--agri-hover)]" />
            <div className="h-9 w-9 rounded-xl bg-[var(--agri-hover)]" />
            <div className="h-9 w-9 rounded-xl bg-[var(--agri-hover)]" />
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
          className="overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)]"
        >
          {/* Image */}
          <div className="aspect-square bg-[var(--agri-hover)]" />

          {/* Content */}
          <div className="p-3 space-y-3">
            <div className="h-4 w-3/4 rounded bg-[var(--agri-hover)]" />

            <div className="h-3 w-1/2 rounded bg-[var(--agri-hover)]" />

            <div className="flex items-center justify-between">
              <div className="h-5 w-20 rounded bg-[var(--agri-hover)]" />
              <div className="h-4 w-12 rounded bg-[var(--agri-hover)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
