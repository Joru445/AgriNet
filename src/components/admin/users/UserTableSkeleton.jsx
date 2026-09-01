export default function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)]">
      <div className="animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-[var(--agri-border-subtle)] px-5 py-5"
          >
            <div className="h-10 w-10 rounded-full bg-[var(--agri-hover)]" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-[var(--agri-hover)]" />

              <div className="h-2 w-20 rounded bg-[var(--agri-hover)]" />
            </div>

            <div className="h-3 w-32 rounded bg-[var(--agri-hover)]" />

            <div className="h-6 w-20 rounded-full bg-[var(--agri-hover)]" />

            <div className="h-6 w-16 rounded-full bg-[var(--agri-hover)]" />

            <div className="h-8 w-20 rounded bg-[var(--agri-hover)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
