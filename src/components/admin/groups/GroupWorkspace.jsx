import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { GROUP_PERMISSIONS } from "../../../constants/groupPermissions";
import GroupOverview from "./GroupOverview";
import GroupApplications from "./GroupApplications";
import GroupMembers from "./GroupMembers";
import GroupManagers from "./GroupManagers";
import GroupSettings from "./GroupSettings";

/** One responsive workspace for administrators and managers of any account role. */
export default function GroupWorkspace({ group, groupId, counts, permissions = [], isAdmin = false, onUpdated, onCountsUpdate }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("overview");
  const permitted = (perm) => isAdmin || permissions.includes(perm);
  const tabs = useMemo(() => [
    { id: "overview", icon: "ri-dashboard-line" },
    ...(permitted(GROUP_PERMISSIONS.MEMBERS_VIEW) ? [{ id: "members", icon: "ri-group-line", count: counts.members }] : []),
    ...(permitted(GROUP_PERMISSIONS.APPLICATIONS_VIEW) ? [{ id: "applications", icon: "ri-mail-check-line", count: counts.applications }] : []),
    ...(isAdmin ? [{ id: "managers", icon: "ri-shield-user-line" }] : []),
    ...(permitted(GROUP_PERMISSIONS.GROUP_EDIT) ? [{ id: "settings", icon: "ri-settings-3-line" }] : []),
  // Permission sets originate from backend and are stable enough for small nav.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [isAdmin, permissions, counts.members, counts.applications]);
  useEffect(() => { if (!tabs.some((item) => item.id === tab)) setTab("overview"); }, [tabs, tab]);
  return <div className="mx-auto w-full min-w-0 max-w-5xl space-y-4 px-3 pb-8 pt-4 sm:px-5 md:py-6">
    <header className="overflow-hidden rounded-2xl border border-(--agri-border) bg-(--agri-card)">
      <div className="bg-[#2D6A4F] px-4 py-5 text-white sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">Group workspace</p>
        <h1 className="mt-1 break-words text-xl font-bold sm:text-3xl">{group?.name || "Group"}</h1>
        <p className="mt-1 text-sm text-emerald-100">Manage membership, applications and community settings</p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:p-4">
        {[
          { label: "Members", value: counts.members, icon: "ri-group-line" },
          { label: "Pending applications", value: counts.applications, icon: "ri-time-line" },
          { label: "Your access", value: isAdmin ? "Admin" : "Manager", icon: "ri-shield-check-line" },
        ].map((stat) => <div key={stat.label} className="min-w-0 rounded-xl bg-(--agri-hover) px-3 py-3 sm:px-4">
          <div className="flex items-center gap-2 text-(--agri-text-muted)"><i className={stat.icon} /><span className="truncate text-[11px]">{stat.label}</span></div>
          <p className="mt-1 text-lg font-bold text-(--agri-text)">{stat.value}</p>
        </div>)}
      </div>
    </header>
    <nav aria-label="Group management sections" className="grid grid-cols-2 gap-2 rounded-2xl border border-(--agri-border) bg-(--agri-card) p-2 sm:grid-cols-3 lg:grid-cols-5">
      {tabs.map((item) => <button type="button" key={item.id} onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined}
        className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold sm:text-sm ${tab === item.id ? "bg-[#2D6A4F] text-white" : "text-(--agri-text-secondary) hover:bg-(--agri-hover)"}`}>
        <i className={item.icon} aria-hidden="true" /> <span className="truncate">{t(`adminGroups.tabs.${item.id}`) || item.id}</span>
        {item.id === "applications" && item.count > 0 && <span className="rounded-full bg-white/15 px-1.5 text-[10px]">{item.count}</span>}
      </button>)}
    </nav>
    <section className="min-w-0" aria-live="polite">
      {tab === "overview" && <GroupOverview group={group} counts={counts} />}
      {tab === "members" && <GroupMembers groupId={groupId} onCountsUpdate={onCountsUpdate}
        canAdd={permitted(GROUP_PERMISSIONS.MEMBERS_ADD)} canRemove={permitted(GROUP_PERMISSIONS.MEMBERS_REMOVE)} />}
      {tab === "applications" && <GroupApplications groupId={groupId} onCountsUpdate={onCountsUpdate}
        canApprove={permitted(GROUP_PERMISSIONS.APPLICATIONS_APPROVE)} canReject={permitted(GROUP_PERMISSIONS.APPLICATIONS_REJECT)} />}
      {tab === "managers" && isAdmin && <GroupManagers groupId={groupId} />}
      {tab === "settings" && <GroupSettings group={group} onUpdated={onUpdated} />}
    </section>
  </div>;
}
