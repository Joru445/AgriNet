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
    to: "/farmer/transactions",
    icon: "ri-file-list-3-line",
    labelKey: "nav.transactions",
    bottom: true,
    group: "marketplace",
  },
  {
    to: "/farmer/messages",
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
    to: "/farmer/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: true,
    group: "system",
  },
];

export const consumerNavigation = [
  {
    to: "/home",
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
    bottom: true,
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
    bottom: true,
    group: "system",
  },
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
    to: "/admin/reports",
    labelKey: "nav.reports",
    icon: "ri-alert-line",
    bottom: true,
    group: "main",
  },
  {
    to: "/admin/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
    group: "communication",
  },
  {
    to: "/admin/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: true,
    group: "system",
  },
];

export const navigationByRole = {
  consumer: consumerNavigation,
  farmer: farmerNavigation,
  admin: adminNavigation,
};
