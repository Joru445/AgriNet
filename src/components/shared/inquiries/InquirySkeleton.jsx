export default function InquirySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Product
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Consumer
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Date
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse border-t border-gray-50">
                {/* Product */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />

                    <div className="space-y-2">
                      <div className="h-3 w-32 rounded bg-gray-200" />
                      <div className="h-2.5 w-16 rounded bg-gray-100" />
                    </div>
                  </div>
                </td>

                {/* Consumer */}
                <td className="px-5 py-3">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </td>

                {/* Date */}
                <td className="px-5 py-3">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </td>

                {/* Status */}
                <td className="px-5 py-3">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                </td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-8 rounded bg-gray-200" />
                    <div className="h-4 w-4 rounded bg-gray-200" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
