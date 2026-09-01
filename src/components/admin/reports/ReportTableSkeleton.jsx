export default function ReportTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-gray-100 px-5 py-5"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-gray-200" />
              <div className="h-2 w-56 rounded bg-gray-100" />
            </div>

            <div className="h-3 w-28 rounded bg-gray-200" />

            <div className="h-3 w-20 rounded bg-gray-200" />

            <div className="h-6 w-20 rounded-full bg-gray-200" />

            <div className="h-8 w-8 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
