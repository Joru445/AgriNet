import GroupWorkspace from "../../components/admin/groups/GroupWorkspace";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";

import { useLanguage } from "../../context/LanguageContext";
import {
  getGroup,
  getGroupMemberCount,
  getGroupApplications,
  subscribeToGroupApplications,
  subscribeToGroupMembers,
} from "../../services/group.service";


export default function AdminGroupDetails() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ members: 0, applications: 0 });

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroup(groupId);
      setGroup(data);
    } catch (err) {
      console.error("Failed to load group:", err);
      setError(err?.message || "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const loadCounts = useCallback(async () => {
    try {
      const [memberCount, applications] = await Promise.all([
        getGroupMemberCount(groupId),
        getGroupApplications(groupId),
      ]);
      setCounts({ members: memberCount, applications: applications.length });
    } catch {
      // Counts are non-critical, silently ignore
    }
  }, [groupId]);

  useEffect(() => {
    loadGroup();
    loadCounts();

    const unsubApps = subscribeToGroupApplications(groupId, (apps) => {
      setCounts((prev) => ({ ...prev, applications: apps.length }));
    });

    const unsubMembers = subscribeToGroupMembers(groupId, (members) => {
      setCounts((prev) => ({ ...prev, members: members.length }));
    });

    return () => {
      unsubApps();
      unsubMembers();
    };
  }, [groupId, loadGroup, loadCounts]);

  const handleGroupUpdated = useCallback(() => {
    loadGroup();
    loadCounts();
  }, [loadGroup, loadCounts]);

  if (loading && !group) {
    return (
      <div className="min-h-full p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <SkeletonBox className="mb-4 h-8 w-48" />
          <SkeletonBox className="mb-4 h-10" />
          <SkeletonBox className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <ErrorState
            className="mt-2"
            title={t("admin.failedToLoad")}
            message={error}
            onRetry={loadGroup}
          />
        </div>
      </div>
    );
  }

  return <GroupWorkspace group={group} groupId={groupId} counts={counts} isAdmin
    onCountsUpdate={loadCounts} onUpdated={handleGroupUpdated} />;
}
