import GroupWorkspace from "../../components/admin/groups/GroupWorkspace";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getGroup,
  getGroupManager,
  getGroupMemberCount,
  getGroupApplications,
  subscribeToGroupApplications,
  subscribeToGroupMembers,
} from "../../services/group.service";
import { GROUP_PERMISSIONS } from "../../constants/groupPermissions";

import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";


export default function ManagerGroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const isAdmin = user?.role === "admin" || profile?.role === "admin";

  const [group, setGroup] = useState(null);
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ members: 0, applications: 0 });

  const permissions = useMemo(() => {
    if (isAdmin) {
      return Object.values(GROUP_PERMISSIONS);
    }
    return manager?.permissions ?? [];
  }, [isAdmin, manager?.permissions]);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [groupData, managerData] = await Promise.all([
        getGroup(groupId),
        getGroupManager(groupId, user?.uid).catch(() => null),
      ]);

      if (!groupData) {
        setError(t("managerGroups.loadError"));
        return;
      }

      if (!isAdmin && (!managerData || !managerData.active)) {
        setError(t("managerGroups.unauthorized"));
        return;
      }

      setGroup(groupData);
      setManager(managerData || { active: true, permissions: Object.values(GROUP_PERMISSIONS) });
    } catch (err) {
      setError(err?.message || t("managerGroups.loadError"));
    } finally {
      setLoading(false);
    }
  }, [groupId, user?.uid, isAdmin, t]);

  const loadCounts = useCallback(async () => {
    try {
      const [memberCount, applications] = await Promise.all([
        getGroupMemberCount(groupId),
        getGroupApplications(groupId),
      ]);
      setCounts({ members: memberCount, applications: applications.length });
    } catch {
      // Counts are non-critical
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
            message={error}
            onRetry={() => navigate("/manage/groups")}
            retryLabel={t("managerGroups.title")}
          />
        </div>
      </div>
    );
  }

  return <GroupWorkspace group={group} groupId={groupId} counts={counts}
    isAdmin={isAdmin} permissions={permissions} onCountsUpdate={loadCounts} onUpdated={handleGroupUpdated} />;
}
