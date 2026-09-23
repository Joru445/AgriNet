import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getGroup,
  getGroupManager,
  getGroupMemberCount,
  getGroupApplications,
} from "../../services/group.service";
import { GROUP_PERMISSIONS } from "../../constants/groupPermissions";

import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import TabButton from "../../components/ui/TabButton";
import BackButton from "../../components/ui/BackButton";

import GroupOverview from "../../components/admin/groups/GroupOverview";
import GroupApplications from "../../components/admin/groups/GroupApplications";
import GroupMembers from "../../components/admin/groups/GroupMembers";
import GroupSettings from "../../components/admin/groups/GroupSettings";

export default function ManagerGroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [counts, setCounts] = useState({ members: 0, applications: 0 });

  const permissions = useMemo(() => manager?.permissions ?? [], [manager?.permissions]);

  const availableTabs = useMemo(() => {
    const tabs = ["overview"];
    if (permissions.includes(GROUP_PERMISSIONS.APPLICATIONS_VIEW)) tabs.push("applications");
    if (permissions.includes(GROUP_PERMISSIONS.MEMBERS_VIEW)) tabs.push("members");
    if (permissions.includes(GROUP_PERMISSIONS.GROUP_EDIT)) tabs.push("settings");
    return tabs;
  }, [permissions]);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [groupData, managerData] = await Promise.all([
        getGroup(groupId),
        getGroupManager(groupId, user.uid),
      ]);

      if (!groupData) {
        setError(t("managerGroups.loadError"));
        return;
      }

      if (!managerData || !managerData.active) {
        setError(t("managerGroups.unauthorized"));
        return;
      }

      setGroup(groupData);
      setManager(managerData);
    } catch (err) {
      setError(err?.message || t("managerGroups.loadError"));
    } finally {
      setLoading(false);
    }
  }, [groupId, user?.uid, t]);

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
  }, [loadGroup, loadCounts]);

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
          <BackButton />
          <ErrorState
            className="mt-4"
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
        <BackButton />

        {/* Header */}
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-(--agri-text)">
            {group?.name || "..."}
          </h1>
          {group?.description && (
            <p className="mt-1 text-sm text-(--agri-text-muted)">
              {group.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-lg bg-(--agri-hover) p-0.5 scrollbar-none">
          {availableTabs.map((tabKey) => (
            <TabButton
              key={tabKey}
              active={tab === tabKey}
              onClick={() => setTab(tabKey)}
              label={t(`managerGroups.tabs.${tabKey}`)}
              count={tabKey === "applications" ? counts.applications : undefined}
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
            canApprove={permissions.includes(GROUP_PERMISSIONS.APPLICATIONS_APPROVE)}
            canReject={permissions.includes(GROUP_PERMISSIONS.APPLICATIONS_REJECT)}
          />
        )}
        {tab === "members" && (
          <GroupMembers
            groupId={groupId}
            onCountsUpdate={loadCounts}
            canRemove={permissions.includes(GROUP_PERMISSIONS.MEMBERS_REMOVE)}
          />
        )}
        {tab === "settings" && (
          <GroupSettings group={group} onUpdated={handleGroupUpdated} />
        )}
      </div>
    </div>
  );
}
