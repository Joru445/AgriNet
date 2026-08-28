/**
 * Utility to check if a product listing has exceeded its expiration time.
 */
export function isProductExpired(product) {
  if (!product || !product.expiresAt) return false;
  try {
    const expireTime =
      typeof product.expiresAt.toMillis === "function"
        ? product.expiresAt.toMillis()
        : typeof product.expiresAt.seconds === "number"
          ? product.expiresAt.seconds * 1000
          : new Date(product.expiresAt).getTime();

    if (!isNaN(expireTime) && expireTime > 0) {
      return Date.now() > expireTime;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Formats the remaining time until product expiration.
 */
export function getRemainingTime(product) {
  if (!product || !product.expiresAt) return null;
  try {
    const expireTime =
      typeof product.expiresAt.toMillis === "function"
        ? product.expiresAt.toMillis()
        : typeof product.expiresAt.seconds === "number"
          ? product.expiresAt.seconds * 1000
          : new Date(product.expiresAt).getTime();

    if (isNaN(expireTime) || expireTime <= 0) return null;

    const diffMs = expireTime - Date.now();
    if (diffMs <= 0) return "Expired";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m left`;
    }
    return `${mins}m left`;
  } catch {
    return null;
  }
}
