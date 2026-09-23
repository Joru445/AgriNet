import RoleBadge from "../../ui/RoleBadge";
import UserIdentity from "../../ui/UserIdentity";
import { useLanguage } from "../../../context/LanguageContext";

export default function UserTableRow({
  user,
  currentUserId,
  farmer,
  onView,
  onEdit,
}) {
  const { t } = useLanguage();
  const isSuspended = user.status === "suspended";
  const isAdmin = user.role === "admin";

  const identityUser =
    user.role === "farmer"
      ? {
          ...user,
          verificationStatus: farmer?.verificationStatus || (farmer?.verified === true ? "approved" : "not_applied"),
          verified: farmer?.verificationStatus === "approved" || farmer?.verified === true,
        }
      : user;

  return (
    <tr className="border-b border-(--agri-border-subtle) last:border-0 hover:bg-(--agri-hover)/50 transition-colors">
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
        <span className="text-sm font-medium text-(--agri-text-secondary)">
          {user.email || t("adminUser.noEmail")}
        </span>
      </td>

      {/* Role */}
      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>

      {/* Account Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
            isSuspended
              ? "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/25"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isSuspended ? "bg-red-500" : "bg-emerald-500"
            }`}
          />

          {isSuspended ? t("adminUser.suspended") : t("adminUser.active")}
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
                ? "border-(--agri-border-subtle) bg-(--agri-hover)/50 text-(--agri-text-muted) cursor-not-allowed opacity-50"
                : "border-(--agri-border-subtle) bg-(--agri-card) text-(--agri-text-secondary) hover:bg-[#D8F3DC] dark:hover:bg-(--agri-brand-bg)/40 hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) hover:border-[#2D6A4F]/30 cursor-pointer"
            }`}
            title={isAdmin ? t("adminUser.adminDetailsDisabled") : t("adminUser.viewDetails")}
          >
            <i className="ri-eye-line text-sm font-semibold" />
          </button>

          <button
            type="button"
            onClick={() => !isAdmin && onEdit(user)}
            disabled={isAdmin}
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border shadow-2xs transition-all ${
              isAdmin
                ? "border-(--agri-border-subtle) bg-(--agri-hover)/50 text-(--agri-text-muted) cursor-not-allowed opacity-50"
                : "border-(--agri-border-subtle) bg-(--agri-card) text-(--agri-text-secondary) hover:bg-[#D8F3DC] dark:hover:bg-(--agri-brand-bg)/40 hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) hover:border-[#2D6A4F]/30 cursor-pointer"
            }`}
            title={isAdmin ? t("adminUser.adminEditDisabled") : t("adminUser.editUser")}
          >
            <i className="ri-edit-line text-sm font-semibold" />
          </button>
        </div>
      </td>
    </tr>
  );
}
