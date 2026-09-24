import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";

/**
 * Locks scrolling on document.body while active.
 *
 * Safe for nested overlays: a module-level counter keeps the page locked
 * until every consumer has released its lock, then the original overflow
 * value is restored.
 *
 * @param {boolean} active Whether the lock should be applied.
 */
export default function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    if (lockCount === 1) {
      originalOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        originalOverflow = "";
      }
    };
  }, [active]);
}