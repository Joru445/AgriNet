export const farmerNavigation = [
  {
    to: "/farmer",
    icon: "ri-dashboard-line",
    labelKey: "nav.dashboard",
    bottom: true,
  },
  {
    to: "/farmer/products",
    icon: "ri-store-2-line",
    labelKey: "nav.myProducts",
    bottom: true,
  },
  {
    to: "/farmer/transactions",
    icon: "ri-file-list-3-line",
    labelKey: "nav.transactions",
    bottom: true,
  },
  {
    to: "/farmer/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
  },
  {
    to: "/farmer/reviews",
    icon: "ri-star-line",
    labelKey: "nav.reviews",
    bottom: false,
  },
  {
    to: "/farmer/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: true,
  },
];

export const consumerNavigation = [
  {
    to: "/home",
    icon: "ri-store-2-line",
    labelKey: "nav.home",
    bottom: true,
  },
  {
    to: "/nearby",
    icon: "ri-map-pin-line",
    labelKey: "nav.nearby",
    bottom: true,
  },
  {
    to: "/transactions",
    icon: "ri-file-list-3-line",
    labelKey: "nav.transactions",
    bottom: true,
  },
  {
    to: "/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
  },
  {
    to: "/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: true,
  },
];

export const adminNavigation = [
  {
    to: "/admin",
    labelKey: "nav.dashboard",
    icon: "ri-dashboard-line",
    bottom: true,
  },
  {
    to: "/admin/reports",
    labelKey: "nav.reports",
    icon: "ri-alert-line",
    bottom: true,
  },
  {
    to: "/admin/messages",
    icon: "ri-message-3-line",
    labelKey: "nav.messages",
    bottom: true,
  },
  {
    to: "/admin/settings",
    icon: "ri-settings-3-line",
    labelKey: "nav.settings",
    bottom: true,
  },
];

export const navigationByRole = {
  consumer: consumerNavigation,
  farmer: farmerNavigation,
  admin: adminNavigation,
};
