import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../ui/DashboardSection";
import SkeletonBox from "../../ui/SkeletonBox";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import UserRow from "./UserRow";

import { useLanguage } from "../../../context/LanguageContext";
import {
  getGroupMembers,
  subscribeToGroupMembers,
  removeGroupMember,
} from "../../../services/group.service";
import { showToast } from "../../../utils/toast";

export default function GroupMembers({ groupId, onCountsUpdate, canRemove = true }) {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const loadMembers = useCallback(async () => {
    try {
      const data = await getGroupMembers(groupId);
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    loadMembers();

    const unsubscribe = subscribeToGroupMembers(groupId, (data) => {
      setMembers(data);
      setLoading(false);
      onCountsUpdate?.();
    });

    return () => unsubscribe();
  }, [groupId, loadMembers, onCountsUpdate]);

  async function handleRemove() {
    if (!removeTarget) return;
    try {
      setActionLoading(true);
      await removeGroupMember(groupId, removeTarget.userId);
      showToast.success(t("adminGroups.members.removedSuccess"));
      setRemoveTarget(null);
      await loadMembers();
      onCountsUpdate?.();
    } catch (err) {
      showToast.error(err?.message || "Failed to remove member.");
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(ts) {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <>
      <DashboardSection
        title={t("adminGroups.members.title")}
        icon="ri-user-line"
        compact
        fill
      >
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBox key={i} className="h-16" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon="ri-user-line"
            title={t("adminGroups.members.noMembers")}
            description={t("adminGroups.members.noMembersDesc")}
          />
        ) : (
          <div>
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-(--agri-border-subtle) p-3 sm:px-5 sm:py-3.5 last:border-b-0 hover:bg-(--agri-hover)/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <UserRow userId={member.userId} size="sm" />
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-0 border-(--agri-border-subtle)/50 shrink-0">
                  <p className="text-[11px] sm:text-xs text-(--agri-text-muted)">
                    {t("adminGroups.members.joinedAt")} {formatDate(member.appliedAt)}
                  </p>
                  {canRemove && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon="ri-user-unfollow-line"
                      onClick={() => setRemoveTarget(member)}
                      disabled={actionLoading}
                      className="text-xs h-8 px-2.5 sm:px-3"
                    >
                      {t("adminGroups.members.removeConfirm")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title={t("adminGroups.members.removeConfirm")}
        description={t("adminGroups.members.removeConfirmDesc")}
        confirmLabel={t("common.remove")}
        danger
        loading={actionLoading}
      />
    </>
  );
}
