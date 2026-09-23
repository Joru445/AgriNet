import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useManagedGroups from "../../hooks/useManagedGroups";
import DashboardSection from "../../components/ui/DashboardSection";
import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

import { useLanguage } from "../../context/LanguageContext";
import { getGroup } from "../../services/group.service";

export default function ManagedGroups() {
  const { t } = useLanguage();
  const { managedGroups, loading: managersLoading, error: managersError } = useManagedGroups();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    if (managedGroups.length === 0) {
      setGroups([]);
      setLoadingGroups(false);
      return;
    }

    let cancelled = false;

    async function loadGroups() {
      try {
        setLoadingGroups(true);
        const results = await Promise.all(
          managedGroups.map((mgr) => getGroup(mgr.groupId).catch(() => null)),
        );
        if (!cancelled) {
          setGroups(results.filter(Boolean));
        }
      } catch {
        if (!cancelled) {
          setGroups([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGroups(false);
        }
      }
    }

    loadGroups();
    return () => { cancelled = true; };
  }, [managedGroups]);

  const loading = managersLoading || loadingGroups;

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-(--agri-text)">
            {t("managerGroups.title")}
          </h1>
          <p className="mt-1 text-sm text-(--agri-text-muted)">
            {t("managerGroups.subtitle")}
          </p>
        </div>

        {managersError && (
          <ErrorState
            className="mb-4"
            message={managersError}
          />
        )}

        <DashboardSection
          title={t("managerGroups.title")}
          icon="ri-shield-user-line"
          compact
          fill
        >
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-16" />
              ))}
            </div>
          ) : managedGroups.length === 0 ? (
            <EmptyState
              icon="ri-shield-user-line"
              title={t("managerGroups.noGroups")}
              description={t("managerGroups.noGroupsDesc")}
            />
          ) : (
            <div>
              {managedGroups.map((mgr) => {
                const group = groups.find((g) => g.id === mgr.groupId);
                return (
                  <Link
                    key={mgr.groupId}
                    to={`/manage/groups/${mgr.groupId}`}
                    className="flex items-center gap-3 border-b border-(--agri-border-subtle) px-4 py-3 transition hover:bg-(--agri-hover)/60 last:border-b-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-sm font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
                      {(group?.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-(--agri-text)">
                        {group?.name || mgr.groupId}
                      </p>
                      <p className="text-xs text-(--agri-text-muted)">
                        {formatPermissionCount(mgr.permissions, t)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-xs font-medium text-[#2D6A4F] dark:text-(--agri-brand)">
                        {t("managerGroups.manage")}
                      </span>
                      <i className="ri-arrow-right-line text-(--agri-text-muted)" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

function formatPermissionCount(permissions, t) {
  const count = permissions?.length ?? 0;
  if (count === 0) return t("managerGroups.noPermissions");
  return count === 1
    ? t("managerGroups.permission", { count })
    : t("managerGroups.permissions", { count });
}
