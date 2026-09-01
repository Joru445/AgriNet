export default function ReviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-[var(--agri-card)] rounded-2xl border border-[var(--agri-border)] p-5"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--agri-hover)]" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-40 bg-[var(--agri-hover)] rounded" />
              <div className="h-3 w-24 bg-[var(--agri-hover)] rounded" />
              <div className="h-4 w-full bg-[var(--agri-hover)] rounded" />
              <div className="h-4 w-5/6 bg-[var(--agri-hover)] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
