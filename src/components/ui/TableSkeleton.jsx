export default function TableSkeleton({ rows = 6, columns = 5, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] ${className}`}>
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-6 border-b border-[var(--agri-border-subtle)] px-5 py-5"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`bg-[var(--agri-hover)] rounded ${
                  colIndex === 0
                    ? "flex-1 space-y-2"
                    : colIndex === columns - 1
                      ? "h-8 w-20"
                      : colIndex === 1
                        ? "h-6 w-20 rounded-full"
                        : "h-3 w-28"
                }`}
              >
                {colIndex === 0 && (
                  <>
                    <div className="h-3 w-32 rounded bg-[var(--agri-hover)]" />
                    <div className="h-2 w-20 rounded bg-[var(--agri-hover)]" />
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
