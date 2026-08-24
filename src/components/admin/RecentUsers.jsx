import RoleBadge from "../common/RoleBadge";
import UserIdentity from "../common/UserIdentity";

export default function RecentUsers({ users = [] }) {
  const displayedUsers = users.slice(0, 4);

  return (
    <section className="rounded-2xl border border-gray-200/90 bg-white shadow-lg shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Users</h2>

          <p className="mt-0.5 text-xs text-gray-500 font-medium">
            Recently registered users
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 shadow-2xs">
          <i className="ri-user-smile-line text-base text-[#2D6A4F]" />
        </div>
      </div>

      {displayedUsers.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {displayedUsers.map((user) => {
            return (
              <div
                key={user.id || user.uid}
                className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50/60 transition-colors"
              >
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
