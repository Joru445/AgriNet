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
  if (!uid) return "/home";
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
      return "/home";

    default:
      return "/login";
  }
}
