import { useEffect, useRef, useState } from "react";

/**
 * Pull-to-refresh for one page section inside the shared app scroller.
 * The section boundary prevents gestures in dialogs, maps, and other pages
 * from refreshing a different screen. Reduced-motion users still get the
 * gesture; only transition styles are left to the caller.
 */
export default function useSectionPullToRefresh({
  sectionRef,
  onRefresh,
  enabled = true,
  threshold = 72,
  maxDistance = 110,
  scrollRootSelector = "[data-app-scroll]",
} = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const distanceRef = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const callbackRef = useRef(onRefresh);
  useEffect(() => { callbackRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const section = sectionRef?.current;
    const scroller = typeof document !== "undefined"
      ? document.querySelector(scrollRootSelector)
      : null;
    if (!enabled || !section || !scroller) return undefined;

    let startX = 0;
    let startY = 0;
    let lastY = 0;
    let pulling = false;
    let horizontal = false;
    let claimed = false;

    const ignored = (target) => Boolean(target?.closest?.(
      "input,textarea,select,button,a,[contenteditable]," +
      "[role='dialog'],[data-pull-ignore],[data-map],[data-carousel],[data-sheet]",
    ));

    const getBoundary = (target) => target?.closest?.("[data-pull-scroll]") || scroller;

    const onStart = (event) => {
      const boundary = getBoundary(event.target);
      if (event.touches?.length !== 1 || boundary?.scrollTop > 0) return;
      if (!section.contains(event.target) || ignored(event.target)) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      lastY = startY;
      pulling = true;
      horizontal = false;
      claimed = false;
      distanceRef.current = 0;
    };

    const onMove = (event) => {
      if (!pulling || event.touches?.length !== 1) return;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (dy > 8 && event.touches[0].clientY < lastY - 4) {
        resetGesture();
        return;
      }
      lastY = event.touches[0].clientY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 0.8) {
        horizontal = true;
        claimed = false;
        distanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      if (horizontal || dy <= 8) return;
      claimed = true;
      const distance = Math.min(maxDistance, dy);
      distanceRef.current = distance;
      setPullDistance(distance);
      if (distance > 0) event.preventDefault();
    };

    const resetGesture = () => {
      pulling = false;
      horizontal = false;
      claimed = false;
      distanceRef.current = 0;
      setPullDistance(0);
    };

    const onEnd = () => {
      if (!pulling) return;
      const distance = distanceRef.current;
      pulling = false;
      if (horizontal) {
        horizontal = false;
        claimed = false;
        distanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      horizontal = false;
      distanceRef.current = 0;
      setPullDistance(0);
      if (!claimed || distance < threshold || refreshingRef.current) return;
      claimed = false;
      refreshingRef.current = true;
      setRefreshing(true);
      Promise.resolve().then(() => callbackRef.current?.()).catch(() => {}).finally(() => {
        refreshingRef.current = false;
        setRefreshing(false);
      });
    };

    section.addEventListener("touchstart", onStart, { passive: true });
    section.addEventListener("touchmove", onMove, { passive: false });
    section.addEventListener("touchend", onEnd, { passive: true });
    section.addEventListener("touchcancel", resetGesture, { passive: true });
    return () => {
      resetGesture();
      section.removeEventListener("touchstart", onStart);
      section.removeEventListener("touchmove", onMove);
      section.removeEventListener("touchend", onEnd);
      section.removeEventListener("touchcancel", resetGesture);
    };
  }, [enabled, maxDistance, scrollRootSelector, sectionRef, threshold]);

  return { pullDistance, refreshing };
}
