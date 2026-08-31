import { useState, useEffect } from "react";

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
      return Date.now() >= expireTime;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Formats the remaining time until product expiration in hours and minutes only (no seconds).
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
    if (diffMs <= 0) return null;

    const totalMinutes = Math.ceil(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const mins = totalMinutes % 60;

    if (days > 0) {
      return hours > 0 ? `${days}d ${hours}h left` : `${days}d left`;
    }
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
    }
    return `${Math.max(1, mins)}m left`;
  } catch {
    return null;
  }
}

/**
 * React Hook for real-time live countdown timer (ticks automatically without page refresh).
 */
export function useLiveRemainingTime(product) {
  const [remainingTime, setRemainingTime] = useState(() =>
    getRemainingTime(product)
  );
  const [isExpired, setIsExpired] = useState(() => isProductExpired(product));

  useEffect(() => {
    if (!product?.expiresAt) {
      setRemainingTime(null);
      setIsExpired(false);
      return;
    }

    const update = () => {
      const time = getRemainingTime(product);
      const expired = isProductExpired(product);
      setRemainingTime(time);
      setIsExpired(expired);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [
    product?.expiresAt,
    typeof product?.expiresAt?.toMillis === "function"
      ? product?.expiresAt?.toMillis()
      : typeof product?.expiresAt?.seconds === "number"
        ? product?.expiresAt?.seconds
        : product?.expiresAt,
  ]);

  return { remainingTime, isExpired };
}
