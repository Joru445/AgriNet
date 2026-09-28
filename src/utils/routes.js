export function getTransactionsPath(role) {
  switch (role) {
    case "admin":
      return "/admin/transactions";

    case "farmer":
      return "/farmer/transactions";

    case "consumer":
      return "/transactions";

    default:
      return "/transactions";
  }
}

export function getInquiriesPath(role) {
  return getTransactionsPath(role);
}

export function getMessagesPath(role) {
  switch (role) {
    case "admin":
      return "/admin/messages";

    case "farmer":
      return "/farmer/messages";

    case "consumer":
      return "/messages";

    default:
      return "/messages";
  }
}

export function getProductPath(role) {
  switch (role) {
    case "admin":
      return "/admin/products";

    case "farmer":
      return "/farmer/product";

    case "consumer":
      return "/product";

    default:
      return "/product";
  }
}

export function getProfilePath(role) {
  switch (role) {
    case "admin":
      return "/admin/profile";

    case "farmer":
      return "/farmer/profile";

    case "consumer":
      return "/profile";

    default:
      return "/profile";
  }
}

export function getNotificationsPath(role) {
  switch (role) {
    case "admin":
      return "/admin/notifications";

    case "farmer":
      return "/farmer/notifications";

    case "consumer":
      return "/notifications";

    default:
      return "/notifications";
  }
}

export function getMePath(role) {
  switch (role) {
    case "admin":
      return "/admin/me";

    case "farmer":
      return "/farmer/me";

    case "consumer":
      return "/me";

    default:
      return "/me";
  }
}

export function getFavoritesPath(role) {
  switch (role) {
    case "farmer":
      return "/farmer/favorites";

    default:
      return "/favorites";
  }
}

export function getSettingsPath(role) {
  switch (role) {
    case "admin":
      return "/admin/settings";

    case "farmer":
      return "/farmer/settings";

    default:
      return "/settings";
  }
}

/**
 * Get the public profile path for a given user ID.
 * Consumers/admins see /profile/:uid, farmers see /farmer/profile/:uid.
 */
export function getPublicProfilePath(uid, role) {
  if (!uid) return "/marketplace";
  if (role === "farmer") return `/farmer/profile/${uid}`;
  return `/profile/${uid}`;
}

export function getRoleHome(role) {
  switch (role) {
    case "admin":
      return "/admin";

    case "farmer":
      return "/farmer";

    case "consumer":
      return "/marketplace";

    default:
      return "/login";
  }
}

/**
 * Public & Authentication routes that must remain strictly light-only.
 */
export const PUBLIC_AUTH_ROUTES = [
  "/",
  "/landing",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-account",
  "/suspended",
];

export function isPublicAuthRoute(pathname) {
  if (!pathname || pathname === "/" || pathname === "/landing") return true;
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-account" ||
    pathname === "/suspended" ||
    pathname.startsWith("/auth/")
  ) {
    return true;
  }
  return false;
}

/**
 * Safe fallback logical parent for deep links and direct navigations.
 */
export function getLogicalParent(pathname) {
  if (!pathname) return "/marketplace";

  // Farmer routes
  if (pathname.startsWith("/farmer/product/")) return "/farmer/products";
  if (pathname.startsWith("/farmer/profile/")) return "/farmer";
  if (pathname.startsWith("/farmer/transactions/") && (pathname.includes("/proof") || pathname.includes("/review"))) {
    return "/farmer/transactions";
  }
  if (pathname.startsWith("/farmer/reviews")) return "/farmer";

  // Admin routes
  if (pathname.startsWith("/admin/groups/")) return "/admin/groups";
  if (pathname.startsWith("/admin/transactions/") && (pathname.includes("/proof") || pathname.includes("/review"))) {
    return "/admin/transactions";
  }
  if (pathname.startsWith("/admin/farmer-verifications")) return "/admin";
  if (pathname.startsWith("/admin/activity")) return "/admin";
  if (pathname.startsWith("/admin/reports")) return "/admin";
  if (pathname.startsWith("/admin/users")) return "/admin";
  if (pathname.startsWith("/admin/products")) return "/admin";

  // Manager routes
  if (pathname.startsWith("/manage/groups/")) return "/manage/groups";

  // Shared routes
  if (pathname.startsWith("/groups/")) return "/groups";
  if (pathname.startsWith("/product/")) return "/marketplace";
  if (pathname.startsWith("/profile/")) return "/marketplace";
  if (pathname.startsWith("/transactions/") && (pathname.includes("/proof") || pathname.includes("/review"))) {
    return "/transactions";
  }
  if (pathname.startsWith("/favorites")) return "/marketplace";
  if (pathname.startsWith("/notifications")) return "/marketplace";
  if (pathname.startsWith("/nearby")) return "/marketplace";

  if (pathname.startsWith("/farmer")) return "/farmer";
  if (pathname.startsWith("/admin")) return "/admin";
  return "/marketplace";
}

