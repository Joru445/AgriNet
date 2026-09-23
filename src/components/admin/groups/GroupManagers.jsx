import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../ui/DashboardSection";
import SkeletonBox from "../../ui/SkeletonBox";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import UserRow from "./UserRow";

import { useLanguage } from "../../../context/LanguageContext";
import {
  getGroupManagers,
  removeGroupManager,
} from "../../../services/group.service";
import AssignManagerModal from "./AssignManagerModal";
import ManagerPermissionsModal from "./ManagerPermissionsModal";
import { showToast } from "../../../utils/toast";

export default function GroupManagers({ groupId }) {
  const { t } = useLanguage();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  const loadManagers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGroupManagers(groupId);
      setManagers(data);
    } catch (err) {
      console.error("Failed to load managers:", err);
      showToast.error(err?.message || "Failed to load managers.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  async function handleRemove() {
    if (!removeTarget) return;
    try {
      setActionLoading(true);
      await removeGroupManager(groupId, removeTarget.userId);
      showToast.success(t("adminGroups.managers.removedSuccess"));
      setRemoveTarget(null);
      await loadManagers();
    } catch (err) {
      showToast.error(err?.message || "Failed to remove manager.");
    } finally {
      setActionLoading(false);
    }
  }

  const permissionLabels = t("adminGroups.permissionLabels");

  return (
    <>
      <DashboardSection
        title={t("adminGroups.managers.title")}
        icon="ri-shield-user-line"
        compact
        fill
        headerAction={
          <Button
            variant="primary"
            size="sm"
            icon="ri-user-add-line"
            onClick={() => setShowAssign(true)}
          >
            {t("adminGroups.managers.assignManager")}
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2].map((i) => (
              <SkeletonBox key={i} className="h-16" />
            ))}
          </div>
        ) : managers.length === 0 ? (
          <EmptyState
            icon="ri-shield-user-line"
            title={t("adminGroups.managers.noManagers")}
            description={t("adminGroups.managers.noManagersDesc")}
            action={
              <Button variant="primary" size="sm" icon="ri-user-add-line" onClick={() => setShowAssign(true)}>
                {t("adminGroups.managers.assignManager")}
              </Button>
            }
          />
        ) : (
          <div>
            {managers.map((mgr) => (
              <div
                key={mgr.id}
                className="flex items-center gap-3 border-b border-(--agri-border-subtle) px-4 py-3 last:border-b-0"
              >
                <UserRow userId={mgr.userId} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1">
                    {(mgr.permissions || []).map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) px-2 py-0.5 text-[10px] font-bold text-[#2D6A4F] dark:text-(--agri-brand)"
                      >
                        {permissionLabels?.[perm] || perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditTarget(mgr)}
                  >
                    {t("adminGroups.managers.editPermissions")}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRemoveTarget(mgr)}
                    disabled={actionLoading}
                  >
                    {t("adminGroups.managers.removeManager")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      <AssignManagerModal
        groupId={groupId}
        open={showAssign}
        onClose={() => setShowAssign(false)}
        onAssigned={loadManagers}
        existingManagerIds={managers.map((m) => m.userId)}
      />

      <ManagerPermissionsModal
        groupId={groupId}
        manager={editTarget}
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onUpdated={loadManagers}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title={t("adminGroups.managers.removeConfirm")}
        description={t("adminGroups.managers.removeConfirmDesc")}
        confirmLabel={t("common.remove")}
        danger
        loading={actionLoading}
      />
    </>
  );
}
