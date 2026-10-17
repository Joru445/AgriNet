import { useEffect, useRef } from "react";

export const MIN_DIRECTION_DISTANCE = 18;
export const MIN_SWIPE_DISTANCE = 160;
export const MIN_SWIPE_VIEWPORT_RATIO = 0.45;
export const MAX_SWIPE_DISTANCE = 220;
export const HORIZONTAL_INTENT_RATIO = 2;
export const MAX_VERTICAL_DRIFT = 60;
export const EDGE_EXCLUSION_PX = 24;

export function requiredSwipeDistance(viewportWidth = 0) {
  return Math.max(
    MIN_SWIPE_DISTANCE,
    Math.min(viewportWidth * MIN_SWIPE_VIEWPORT_RATIO, MAX_SWIPE_DISTANCE),
  );
}

export function classifySwipeGesture(dx, dy, requiredDistance) {
  return (
    Math.abs(dx) >= requiredDistance &&
    Math.abs(dx) >= Math.abs(dy) * HORIZONTAL_INTENT_RATIO &&
    Math.abs(dy) <= MAX_VERTICAL_DRIFT
  );
}

function findTouch(touches, identifier) {
  return Array.from(touches || []).find((touch) => touch.identifier === identifier);
}

function hasHorizontalOverflow(element) {
  if (!element || element.nodeType !== 1) return false;
  const style = window.getComputedStyle(element);
  return element.scrollWidth > element.clientWidth + 1 || /auto|scroll/.test(style.overflowX);
}

function hasNestedScrollOwner(element, region) {
  let current = element;
  while (current && current !== region) {
    if (hasHorizontalOverflow(current)) return true;
    const style = window.getComputedStyle(current);
    if (current.scrollHeight > current.clientHeight + 1 && /auto|scroll/.test(style.overflowY)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export default function useMobileTabSwipe({ enabled, tabs = [], pathname, navigate }) {
  const stateRef = useRef(null);
  const tabsRef = useRef(tabs);
  useEffect(() => { tabsRef.current = tabs; }, [tabs]);

  useEffect(() => {
    const region = typeof document !== "undefined"
      ? document.querySelector("[data-tab-swipe-region='true']")
      : null;
    if (!enabled || !region || !navigate) return undefined;

    const index = tabs.findIndex((tab) => tab === pathname);
    if (index < 0) return undefined;

    const ignored = (target) => Boolean(target?.closest?.(
      "input,textarea,select,button,a,[contenteditable],[role='button']," +
      "[role='dialog'],[data-swipe-ignore],[data-map],[data-carousel]," +
      "[data-gallery],[data-image-viewer],[data-slider],[data-chart]," +
      "[data-sheet],[data-drawer],[data-horizontal-scroll]",
    ));

    const reset = () => {
      stateRef.current = null;
    };

    const start = (event) => {
      if (event.touches?.length !== 1 || ignored(event.target)) {
        reset();
        return;
      }
      if (hasNestedScrollOwner(event.target, region)) {
        reset();
        return;
      }
      const touch = event.touches[0];
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      if (
        viewportWidth > 0 &&
        (touch.clientX <= EDGE_EXCLUSION_PX || touch.clientX >= viewportWidth - EDGE_EXCLUSION_PX)
      ) {
        reset();
        return;
      }
      stateRef.current = {
        stage: "pending",
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        index,
      };
    };

    const move = (event) => {
      const state = stateRef.current;
      if (!state) return;
      if (event.touches?.length !== 1) {
        state.stage = "rejected";
        return;
      }
      const touch = findTouch(event.touches, state.identifier);
      if (!touch) {
        state.stage = "rejected";
        return;
      }
      if (state.stage === "rejected" || state.stage === "completed") return;

      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_DIRECTION_DISTANCE) return;

      if (
        Math.abs(dy) > MAX_VERTICAL_DRIFT ||
        Math.abs(dx) < Math.abs(dy) * HORIZONTAL_INTENT_RATIO
      ) {
        state.stage = "rejected";
        return;
      }
      state.stage = "horizontal";
    };

    const end = (event) => {
      const state = stateRef.current;
      stateRef.current = null;
      if (!state || state.stage !== "horizontal") return;
      const touch = findTouch(event.changedTouches, state.identifier);
      if (!touch || tabsRef.current[state.index] !== pathname) return;

      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      const requiredDistance = requiredSwipeDistance(viewportWidth);
      if (!classifySwipeGesture(dx, dy, requiredDistance)) return;

      const destination = tabsRef.current[state.index + (dx < 0 ? 1 : -1)];
      if (!destination) return;
      state.stage = "completed";
      navigate(destination);
    };

    region.addEventListener("touchstart", start, { passive: true });
    region.addEventListener("touchmove", move, { passive: true });
    region.addEventListener("touchend", end, { passive: true });
    region.addEventListener("touchcancel", reset, { passive: true });
    return () => {
      reset();
      region.removeEventListener("touchstart", start);
      region.removeEventListener("touchmove", move);
      region.removeEventListener("touchend", end);
      region.removeEventListener("touchcancel", reset);
    };
  }, [enabled, navigate, pathname, tabs]);
}
