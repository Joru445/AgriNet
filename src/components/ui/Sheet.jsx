import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";

import Overlay from "./Overlay";
import { sheetBottomMotion } from "../../utils/motion";

const SWIPE_THRESHOLD = 100;

/**
 * Bottom sheet built on the Overlay foundation.
 * Mobile-first surface that slides up from the bottom edge using Motion for React.
 */
export default function Sheet({
  open,
  onClose,
  onRequestClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-lg",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  zIndex,
  ariaLabel,
  bodyClassName = "",
  hideTitleBar = false,
}) {
  const titleId = useId();

  const [dragY, setDragY] = useState(0);
  const [animatingDrag, setAnimatingDrag] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);

  const showTitleBar = !hideTitleBar && (title || showCloseButton);

  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  const handleGrabPointerDown = (e) => {
    if (e.target.closest?.("button, a, input, textarea, select, label")) return;
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setAnimatingDrag(true);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - dragStartYRef.current;
    if (deltaY > 0) setDragY(deltaY);
  };

  const handlePointerEnd = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setAnimatingDrag(false);
    const deltaY = e.clientY - dragStartYRef.current;
    if (deltaY > SWIPE_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      onRequestClose={onRequestClose}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      zIndex={zIndex}
      ariaLabel={ariaLabel ?? (title || "Sheet")}
      ariaLabelledBy={title ? titleId : undefined}
      positionClass="items-end justify-center p-0"
    >
      {({ close }) => (
        <motion.div
          key="sheet-panel-wrapper"
          variants={sheetBottomMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full flex justify-center pointer-events-none"
        >
          <div
            style={{
              transform: `translateY(${dragY}px)`,
              transition: animatingDrag ? "none" : "transform 0.22s ease",
            }}
            className={`relative mx-auto flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border-t border-x border-(--agri-border) bg-(--agri-card) shadow-2xl pointer-events-auto safe-area-pb ${maxWidth}`}
          >
            {/* Grab region */}
            <div
              onPointerDown={handleGrabPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              className="shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
            >
              <div className="flex justify-center pt-3 pb-1.5">
                <div className="h-1.5 w-12 rounded-full bg-(--agri-border) opacity-80" />
              </div>

              {showTitleBar && (
                <div className="flex items-center justify-between border-b border-(--agri-border-subtle) px-5 pb-3">
                  <div>
                    {title && (
                      <h2
                        id={titleId}
                        className="text-lg font-bold text-(--agri-text)"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-0.5 text-xs text-(--agri-text-secondary)">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close"
                      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--agri-text-muted) transition-colors cursor-pointer hover:bg-(--agri-hover) hover:text-(--agri-text)"
                    >
                      <i className="ri-close-line text-xl" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable content body */}
            <div
              className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${
                bodyClassName || "p-4"
              }`}
            >
              {children}
            </div>

            {/* Optional footer */}
            {footer && (
              <div className="shrink-0 border-t border-(--agri-border-subtle) px-5 py-3">
                {typeof footer === "function" ? footer({ close }) : footer}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Overlay>
  );
}
