import { useMemo } from "react";

import UserTableRow from "./UserTableRow";

export default function UserTable({
  users,
  farmers = [],
  currentUserId,
  onView,
  onEdit,
}) {
  const farmerMap = useMemo(() => {
    return Object.fromEntries(farmers.map((farmer) => [farmer.uid, farmer]));
  }, [farmers]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-200">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                User
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Role
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <UserTableRow
                key={user.uid}
                user={user}
                currentUserId={currentUserId}
                farmer={farmerMap[user.uid]}
                onView={onView}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="px-6 py-12 text-center">
          <i className="ri-user-search-line text-4xl text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No users found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
