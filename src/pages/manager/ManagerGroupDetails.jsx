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
import TabButton from "../../components/ui/TabButton";

import GroupOverview from "../../components/admin/groups/GroupOverview";
import GroupApplications from "../../components/admin/groups/GroupApplications";
import GroupMembers from "../../components/admin/groups/GroupMembers";
import GroupSettings from "../../components/admin/groups/GroupSettings";

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
  const [tab, setTab] = useState("overview");
  const [counts, setCounts] = useState({ members: 0, applications: 0 });

  const permissions = useMemo(() => {
    if (isAdmin) {
      return Object.values(GROUP_PERMISSIONS);
    }
    return manager?.permissions ?? [];
  }, [isAdmin, manager?.permissions]);

  const availableTabs = useMemo(() => {
    const tabs = ["overview"];
    if (isAdmin || permissions.includes(GROUP_PERMISSIONS.APPLICATIONS_VIEW)) tabs.push("applications");
    if (isAdmin || permissions.includes(GROUP_PERMISSIONS.MEMBERS_VIEW)) tabs.push("members");
    if (isAdmin || permissions.includes(GROUP_PERMISSIONS.GROUP_EDIT)) tabs.push("settings");
    return tabs;
  }, [isAdmin, permissions]);

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

  // Auto-select first available tab if current tab is not available
  useEffect(() => {
    if (manager && !availableTabs.includes(tab)) {
      setTab(availableTabs[0] || "overview");
    }
  }, [manager, tab, availableTabs]);

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

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-(--agri-text)">
            {group?.name || "..."}
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto rounded-2xl bg-(--agri-hover)/70 p-1 sm:p-1.5 border border-(--agri-border-subtle) shadow-xs scrollbar-none touch-pan-x">
          {availableTabs.map((tabKey) => (
            <TabButton
              key={tabKey}
              active={tab === tabKey}
              onClick={() => setTab(tabKey)}
              label={t(`managerGroups.tabs.${tabKey}`)}
              count={tabKey === "applications" ? counts.applications : undefined}
              className="sm:flex-1 justify-center shrink-0"
            />
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <GroupOverview group={group} counts={counts} />
        )}
        {tab === "applications" && (
          <GroupApplications
            groupId={groupId}
            onCountsUpdate={loadCounts}
            canApprove={isAdmin || permissions.includes(GROUP_PERMISSIONS.APPLICATIONS_APPROVE)}
            canReject={isAdmin || permissions.includes(GROUP_PERMISSIONS.APPLICATIONS_REJECT)}
          />
        )}
        {tab === "members" && (
          <GroupMembers
            groupId={groupId}
            onCountsUpdate={loadCounts}
            canRemove={isAdmin || permissions.includes(GROUP_PERMISSIONS.MEMBERS_REMOVE)}
          />
        )}
        {tab === "settings" && (
          <GroupSettings group={group} onUpdated={handleGroupUpdated} />
        )}
      </div>
    </div>
  );
}
