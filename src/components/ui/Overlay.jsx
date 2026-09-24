import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import useFocusTrap from "../../hooks/useFocusTrap";

const overlayStack = [];
const stackListeners = new Set();

function registerOverlay(id) {
  overlayStack.push(id);
  stackListeners.forEach((listener) => listener());
}

function unregisterOverlay(id) {
  const index = overlayStack.indexOf(id);
  if (index !== -1) {
    overlayStack.splice(index, 1);
    stackListeners.forEach((listener) => listener());
  }
}

function isTopmostOverlay(id) {
  return overlayStack.length > 0 && overlayStack[overlayStack.length - 1] === id;
}

let overlayIdCounter = 0;

function nextOverlayId() {
  overlayIdCounter += 1;
  return `overlay-${overlayIdCounter}`;
}

const DEFAULT_Z_INDEX = 9999;

/**
 * Canonical overlay foundation used by Modal and Sheet.
 *
 * Owns everything an overlay must behave identically for:
 * - portal to document.body
 * - backdrop rendering
 * - click-outside-to-close (backdrop click)
 * - Escape-to-close
 * - body scroll lock (nesting-safe)
 * - focus restoration on close
 * - focus trap while open
 * - accessible dialog semantics
 * - consistent z-index
 * - open/close animation lifecycle
 *
 * The visual surface (centered modal vs bottom sheet) is supplied by the
 * caller through the children render-prop, which receives `isClosing` and a
 * `close` function.
 *
 * Props:
 *   open            — boolean
 *   onClose         — invoked when the overlay requests to close
 *   onRequestClose  — optional (reason) => void guard; when provided it is
 *                     used instead of onClose so the feature can decide
 *   closeOnBackdrop — allow backdrop click close (default true)
 *   closeOnEscape   — allow Escape close (default true)
 *   lockScroll      — lock body scroll while open (default true)
 *   trapFocus       — keep focus inside the overlay (default true)
 *   restoreFocus    — restore focus to the previously focused element
 *   zIndex          — numeric z-index for the portal root
 *   backdropClass   — Tailwind classes for the backdrop tint
 *   ariaLabel       — aria-label applied to the dialog
 *   children        — render prop ({ isClosing, close }) => ReactNode
 */
export default function Overlay({
  open,
  onClose,
  onRequestClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  lockScroll = true,
  trapFocus = true,
  restoreFocus = true,
  zIndex = DEFAULT_Z_INDEX,
  backdropClass = "bg-black/40",
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
  duration = 200,
  positionClass = "items-center justify-center p-3 sm:p-4",
}) {
  const idRef = useRef(null);
  const contentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const [isTopmost, setIsTopmost] = useState(false);

  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = useCallback(
    (reason) => {
      if (typeof onRequestClose === "function") {
        onRequestClose(reason);
      } else if (typeof onClose === "function") {
        onClose();
      }
    },
    [onRequestClose, onClose],
  );

  // Mount / exit-animation lifecycle. The overlay stays mounted for
  // `duration` ms during the exit animation so it can fade/slide out.
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender, duration]);

  // Subscribe to stack changes so Escape / focus-trap know whether this
  // overlay is currently the top-most one.
  useEffect(() => {
    const listener = () => {
      setIsTopmost(Boolean(idRef.current) && isTopmostOverlay(idRef.current));
    };
    stackListeners.add(listener);
    return () => stackListeners.delete(listener);
  }, []);

  // Register in the global stack while open so Escape only closes the
  // top-most overlay. Capture focus and remember what to restore.
  useEffect(() => {
    if (!shouldRender || isClosing) return;

    idRef.current = idRef.current || nextOverlayId();
    registerOverlay(idRef.current);
    previouslyFocusedRef.current = document.activeElement;

    if (trapFocus && contentRef.current) {
      const container = contentRef.current;
      const firstFocusable = container.querySelector(
        "input, select, textarea, button, [href], [tabindex]",
      );
      if (firstFocusable && firstFocusable !== document.activeElement) {
        firstFocusable.focus();
      } else if (container !== document.activeElement) {
        container.focus();
      }
    }

    return () => {
      if (idRef.current) {
        unregisterOverlay(idRef.current);
        idRef.current = null;
      }
    };
  }, [shouldRender, isClosing, trapFocus]);

  // Restore focus to the previously focused element once fully closed.
  useEffect(() => {
    if (shouldRender) return;
    if (!restoreFocus || !previouslyFocusedRef.current) return;

    const target = previouslyFocusedRef.current;
    previouslyFocusedRef.current = null;

    if (document.contains(target)) {
      requestAnimationFrame(() => target.focus?.());
    }
  }, [shouldRender, restoreFocus]);

  // Escape-to-close, only for the top-most overlay.
  useEffect(() => {
    if (!shouldRender || isClosing || !closeOnEscape) return;
    if (!isTopmost) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose("escape");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shouldRender, isClosing, closeOnEscape, isTopmost, requestClose]);

  useBodyScrollLock(shouldRender && lockScroll);
  useFocusTrap(
    contentRef,
    shouldRender && !isClosing && trapFocus && isTopmost,
  );

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex ${positionClass}`}
      style={{ zIndex }}
    >
      <div
        className={`absolute inset-0 ${backdropClass} ${
          isClosing ? "anim-fade-out" : "anim-fade-in"
        }`}
        style={{ animationDuration: `${duration}ms` }}
        onClick={() => closeOnBackdrop && requestClose("backdrop")}
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className="relative w-full pointer-events-none outline-none"
      >
        {typeof children === "function"
          ? children({ isClosing, close: () => requestClose("close") })
          : children}
      </div>
    </div>,
    document.body,
  );
}