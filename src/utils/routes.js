const encode = (value) => encodeURIComponent(String(value));

/** Canonical frontend destinations. Role-specific destinations are explicit. */
export const ROUTES = {
  marketplace: "/marketplace", nearby: "/nearby", messages: "/messages",
  transactions: "/transactions", profile: "/me", settings: "/settings",
  notifications: "/notifications", favorites: "/favorites", groups: "/groups",
  product: (id) => `/product/${encode(id)}`,
  publicProfile: (username) => `/${encode(String(username).toLowerCase())}`,
  legacyPublicProfile: (uid) => `/profile/${encode(uid)}`,
  transactionProof: (id) => `/transactions/${encode(id)}/proof`,
  transactionReview: (id) => `/transactions/${encode(id)}/review`,
  farmerProducts: "/farmer/products", farmerReviews: "/farmer/reviews",
  adminTransactions: "/admin/transactions", managedGroups: "/manage/groups",
};

// Compatibility helpers intentionally ignore role for shared destinations.
export const getTransactionsPath = () => ROUTES.transactions;
export const getInquiriesPath = () => ROUTES.transactions;
export const getMessagesPath = () => ROUTES.messages;
export const getNotificationsPath = () => ROUTES.notifications;
export const getMePath = () => ROUTES.profile;
export const getFavoritesPath = () => ROUTES.favorites;
export const getSettingsPath = () => ROUTES.settings;
export const getProductPath = () => "/product";
export const getProfilePath = () => "/profile";

/** Uses the canonical username only when it is actually available. */
export function getPublicProfilePath(userOrUid) {
  if (!userOrUid) return ROUTES.marketplace;
  if (typeof userOrUid === "object") {
    return userOrUid.username
      ? ROUTES.publicProfile(userOrUid.username)
      : (userOrUid.uid ? ROUTES.legacyPublicProfile(userOrUid.uid) : ROUTES.marketplace);
  }
  return ROUTES.legacyPublicProfile(userOrUid);
}

export function getRoleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "farmer") return "/farmer";
  return role === "consumer" ? ROUTES.marketplace : "/login";
}

export const PUBLIC_AUTH_ROUTES = ["/", "/landing", "/login", "/register", "/forgot-password", "/verify-account", "/suspended"];
export function isPublicAuthRoute(pathname) {
  return PUBLIC_AUTH_ROUTES.includes(pathname) || Boolean(pathname?.startsWith("/auth/"));
}

export function getLogicalParent(pathname) {
  if (!pathname) return ROUTES.marketplace;
  if (pathname.startsWith("/admin/groups/")) return "/admin/groups";
  if (pathname.startsWith("/admin/transactions/")) return ROUTES.adminTransactions;
  if (pathname.startsWith("/manage/groups/")) return ROUTES.managedGroups;
  if (pathname.startsWith("/farmer/product/")) return ROUTES.farmerProducts;
  if (pathname.startsWith("/farmer/")) return "/farmer";
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname.startsWith("/groups/")) return ROUTES.groups;
  if (pathname.startsWith("/transactions/")) return ROUTES.transactions;
  if (pathname.startsWith("/product/") || pathname.startsWith("/profile/")) return ROUTES.marketplace;
  if (["/favorites", "/notifications", "/nearby"].some((path) => pathname.startsWith(path))) return ROUTES.marketplace;
  return ROUTES.marketplace;
}
