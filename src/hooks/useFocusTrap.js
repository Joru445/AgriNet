import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Entire focus trap for visible focusables inside `ref`.
 *
 * Wraps Tab / Shift+Tab around the first and last focusable element so
 * keyboard users stay inside the overlay.
 *
 * @param {import("react").RefObject<HTMLElement|null>} ref
 * @param {boolean} active
 */
export default function useFocusTrap(ref, active = true) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e) {
      if (e.key !== "Tab") return;

      const container = ref.current;
      if (!container) return;

      const focusables = [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, ref]);
}