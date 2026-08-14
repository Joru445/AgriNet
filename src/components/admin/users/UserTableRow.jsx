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

  const identityUser =
    user.role === "farmer"
      ? {
          ...user,
          verified: farmer?.verified === true,
        }
      : user;

  return (
    <tr className="border-b border-gray-100 last:border-0">
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
        <span className="text-sm text-gray-600">
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
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            isSuspended ? "text-red-600" : "text-green-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isSuspended ? "bg-red-500" : "bg-green-500"
            }`}
          />

          {isSuspended ? "Suspended" : "Active"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView(user)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            title="View user"
          >
            <i className="ri-eye-line" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            title="Edit user"
          >
            <i className="ri-edit-line" />
          </button>
        </div>
      </td>
    </tr>
  );
}
