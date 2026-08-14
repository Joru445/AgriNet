import RoleBadge from "../common/RoleBadge";
import UserIdentity from "../common/UserIdentity";

export default function RecentUsers({ users = [] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900">Recent Users</h2>

        <p className="mt-1 text-sm text-gray-500">Recently registered users</p>
      </div>

      {users.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {users.map((user) => {

            return (
              <div key={user.id} className="flex items-center justify-between gap-3 p-4">
                <UserIdentity user={user} size="lg" />

                <RoleBadge role={user.role} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
