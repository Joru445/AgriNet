import { useEffect, useRef, useState } from "react";

/**
 * Detects a horizontal swipe-to-reveal gesture (used for reply) on a message
 * row, using Pointer Events — no external gesture library.
 *
 * - Primarily horizontal swipes; small movements are ignored (slop).
 * - If vertical movement exceeds horizontal, the gesture is treated as
 *   scrolling and handed back to the container (it is never handled).
 * - Once the axis is decided as horizontal, the gesture is locked and the
 *   row is translated with resistance up to a capped distance, revealing an
 *   action (e.g. Reply) that lives behind/alongside the row.
 * - Triggering is left to the caller: on release, if the revealed distance
 *   reached the threshold, `onReply` is called; the row then animates back.
 * - Respects `prefers-reduced-motion` by disabling the return animation.
 *
 * It does NOT reach into reply state or message logic, so it can be reused
 * and `useMessages` keeps no gesture responsibilities.
 */

const SLOP = 6; // px of allowable movement before deciding the axis
const MAX_REVEAL = 72; // px the row may travel at most
const THRESHOLD = 44; // Reveal distance (or ratio) that arms "Reply"

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function useSwipeToReply({ enabled = false, direction = "right", onReply }) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);

  const startRef = useRef(null);
  const axisRef = useRef(null);
  const armedRef = useRef(false);

  const enabledRef = useRef(enabled);
  const directionRef = useRef(direction);
  const onReplyRef = useRef(onReply);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    onReplyRef.current = onReply;
  }, [onReply]);

  const resolveReveal = (dx) => {
    const base = directionRef.current === "left" ? -dx : dx;
    if (base <= 0) return 0;
    // Diminishing resistance: easy near 0, progressively harder near the cap.
    const t = Math.min(base / MAX_REVEAL, 1);
    const resisted = MAX_REVEAL * (1 - Math.pow(1 - t, 2.2));
    return directionRef.current === "left" ? -resisted : resisted;
  };

  const handlePointerDown = (e) => {
    if (!enabledRef.current) return;
    // Single primary pointer / touch only.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    startRef.current = { x: e.clientX, y: e.clientY };
    axisRef.current = null;
    armedRef.current = false;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!startRef.current) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (!axisRef.current) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll — stop engaging.
        axisRef.current = "y";
        setOffset(0);
        setDragging(false);
        startRef.current = null;
        return;
      }
      if (Math.abs(dx) >= SLOP) {
        axisRef.current = "x";
      } else {
        return;
      }
    }

    if (axisRef.current !== "x") return;

    if (e.cancelable) e.preventDefault();

    const base = directionRef.current === "left" ? -dx : dx;
    const next = resolveReveal(dx);
    setOffset(next);
    armedRef.current = base >= THRESHOLD;
  };

  const finish = (e) => {
    if (!startRef.current) return;
    const shouldReply = armedRef.current && axisRef.current === "x";
    resetAndRelease(e);
    if (shouldReply) onReplyRef.current?.();
  };

  const resetAndRelease = (e) => {
    if (e && e.currentTarget) {
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    startRef.current = null;
    axisRef.current = null;
    armedRef.current = false;
    setOffset(0);
    setDragging(false);
  };

  const bind = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: finish,
    onPointerCancel: resetAndRelease,
  };

  return { bind, offset, dragging };
}

export { prefersReducedMotion };