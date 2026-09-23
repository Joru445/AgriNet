import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../ui/DashboardSection";
import SkeletonBox from "../../ui/SkeletonBox";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import UserRow from "./UserRow";

import { useLanguage } from "../../../context/LanguageContext";
import { getGroupApplications, approveApplication, rejectApplication } from "../../../services/group.service";
import { showToast } from "../../../utils/toast";

export default function GroupApplications({ groupId, onCountsUpdate, canApprove = true, canReject = true }) {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGroupApplications(groupId);
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications:", err);
      showToast.error(err?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function handleApprove(userId) {
    try {
      setActionLoading(true);
      await approveApplication(groupId, userId);
      showToast.success(t("adminGroups.applications.approvedSuccess"));
      await loadApplications();
      onCountsUpdate?.();
    } catch (err) {
      showToast.error(err?.message || "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    try {
      setActionLoading(true);
      await rejectApplication(groupId, rejectTarget.userId);
      showToast.success(t("adminGroups.applications.rejectedSuccess"));
      setRejectTarget(null);
      await loadApplications();
      onCountsUpdate?.();
    } catch (err) {
      showToast.error(err?.message || "Failed to reject.");
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
        title={t("adminGroups.applications.title")}
        icon="ri-file-list-3-line"
        compact
        fill
      >
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBox key={i} className="h-16" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon="ri-file-list-3-line"
            title={t("adminGroups.applications.noApplications")}
            description={t("adminGroups.applications.noApplicationsDesc")}
          />
        ) : (
          <div>
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 border-b border-(--agri-border-subtle) px-4 py-3 last:border-b-0"
              >
                <UserRow userId={app.userId} size="sm" />
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-(--agri-text-muted)">
                    {t("adminGroups.applications.appliedAt")} {formatDate(app.appliedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {canReject && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectTarget(app)}
                      disabled={actionLoading}
                    >
                      {t("common.reject")}
                    </Button>
                  )}
                  {canApprove && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(app.userId)}
                      disabled={actionLoading}
                      loading={actionLoading}
                    >
                      {t("common.approve")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        title={t("adminGroups.applications.rejectConfirm")}
        description={t("adminGroups.applications.rejectConfirmDesc")}
        confirmLabel={t("common.reject")}
        danger
        loading={actionLoading}
      />
    </>
  );
}
