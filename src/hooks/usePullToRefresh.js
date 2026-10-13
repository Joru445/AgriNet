import { useEffect, useState } from "react";

/** Refreshes marketplace data only. Listens to the actual nested app scroller. */
export default function usePullToRefresh(onRefresh, enabled = true) {
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scroller = document.querySelector("[data-app-scroll]");
    if (!scroller) return;
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let active = false;
    let pulled = 0;
    const blocked = (target) => Boolean(target.closest("input,textarea,select,[contenteditable],button,[role='dialog'],[data-pull-ignore]"));
    const start = (event) => {
      if (event.touches.length !== 1 || scroller.scrollTop > 0 || blocked(event.target) || !event.target.closest("[data-marketplace-root]")) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      active = true; dragging = false; pulled = 0;
    };
    const move = (event) => {
      if (!active || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (scroller.scrollTop > 0 || dy < 0 || Math.abs(dx) > Math.abs(dy) * 0.8) {
        active = false; setDistance(0); return;
      }
      if (dy > 12) {
        dragging = true;
        pulled = Math.min(110, (dy - 12) * 0.55);
        if (event.cancelable) event.preventDefault();
        setDistance(pulled);
      }
    };
    const end = () => {
      if (active && dragging && pulled >= 72) Promise.resolve(onRefresh()).catch(() => {});
      active = false; dragging = false; pulled = 0; setDistance(0);
    };
    scroller.addEventListener("touchstart", start, { passive: true });
    scroller.addEventListener("touchmove", move, { passive: false });
    scroller.addEventListener("touchend", end, { passive: true });
    scroller.addEventListener("touchcancel", end, { passive: true });
    return () => {
      scroller.removeEventListener("touchstart", start);
      scroller.removeEventListener("touchmove", move);
      scroller.removeEventListener("touchend", end);
      scroller.removeEventListener("touchcancel", end);
    };
  }, [onRefresh, enabled]);
  return { pullDistance: distance };
}
