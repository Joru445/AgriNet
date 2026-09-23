import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getGroups, getMyMemberships } from "../../services/group.service";
import GroupCard from "../../components/groups/GroupCard";
import SkeletonBox from "../../components/ui/SkeletonBox";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";

const GRID = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4";

export default function Groups() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";

  const [groups, setGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [groupsData, membershipsData] = await Promise.all([
          getGroups(),
          isFarmer ? getMyMemberships() : Promise.resolve([]),
        ]);

        if (!cancelled) {
          setGroups(groupsData);
          setMemberships(membershipsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || t("groups.loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isFarmer, t]);

  const membershipByGroupId = useMemo(() => {
    const map = {};
    for (const m of memberships) {
      map[m.groupId] = m.status;
    }
    return map;
  }, [memberships]);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="mb-6">
          <SkeletonBox className="h-7 w-32" />
          <SkeletonBox className="mt-2 h-4 w-64" />
        </div>
        <div className={GRID}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-(--agri-border-subtle) bg-(--agri-card)">
              <SkeletonBox className="aspect-[3/2] w-full" />
              <div className="p-3 space-y-2">
                <SkeletonBox className="h-4 w-3/4" />
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          icon="ri-team-line"
          title={t("groups.noGroups")}
          description={t("groups.noGroupsDesc")}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#1B4332] dark:text-(--agri-brand-light)">
          {t("groups.title")}
        </h1>
        <p className="mt-1 text-sm text-(--agri-text-muted)">
          {t("groups.subtitle")}
        </p>
      </div>

      {/* Grid */}
      <div className={GRID}>
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            membershipStatus={isFarmer ? (membershipByGroupId[group.id] || "none") : null}
            showMembership={isFarmer}
          />
        ))}
      </div>
    </div>
  );
}
