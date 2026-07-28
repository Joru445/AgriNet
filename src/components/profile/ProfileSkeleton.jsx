export default function ProfileSkeleton() {
  return (
    <main className="flex-1 p-4 md:p-6 animate-pulse">
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        {/* Cover */}
        <div className="relative h-44 bg-gray-200">
          {/* Avatar */}
          <div className="absolute flex items-end gap-5 -bottom-14 left-8">
            <div className="w-28 h-28 bg-gray-300 border-4 border-white rounded-full" />

            <div className="pb-4 space-y-2">
              <div className="w-40 h-7 bg-gray-300 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Buttons */}
          <div className="absolute flex flex-col md:flex-row gap-3 top-6 right-6">
            <div className="w-24 h-10 bg-gray-300 rounded-lg" />
            <div className="w-24 h-10 bg-gray-300 rounded-lg" />
          </div>
        </div>

        <div className="h-20" />

        {/* Form */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="w-24 h-4 mb-2 bg-gray-200 rounded" />
                <div className="w-full h-11 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="w-20 h-4 mb-2 bg-gray-200 rounded" />
            <div className="w-full h-20 bg-gray-200 rounded-xl" />
          </div>

          <div className="mt-6">
            <div className="w-12 h-4 mb-2 bg-gray-200 rounded" />
            <div className="w-full h-32 bg-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Farmer Section */}
        <div className="px-8 py-8 border-t border-gray-200">
          <div className="w-44 h-6 mb-6 bg-gray-300 rounded" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="w-24 h-4 mb-2 bg-gray-200 rounded" />
              <div className="w-full h-11 bg-gray-200 rounded-xl" />
            </div>

            <div>
              <div className="w-20 h-4 mb-2 bg-gray-200 rounded" />
              <div className="w-32 h-6 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="mt-6">
            <div className="w-36 h-4 mb-2 bg-gray-200 rounded" />
            <div className="w-full h-28 bg-gray-200 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-5 mt-8 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="p-5 text-center border border-gray-200 rounded-2xl"
              >
                <div className="w-12 h-8 mx-auto bg-gray-300 rounded" />
                <div className="w-20 h-4 mx-auto mt-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
