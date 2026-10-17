const encode = (value) => encodeURIComponent(String(value));

/** Canonical frontend destinations. Role-specific destinations are explicit. */
export const ROUTES = {
  marketplace: "/marketplace", nearby: "/nearby", messages: "/messages",
  transactions: "/transactions", settings: "/settings",
  notifications: "/notifications", favorites: "/favorites", groups: "/groups",
  product: (id) => `/product/${encode(id)}`,
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
export const getFavoritesPath = () => ROUTES.favorites;
export const getSettingsPath = () => ROUTES.settings;
export const getProductPath = () => "/product";

/** Build the only supported public profile URL. */
export function getProfilePath(username) {
  if (typeof username !== "string" || !username.trim()) return null;
  return `/${encodeURIComponent(username.trim().toLowerCase())}`;
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
  if (pathname.startsWith("/product/")) return ROUTES.marketplace;
  if (["/favorites", "/notifications", "/nearby"].some((path) => pathname.startsWith(path))) return ROUTES.marketplace;
  return ROUTES.marketplace;
}
