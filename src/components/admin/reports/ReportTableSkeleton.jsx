import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the admin ReportTable
 * (src/components/admin/reports/ReportTable.jsx + ReportTableRow.jsx):
 * a 6-column table (Report, Reported By, Type, Status, Date & Time, Actions).
 */
export default function ReportTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--agri-border)] bg-[var(--agri-hover)]/90">
              {[0, 1, 2, 3, 4, 5].map((_, i) => (
                <th
                  key={i}
                  className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]"
                >
                  <SkeletonBox className="h-3 w-16 rounded" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-100 last:border-0"
              >
                {/* Report */}
                <td className="px-5 py-4">
                  <div className="min-w-0 space-y-2">
                    <SkeletonBox className="h-4 w-40 rounded" />
                    <SkeletonBox className="h-3 w-52 rounded" />
                  </div>
                </td>

                {/* Reported By */}
                <td className="px-5 py-4">
                  <div className="space-y-1.5">
                    <SkeletonBox className="h-3.5 w-28 rounded" />
                    <SkeletonBox className="h-3 w-20 rounded" />
                  </div>
                </td>

                {/* Type */}
                <td className="px-5 py-4">
                  <SkeletonBox className="h-6 w-16 rounded-lg" />
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <SkeletonBox className="h-6 w-20 rounded-full" />
                </td>

                {/* Date & Time */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <SkeletonBox className="h-3.5 w-32 rounded" />
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <SkeletonBox className="h-9 w-9 rounded-xl" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}