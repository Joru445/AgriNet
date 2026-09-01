export default function ProductDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Gallery */}
        <div>
          <div className="aspect-square w-full rounded-3xl bg-[var(--agri-hover)]" />

          <div className="grid grid-cols-5 gap-3 mt-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl bg-[var(--agri-hover)]"
              />
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-6">
          {/* Product Info */}
          <section>
            <div className="h-7 w-24 rounded-full bg-[var(--agri-hover)] mb-4" />

            <div className="h-10 w-3/4 rounded bg-[var(--agri-hover)] mb-4" />

            <div className="h-5 w-40 rounded bg-[var(--agri-hover)] mb-6" />

            <div className="h-10 w-36 rounded bg-[var(--agri-hover)] mb-6" />

            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-full bg-[var(--agri-hover)]" />
              <div className="h-8 w-20 rounded-full bg-[var(--agri-hover)]" />
            </div>
          </section>

          {/* Seller */}
          <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[var(--agri-hover)]" />

              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 rounded bg-[var(--agri-hover)]" />
                <div className="h-4 w-28 rounded bg-[var(--agri-hover)]" />
                <div className="h-4 w-20 rounded bg-[var(--agri-hover)]" />
              </div>

              <div className="h-10 w-28 rounded-xl bg-[var(--agri-hover)]" />
            </div>
          </section>

          {/* Description */}
          <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5">
            <div className="h-6 w-40 rounded bg-[var(--agri-hover)] mb-4" />

            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-[var(--agri-hover)]" />
              <div className="h-4 w-full rounded bg-[var(--agri-hover)]" />
              <div className="h-4 w-5/6 rounded bg-[var(--agri-hover)]" />
              <div className="h-4 w-2/3 rounded bg-[var(--agri-hover)]" />
            </div>
          </section>

          {/* Button */}
          <div className="h-14 rounded-2xl bg-[var(--agri-hover)]" />
        </div>
      </div>
    </div>
  );
}
