import { useEffect, useState } from "react";

import ResponsiveModal from "../../ui/ResponsiveModal";
import Button from "../../ui/Button";

import { useLanguage } from "../../../context/LanguageContext";
import { GROUP_PERMISSION_VALUES } from "../../../constants/groupPermissions";
import { updateManagerPermissions } from "../../../services/group.service";
import { showToast } from "../../../utils/toast";

export default function ManagerPermissionsModal({
  groupId,
  manager,
  open,
  onClose,
  onUpdated,
}) {
  const { t } = useLanguage();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manager) {
      setPermissions([...(manager.permissions || [])]);
    }
  }, [manager]);

  function togglePermission(perm) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  }

  async function handleSave() {
    if (!manager) return;
    try {
      setLoading(true);
      await updateManagerPermissions(groupId, manager.userId, permissions);
      showToast.success(t("adminGroups.managers.permissionsUpdated"));
      onUpdated();
      onClose();
    } catch (err) {
      showToast.error(err?.message || "Failed to update permissions.");
    } finally {
      setLoading(false);
    }
  }

  const permissionLabels = t("adminGroups.permissionLabels");

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={t("adminGroups.managers.editPermissions")}
      maxWidth="max-w-md"
    >
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("adminGroups.managers.permissions")}
          </label>
          <div className="space-y-1.5">
            {GROUP_PERMISSION_VALUES.map((perm) => (
              <label
                key={perm}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-(--agri-hover)/60"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="h-4 w-4 rounded border-(--agri-border-subtle) text-[#2D6A4F] focus:ring-[#2D6A4F]/20"
                />
                <span className="text-sm text-(--agri-text)">
                  {permissionLabels?.[perm] || perm}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-(--agri-border-subtle)">
          <Button variant="cancel" size="sm" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          >
            {t("adminGroups.settings.saveChanges")}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
