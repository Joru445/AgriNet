import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../ui/DashboardSection";
import SkeletonBox from "../../ui/SkeletonBox";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import UserRow from "./UserRow";

import { useLanguage } from "../../../context/LanguageContext";
import { getGroupMembers, removeGroupMember } from "../../../services/group.service";
import { showToast } from "../../../utils/toast";

export default function GroupMembers({ groupId, onCountsUpdate, canRemove = true }) {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGroupMembers(groupId);
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
      showToast.error(err?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

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
                className="flex items-center gap-3 border-b border-(--agri-border-subtle) px-4 py-3 last:border-b-0"
              >
                <UserRow userId={member.userId} size="sm" />
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-(--agri-text-muted)">
                    {t("adminGroups.members.joinedAt")} {formatDate(member.appliedAt)}
                  </p>
                </div>
                {canRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRemoveTarget(member)}
                    disabled={actionLoading}
                  >
                    {t("adminGroups.members.removeConfirm")}
                  </Button>
                )}
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
