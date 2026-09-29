import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getGroups,
  getGroupMemberCount,
  getMyMemberships,
  subscribeToMyMemberships,
} from "../../services/group.service";
import * as pageCache from "../../utils/pageCache";
import GroupCard from "../../components/groups/GroupCard";
import SkeletonBox from "../../components/ui/SkeletonBox";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import InlineSearchInput from "../../components/ui/InlineSearchInput";
import TabButton from "../../components/ui/TabButton";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5";

export default function Groups() {
  const { t } = useLanguage();
  const { user, profile, identity } = useAuth();
  const role = profile?.role || identity?.role || user?.role;
  const isFarmer = role === "farmer";

  const [groups, setGroups] = useState(() => pageCache.get("all_groups") || []);
  const [memberships, setMemberships] = useState(() => {
    if (!user?.uid) return [];
    const cached = pageCache.get(`my_memberships_${user.uid}`);
    if (Array.isArray(cached) && cached.length > 0) return cached;
    const approved = pageCache.get(`approvedUserGroups:${user.uid}`);
    if (Array.isArray(approved) && approved.length > 0) {
      return approved.map((g) => ({
        groupId: g.groupId || g.id,
        status: "approved",
      }));
    }
    const localList = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("pending_app_") && k.endsWith(`_${user.uid}`)) {
          const item = JSON.parse(localStorage.getItem(k));
          if (item?.groupId) {
            localList.push({ groupId: item.groupId, status: "pending" });
          }
        }
      }
    } catch {}
    return localList;
  });

  const [membershipsLoaded, setMembershipsLoaded] = useState(() => {
    if (!isFarmer || !user?.uid) return true;
    const cached = pageCache.get(`my_memberships_${user.uid}`);
    if (Array.isArray(cached) && cached.length > 0) return true;
    const approved = pageCache.get(`approvedUserGroups:${user.uid}`);
    if (Array.isArray(approved) && approved.length > 0) return true;
    return false;
  });

  const [loading, setLoading] = useState(() => {
    const hasGroups = Boolean(pageCache.get("all_groups"));
    if (!hasGroups) return true;
    if (isFarmer && user?.uid) {
      const hasMemberships =
        Boolean(pageCache.get(`my_memberships_${user.uid}`)) ||
        Boolean(pageCache.get(`approvedUserGroups:${user.uid}`));
      return !hasMemberships;
    }
    return false;
  });

  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!pageCache.get("all_groups") || (isFarmer && user?.uid && !membershipsLoaded)) {
          setLoading(true);
        }
        setError(null);

        const [groupsData, membershipsData] = await Promise.all([
          getGroups(),
          isFarmer && user?.uid ? getMyMemberships() : Promise.resolve([]),
        ]);

        if (!cancelled) {
          setGroups(groupsData);
          setMemberships(membershipsData);
          setMembershipsLoaded(true);

          // Asynchronously load real member counts for all groups
          Promise.all(
            groupsData.map(async (g) => {
              try {
                const count = await getGroupMemberCount(g.id);
                return { id: g.id, count };
              } catch {
                return { id: g.id, count: 0 };
              }
            })
          ).then((counts) => {
            if (!cancelled) {
              const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]));
              setGroups((prev) =>
                prev.map((g) => ({
                  ...g,
                  memberCount: countMap[g.id] ?? g.memberCount ?? 0,
                }))
              );
            }
          });
        }
      } catch (err) {
        if (!cancelled && groups.length === 0) {
          setError(err?.message || t("groups.loadError"));
        }
      } finally {
        if (!cancelled) {
          setMembershipsLoaded(true);
          setLoading(false);
        }
      }
    }

    load();

    // Real-time listener for current farmer's memberships across groups
    let unsubMemberships = () => {};
    if (isFarmer && user?.uid) {
      unsubMemberships = subscribeToMyMemberships(user.uid, (data) => {
        if (!cancelled && Array.isArray(data)) {
          setMemberships(data);
          setMembershipsLoaded(true);
        }
      });
    }

    return () => {
      cancelled = true;
      unsubMemberships();
    };
  }, [isFarmer, user?.uid, t]);

  const membershipByGroupId = useMemo(() => {
    const map = {};
    for (const m of memberships) {
      map[m.groupId] = m.status;
    }
    return map;
  }, [memberships]);

  const myApprovedCount = useMemo(() => {
    return groups.filter((g) => membershipByGroupId[g.id] === "approved").length;
  }, [groups, membershipByGroupId]);

  const pendingCount = useMemo(() => {
    return groups.filter((g) => membershipByGroupId[g.id] === "pending").length;
  }, [groups, membershipByGroupId]);

  const filteredGroups = useMemo(() => {
    let list = groups;

    if (activeTab === "mine") {
      list = list.filter((g) => membershipByGroupId[g.id] === "approved");
    } else if (activeTab === "pending") {
      list = list.filter((g) => membershipByGroupId[g.id] === "pending");
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.name?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          (typeof g.location === "string" && g.location.toLowerCase().includes(q)) ||
          g.city?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [groups, activeTab, search, membershipByGroupId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) p-5 sm:p-6 shadow-sm shadow-black/5">
          <SkeletonBox className="h-8 w-44 rounded-xl" />
          <SkeletonBox className="mt-2 h-4 w-72" />
        </div>
        <div className={GRID}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) shadow-md shadow-black/5"
            >
              <SkeletonBox className="aspect-[16/10] w-full" />
              <div className="p-4 sm:p-5 space-y-3">
                <SkeletonBox className="h-5 w-3/4" />
                <SkeletonBox className="h-3.5 w-full" />
                <SkeletonBox className="h-3.5 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <SkeletonBox className="h-5 w-20 rounded-lg" />
                  <SkeletonBox className="h-5 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState
          icon="ri-team-line"
          title={t("groups.noGroups")}
          description={t("groups.noGroupsDesc")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 space-y-5">
      {/* Elevated Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) p-4 sm:p-5 lg:p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="flex h-11 w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-[#2D6A4F] dark:text-(--agri-brand) shadow-xs ring-1 ring-[#2D6A4F]/20">
              <i className="ri-team-line text-xl lg:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1B4332] dark:text-(--agri-brand-light) tracking-tight">
                {t("groups.title")}
              </h1>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-(--agri-text-muted)">
                {t("groups.subtitle")}
              </p>
            </div>
          </div>

          {/* Search bar with shadow-2xs */}
          <div className="w-full md:w-72 lg:w-80 shrink-0">
            <InlineSearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("groups.searchPlaceholder") || "Search for groups..."}
            />
          </div>
        </div>

        {/* Tab filters if farmer has memberships */}
        {isFarmer && (myApprovedCount > 0 || pendingCount > 0) && (
          <div className="mt-4 flex items-center gap-1.5 pt-3 border-t border-(--agri-border-subtle) overflow-x-auto no-scrollbar p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-(--agri-hover)/70 shadow-xs">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="All Groups"
              count={groups.length}
            />
            {myApprovedCount > 0 && (
              <TabButton
                active={activeTab === "mine"}
                onClick={() => setActiveTab("mine")}
                label="My Groups"
                count={myApprovedCount}
              />
            )}
            {pendingCount > 0 && (
              <TabButton
                active={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
                label="Pending"
                count={pendingCount}
              />
            )}
          </div>
        )}
      </div>

      {/* Grid or Empty Search */}
      {filteredGroups.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon="ri-search-line"
            title="No matching groups found"
            description={search ? `No groups matched "${search}". Try adjusting your search query.` : "No groups in this filter category."}
            action={
              search || activeTab !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveTab("all");
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] dark:text-(--agri-brand) hover:underline cursor-pointer"
                >
                  <i className="ri-refresh-line" />
                  Reset filters
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className={GRID}>
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              membershipStatus={isFarmer ? (membershipByGroupId[group.id] || "none") : null}
              membershipLoading={isFarmer && !membershipsLoaded}
              showMembership={isFarmer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
