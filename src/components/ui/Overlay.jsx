import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import useFocusTrap from "../../hooks/useFocusTrap";
import { overlayBackdrop } from "../../utils/motion";

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
 * Orchestrated with Motion for React (`motion/react`) AnimatePresence.
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
  backdropClass = "bg-black/50 backdrop-blur-xs",
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
  positionClass = "items-center justify-center p-3 sm:p-4",
}) {
  const idRef = useRef(null);
  const contentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const [isTopmost, setIsTopmost] = useState(false);

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

  // Subscribe to stack changes
  useEffect(() => {
    const listener = () => {
      setIsTopmost(Boolean(idRef.current) && isTopmostOverlay(idRef.current));
    };
    stackListeners.add(listener);
    return () => stackListeners.delete(listener);
  }, []);

  // Register in global stack when open
  useEffect(() => {
    if (!open) return;

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
  }, [open, trapFocus]);

  // Restore focus on close
  useEffect(() => {
    if (open) return;
    if (!restoreFocus || !previouslyFocusedRef.current) return;

    const target = previouslyFocusedRef.current;
    previouslyFocusedRef.current = null;

    if (document.contains(target)) {
      requestAnimationFrame(() => target.focus?.());
    }
  }, [open, restoreFocus]);

  // Escape-to-close for topmost overlay
  useEffect(() => {
    if (!open || !closeOnEscape || !isTopmost) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose("escape");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, isTopmost, requestClose]);

  useBodyScrollLock(open && lockScroll);
  useFocusTrap(contentRef, open && trapFocus && isTopmost);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 flex ${positionClass}`}
          style={{ zIndex }}
        >
          {/* Backdrop animated with Motion */}
          <motion.div
            key="overlay-backdrop"
            variants={overlayBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`absolute inset-0 ${backdropClass}`}
            onClick={() => closeOnBackdrop && requestClose("backdrop")}
            aria-hidden="true"
          />

          {/* Dialog Container */}
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
              ? children({ close: () => requestClose("close") })
              : children}
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
