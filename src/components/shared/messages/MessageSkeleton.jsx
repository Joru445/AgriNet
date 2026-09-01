export default function MessagesSkeleton() {
  return (
    <main className="flex-1 p-0 h-full flex flex-col overflow-hidden animate-pulse">
      <div className="bg-[var(--agri-card)] border border-[var(--agri-border)] h-full flex overflow-hidden">
        <aside className="w-full lg:w-80 md:w-64 p-4 space-y-4">
          <div className="h-8 w-32 bg-[var(--agri-hover)] rounded" />

          <div className="h-11 bg-[var(--agri-hover)] rounded-xl" />

          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--agri-hover)]" />

              <div className="flex-1">
                <div className="h-4 w-28 bg-[var(--agri-hover)] rounded mb-2" />
                <div className="h-3 w-40 bg-[var(--agri-hover)]/60 rounded" />
              </div>
            </div>
          ))}
        </aside>

        <section className="hidden flex-1 md:flex flex-col">
          <div className="h-18 bg-[var(--agri-hover)]" />

          <div className="flex-1 p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div className="w-52 h-14 rounded-2xl bg-[var(--agri-hover)]" />
              </div>
            ))}
          </div>

          <div className="h-20 border-t bg-[var(--agri-hover)]" />
        </section>
      </div>
    </main>
  );
}
