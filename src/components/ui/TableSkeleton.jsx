export default function TableSkeleton({ rows = 6, columns = 5, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white ${className}`}>
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-6 border-b border-gray-100 px-5 py-5"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`bg-gray-200 rounded ${
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
                    <div className="h-3 w-32 rounded bg-gray-200" />
                    <div className="h-2 w-20 rounded bg-gray-100" />
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
