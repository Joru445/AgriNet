export default function ReviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white rounded-2xl border border-gray-200 p-5"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
