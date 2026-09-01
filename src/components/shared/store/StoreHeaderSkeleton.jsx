export default function StoreHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 sm:h-72 md:h-80 lg:h-[380px] bg-gray-200 sm:rounded-b-2xl" />
      <div className="px-4 sm:px-6 pb-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 shadow-md shrink-0" />
            <div className="space-y-2 pb-2">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl shrink-0" />
        </div>
        <div className="mt-6 space-y-2 max-w-xl">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
