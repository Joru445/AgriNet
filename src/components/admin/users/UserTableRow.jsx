import RoleBadge from "../../common/RoleBadge";
import UserIdentity from "../../common/UserIdentity";

export default function UserTableRow({
  user,
  currentUserId,
  farmer,
  onView,
  onEdit,
}) {
  const isSuspended = user.status === "suspended";
  const isAdmin = user.role === "admin";

  const identityUser =
    user.role === "farmer"
      ? {
          ...user,
          verified: farmer?.verified === true,
        }
      : user;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors">
      {/* User */}
      <td className="px-5 py-4">
        <UserIdentity
          user={identityUser}
          currentUserId={currentUserId}
          size="md"
        />
      </td>

      {/* Email */}
      <td className="px-5 py-4">
        <span className="text-sm font-medium text-gray-700">
          {user.email || "No email"}
        </span>
      </td>

      {/* Role */}
      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>

      {/* Account Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            isSuspended
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isSuspended ? "bg-red-500" : "bg-emerald-500"
            }`}
          />

          {isSuspended ? "Suspended" : "Active"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => !isAdmin && onView(user)}
            disabled={isAdmin}
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border shadow-2xs transition-all ${
              isAdmin
                ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50"
                : "border-gray-200 bg-white text-gray-600 hover:bg-[#D8F3DC]/40 hover:text-[#2D6A4F] hover:border-[#2D6A4F]/30 cursor-pointer"
            }`}
            title={isAdmin ? "Admin account details disabled" : "View user details"}
          >
            <i className="ri-eye-line text-sm font-semibold" />
          </button>

          <button
            type="button"
            onClick={() => !isAdmin && onEdit(user)}
            disabled={isAdmin}
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border shadow-2xs transition-all ${
              isAdmin
                ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50"
                : "border-gray-200 bg-white text-gray-600 hover:bg-[#D8F3DC]/40 hover:text-[#2D6A4F] hover:border-[#2D6A4F]/30 cursor-pointer"
            }`}
            title={isAdmin ? "Admin account editing disabled" : "Edit user"}
          >
            <i className="ri-edit-line text-sm font-semibold" />
          </button>
        </div>
      </td>
    </tr>
  );
}
