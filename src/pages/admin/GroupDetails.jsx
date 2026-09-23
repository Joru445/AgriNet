import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import TabButton from "../../components/ui/TabButton";
import BackButton from "../../components/ui/BackButton";

import { useLanguage } from "../../context/LanguageContext";
import { getGroup, getGroupMemberCount, getGroupApplications } from "../../services/group.service";
import GroupOverview from "../../components/admin/groups/GroupOverview";
import GroupApplications from "../../components/admin/groups/GroupApplications";
import GroupMembers from "../../components/admin/groups/GroupMembers";
import GroupManagers from "../../components/admin/groups/GroupManagers";
import GroupSettings from "../../components/admin/groups/GroupSettings";

const TABS = ["overview", "applications", "members", "managers", "settings"];

export default function AdminGroupDetails() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const [tab, setTab] = useState("overview");
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
  }, [loadGroup, loadCounts]);

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
            title={t("admin.failedToLoad")}
            message={error}
            onRetry={loadGroup}
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
          {TABS.map((tabKey) => (
            <TabButton
              key={tabKey}
              active={tab === tabKey}
              onClick={() => setTab(tabKey)}
              label={t(`adminGroups.tabs.${tabKey}`)}
              count={tabKey === "applications" ? counts.applications : undefined}
            />
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <GroupOverview group={group} counts={counts} />
        )}
        {tab === "applications" && (
          <GroupApplications groupId={groupId} onCountsUpdate={loadCounts} />
        )}
        {tab === "members" && (
          <GroupMembers groupId={groupId} onCountsUpdate={loadCounts} />
        )}
        {tab === "managers" && (
          <GroupManagers groupId={groupId} />
        )}
        {tab === "settings" && (
          <GroupSettings group={group} onUpdated={handleGroupUpdated} />
        )}
      </div>
    </div>
  );
}
