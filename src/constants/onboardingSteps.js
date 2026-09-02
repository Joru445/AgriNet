/**
 * Role-aware onboarding tour steps.
 *
 * Each step may define:
 *  - target:  CSS selector for the highlighted element (optional). Missing
 *             targets degrade gracefully to a centered tooltip.
 *  - path:    Route to navigate to before highlighting the step. May also be
 *             a function receiving the user profile (for dynamic routes).
 *  - id:      Stable step identifier. Copy lives in the i18n dictionaries
 *             under `onboarding.steps.<id>.title` / `.body`.
 */

const TARGET = {
  search: '[data-onboarding="home-search"]',
  productCard: '[data-onboarding="product-card"]',
  bell: '[data-onboarding="bell"]',
  headerProfile: '[data-onboarding="header-profile"]',
  storeHeader: '[data-onboarding="store-header"]',
  adminStats: '[data-onboarding="admin-stats"]',
};

const NAV = {
  nearby: '[data-onboarding="nav-nearby"]',
  products: '[data-onboarding="nav-products"]',
  messages: '[data-onboarding="nav-messages"]',
  transactions: '[data-onboarding="nav-transactions"]',
  reports: '[data-onboarding="nav-reports"]',
};

const consumerSteps = [
  {
    id: "consumer-welcome",
            target: null,
    path: "/home",
  },
  {
    id: "consumer-search",
            target: TARGET.search,
    path: "/home",
  },
  {
    id: "consumer-nearby",
            target: NAV.nearby,
    path: "/home",
  },
  {
    id: "consumer-product",
            target: TARGET.productCard,
    path: "/home",
  },
  {
    id: "consumer-messages",
            target: NAV.messages,
    path: "/home",
  },
  {
    id: "consumer-notifications",
            target: TARGET.bell,
    path: "/home",
  },
  {
    id: "consumer-profile",
            target: TARGET.headerProfile,
    path: "/home",
  },
];

const farmerSteps = [
  {
    id: "farmer-welcome",
            target: null,
    path: "/farmer",
  },
  {
    id: "farmer-store",
            target: TARGET.storeHeader,
    path: (profile) =>
      profile?.uid ? `/farmer/profile/${profile.uid}` : null,
  },
  {
    id: "farmer-products",
            target: NAV.products,
    path: "/farmer",
  },
  {
    id: "farmer-messages",
            target: NAV.messages,
    path: "/farmer",
  },
  {
    id: "farmer-transactions",
            target: NAV.transactions,
    path: "/farmer",
  },
  {
    id: "farmer-notifications",
            target: TARGET.bell,
    path: "/farmer",
  },
  {
    id: "farmer-profile",
            target: TARGET.headerProfile,
    path: "/farmer",
  },
];

const adminSteps = [
  {
    id: "admin-welcome",
            target: null,
    path: "/admin",
  },
  {
    id: "admin-overview",
            target: TARGET.adminStats,
    path: "/admin",
  },
  {
    id: "admin-reports",
            target: NAV.reports,
    path: "/admin",
  },
  {
    id: "admin-messages",
            target: NAV.messages,
    path: "/admin",
  },
  {
    id: "admin-notifications",
            target: TARGET.bell,
    path: "/admin",
  },
  {
    id: "admin-profile",
            target: TARGET.headerProfile,
    path: "/admin",
  },
];

const STEPS_BY_ROLE = {
  consumer: consumerSteps,
  farmer: farmerSteps,
  admin: adminSteps,
};

export function getOnboardingSteps(role) {
  return STEPS_BY_ROLE[role] || [];
}

/**
 * Maps a navigation route to a stable data attribute used by both the
 * desktop Sidebar and mobile BottomTab so the tour can highlight the
 * correct entry point on every breakpoint.
 */
const NAV_KEYS_BY_PATH = {
  "/home": "nav-home",
  "/nearby": "nav-nearby",
  "/messages": "nav-messages",
  "/transactions": "nav-transactions",
  "/settings": "nav-settings",

  "/farmer": "nav-dashboard",
  "/farmer/products": "nav-products",
  "/farmer/messages": "nav-messages",
  "/farmer/transactions": "nav-transactions",
  "/farmer/settings": "nav-settings",

  "/admin": "nav-dashboard",
  "/admin/reports": "nav-reports",
  "/admin/messages": "nav-messages",
  "/admin/settings": "nav-settings",
};

export function getOnboardingNavKey(path) {
  return NAV_KEYS_BY_PATH[path] || null;
}