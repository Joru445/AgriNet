function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />

      <div className="p-4">
        <div className="h-5 w-3/4 rounded bg-gray-200" />

        <div className="h-4 w-1/3 rounded bg-gray-100 mt-3" />

        <div className="flex justify-between items-center mt-6">
          <div>
            <div className="h-5 w-20 rounded bg-gray-200" />

            <div className="h-4 w-16 rounded bg-gray-100 mt-2" />
          </div>

          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
