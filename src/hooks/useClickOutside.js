import { useEffect, useRef } from "react";

/**
 * Calls `handler` when a pointer event lands outside the ref(s).
 *
 * Shared implementation for popovers, menus and dropdowns that need
 * dismiss-on-click-outside behavior without reimplementing the listener
 * plumbing in every feature component.
 *
 * @param {import("react").RefObject<HTMLElement|null>|Array<import("react").RefObject<HTMLElement|null>>} ref
 * @param {(event: Event) => void} handler
 * @param {boolean} active
 */
export default function useClickOutside(ref, handler, active = true) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return;

    const refs = Array.isArray(ref) ? ref : [ref];

    function handlePointerDown(e) {
      const inside = refs.some(
        (item) => item.current && item.current.contains(e.target),
      );
      if (!inside) {
        handlerRef.current?.(e);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [active, ref]);
}