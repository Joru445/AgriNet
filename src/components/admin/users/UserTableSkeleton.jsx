import SkeletonBox from "../../common/SkeletonBox";

/**
 * Skeleton that mirrors the admin UserTable
 * (src/components/admin/users/UserTable.jsx + UserTableRow.jsx):
 * a 5-column table (User, Email, Role, Status, Actions).
 */
export default function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-lg shadow-black/5">
      <div className="overflow-x-auto max-md:scrollbar-none">
        <table className="w-full min-w-200">
          <thead>
            <tr className="border-b border-[var(--agri-border)] bg-[var(--agri-hover)]/80">
              {["", "", "", "", ""].map((_, i) => (
                <th
                  key={i}
                  className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]"
                >
                  <SkeletonBox className="h-3 w-16 rounded" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--agri-border-subtle)] last:border-0"
              >
                {/* User */}
                <td className="px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <SkeletonBox className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <SkeletonBox className="h-3.5 w-32 rounded" />
                      <SkeletonBox className="h-3 w-20 rounded" />
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-4">
                  <SkeletonBox className="h-3.5 w-44 rounded" />
                </td>

                {/* Role */}
                <td className="px-5 py-4">
                  <SkeletonBox className="h-6 w-16 rounded-full" />
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <SkeletonBox className="h-6 w-20 rounded-full" />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <SkeletonBox className="h-8.5 w-8.5 rounded-xl" />
                    <SkeletonBox className="h-8.5 w-8.5 rounded-xl" />
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