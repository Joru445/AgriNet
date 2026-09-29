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
            className="text-xs h-8 px-2.5 sm:px-3 font-semibold shrink-0"
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
              <Button variant="primary" size="sm" icon="ri-user-add-line" onClick={() => setShowAssign(true)} className="text-xs h-8 px-3 font-semibold">
                {t("adminGroups.managers.assignManager")}
              </Button>
            }
          />
        ) : (
          <div>
            {managers.map((mgr) => (
              <div
                key={mgr.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-(--agri-border-subtle) p-3.5 sm:px-5 sm:py-4 last:border-b-0 hover:bg-(--agri-hover)/30 transition-colors"
              >
                {/* Manager identity */}
                <div className="flex-1 min-w-0">
                  <UserRow userId={mgr.userId} size="sm" />
                </div>

                {/* Permissions tags */}
                <div className="w-full sm:w-auto sm:flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md">
                  <div className="flex flex-wrap gap-1 items-center">
                    {(mgr.permissions || []).map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) px-2 py-0.5 text-[10px] font-bold text-[#2D6A4F] dark:text-(--agri-brand) border border-[#2D6A4F]/10 dark:border-emerald-500/20 shadow-2xs"
                      >
                        {permissionLabels?.[perm] || perm}
                      </span>
                    ))}
                    {(!mgr.permissions || mgr.permissions.length === 0) && (
                      <span className="text-xs text-(--agri-text-muted) italic">
                        {t("adminGroups.managers.noPermissions") || "No permissions"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-0 border-(--agri-border-subtle)/60 sm:justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="ri-shield-keyhole-line"
                    onClick={() => setEditTarget(mgr)}
                    className="w-full sm:w-auto justify-center text-xs h-8 px-3 font-semibold"
                  >
                    {t("adminGroups.managers.editPermissions")}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon="ri-user-unfollow-line"
                    onClick={() => setRemoveTarget(mgr)}
                    disabled={actionLoading}
                    className="w-full sm:w-auto justify-center text-xs h-8 px-3 font-semibold"
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
