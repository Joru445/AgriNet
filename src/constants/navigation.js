import { getProfilePath } from "../utils/routes";

export const farmerNavigation = [
  {
    to: "/farmer",
    icon: "ri-dashboard-line",
    labelKey: "nav.dashboard",
    bottom: true,
    group: "main",
  },
  {
    to: "/farmer/products",
    icon: "ri-store-2-line",
    labelKey: "nav.myProducts",
    bottom: true,
    group: "marketplace",
  },
  {
    to: "/groups",
    icon: "ri-team-line",
    labelKey: "nav.groups",
    bottom: false,
    group: "marketplace",
  },
  {
    to: "/transactions",
    icon: "ri-file-list-3-line",
    labelKey: "nav.transactions",
    bottom: false,
    group: "marketplace",
  },
  {
    to: "/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
    group: "communication",
  },
  {
    to: "/farmer/reviews",
    icon: "ri-star-line",
    labelKey: "nav.reviews",
    bottom: false,
    group: "communication",
  },
  {
    to: "/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: false,
    group: "system",
  },
  { to: "__profile__", icon: "ri-user-3-line", labelKey: "nav.profile", bottom: true, sidebar: false, kind: "profile", group: "system" },
];

export const consumerNavigation = [
  {
    to: "/marketplace",
    icon: "ri-store-2-line",
    labelKey: "nav.home",
    bottom: true,
    group: "main",
  },
  {
    to: "/nearby",
    icon: "ri-map-pin-line",
    labelKey: "nav.nearby",
    bottom: true,
    group: "marketplace",
  },
  {
    to: "/transactions",
    icon: "ri-file-list-3-line",
    labelKey: "nav.transactions",
    bottom: false,
    group: "marketplace",
  },
  {
    to: "/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
    group: "communication",
  },
  {
    to: "/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: false,
    group: "system",
  },
  { to: "__profile__", icon: "ri-user-3-line", labelKey: "nav.profile", bottom: true, sidebar: false, kind: "profile", group: "system" },
];

export const adminNavigation = [
  {
    to: "/admin",
    labelKey: "nav.dashboard",
    icon: "ri-dashboard-line",
    bottom: true,
    group: "main",
  },
  {
    to: "/admin/groups",
    labelKey: "nav.groups",
    icon: "ri-team-line",
    bottom: false,
    group: "main",
  },
  {
    to: "/admin/farmer-verifications",
    labelKey: "nav.farmerVerifications",
    icon: "ri-shield-star-line",
    bottom: false,
    group: "main",
  },
  {
    to: "/admin/reports",
    labelKey: "nav.reports",
    icon: "ri-alert-line",
    bottom: true,
    group: "main",
  },
  {
    to: "/admin/activity",
    labelKey: "nav.adminActivity",
    icon: "ri-history-line",
    bottom: false,
    group: "main",
  },
  {
    to: "/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
    group: "communication",
  },
  {
    to: "/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: false,
    group: "system",
  },
  { to: "__profile__", icon: "ri-user-3-line", labelKey: "nav.profile", bottom: true, sidebar: false, kind: "profile", group: "system" },
];

export const navigationByRole = {
  consumer: consumerNavigation,
  farmer: farmerNavigation,
  admin: adminNavigation,
};

export function resolveNavigationPath(item, identity) {
  if (item.kind === "profile") return getProfilePath(identity?.username);
  return item.to;
}

export function getLayoutRouteMembership(pathname, identity, isDesktop) {
  const role = identity?.role || "consumer";
  const items = navigationByRole[role] || consumerNavigation;
  const ownProfile = Boolean(identity?.username && pathname === resolveNavigationPath({ kind: "profile" }, identity));
  const eligible = items.filter((item) => isDesktop ? item.sidebar !== false : item.bottom);
  const direct = eligible.some((item) => {
    const destination = resolveNavigationPath(item, identity);
    return destination && destination === pathname;
  });
  return { isDirect: Boolean(direct || (!isDesktop && ownProfile)), ownProfile: Boolean(ownProfile) };
}
