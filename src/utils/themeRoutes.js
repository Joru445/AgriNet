/**
 * Checks whether the given pathname belongs to the public experience
 * (Landing, Authentication, Verification, Error/Suspended flows)
 * which must strictly remain light-only.
 */
export function isLightOnlyRoute(pathname) {
  if (!pathname) return true;
  // Normalize pathname: strip query parameters and hash, remove trailing slash
  const clean =
    pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // Root / HomeRedirect
  if (clean === "/") return true;

  // Public Landing
  if (clean === "/landing") return true;

  // Authentication flows
  if (clean === "/login") return true;
  if (clean === "/register") return true;
  if (clean === "/forgot-password" || clean.startsWith("/forgot-password/")) return true;
  if (clean === "/reset-password" || clean.startsWith("/reset-password/")) return true;
  if (clean === "/verify-account" || clean.startsWith("/verify-account/")) return true;

  // Account lockout / suspension
  if (clean === "/suspended") return true;

  // Dedicated OAuth popup tabs
  if (clean === "/auth" || clean.startsWith("/auth/")) return true;

  return false;
}
