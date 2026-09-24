import { useEffect, useId, useRef, useState } from "react";

import Overlay from "./Overlay";

const SWIPE_THRESHOLD = 100;

/**
 * Bottom sheet built on the Overlay foundation.
 *
 * Mobile-first surface that slides up from the bottom edge. Drag-to-dismiss is
 * owned exclusively by the grab region (drag handle + title bar), so the body
 * stays a plain native-scrolling area. Pulling the grab region past the
 * threshold dismisses; otherwise it snaps back.
 *
 * Prop structure:
 *   An animation wrapper handles the open/close slide (CSS animation owns the
 *   wrapper transform), while the inner panel carries the drag transform. This
 *   keeps the exit animation (0 -> 100%, downward) independent from any drag
 *   offset.
 *
 * Props (in addition to Overlay passthroughs handled internally):
 *   open            — boolean
 *   onClose         — invoked when the sheet requests to close
 *   onRequestClose  — optional guard; forwarded to Overlay
 *   title           — visible header title
 *   description     — optional helper text rendered under the title
 *   children        — body content
 *   footer          — optional footer content
 *   maxWidth        — width constraint class (default "max-w-lg")
 *   showCloseButton — render the title bar close button (default true)
 *   closeOnBackdrop — backdrop click closes (default true)
 *   closeOnEscape   — Escape closes (default true)
 *   zIndex          — portal z-index
 *   bodyClassName   — extra classes for the scrollable body wrapper
 *   hideTitleBar    — hide the title bar entirely
 *   duration        — close animation / unmount delay in ms (default 250)
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
  duration = 250,
}) {
  const titleId = useId();

  const [dragY, setDragY] = useState(0);
  const [animatingDrag, setAnimatingDrag] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);

  const showTitleBar = !hideTitleBar && (title || showCloseButton);

  // A fresh open always starts from the bottom with no leftover drag offset.
  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  // Drag only starts from the grab region (handle / title bar). Interactive
  // elements (close button, inputs) are ignored so they keep normal click
  // behaviour instead of dragging the sheet.
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
      // Keep dragY so the downward exit animation continues from where the
      // finger left the sheet; it is reset on the next open.
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
      duration={duration}
    >
      {({ isClosing, close }) => (
        // Animation wrapper: owns the open/close slide only.
        <div
          className={
            isClosing ? "anim-slide-down-out" : "anim-slide-up"
          }
        >
          {/* Drag panel: owns the inline drag transform only. */}
          <div
            style={{
              transform: `translateY(${dragY}px)`,
              transition: animatingDrag ? "none" : "transform 0.25s ease",
            }}
            className={`relative mx-auto flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-(--agri-card) shadow-2xl pointer-events-auto safe-area-pb ${maxWidth}`}
          >
            {/* Grab region — the only part of the sheet that initiates drag. */}
            <div
              onPointerDown={handleGrabPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              className="shrink-0 touch-none select-none"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-(--agri-border)" />
              </div>

              {showTitleBar && (
                <div className="flex shrink-0 items-center justify-between border-b border-(--agri-border-subtle) px-5 py-3">
                  <div>
                    {title && (
                      <h2 id={titleId} className="text-lg font-bold text-(--agri-text)">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-0.5 text-sm text-(--agri-text-secondary)">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close"
                      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--agri-text-muted) transition-colors cursor-pointer hover:bg-(--agri-hover) hover:text-(--agri-text-secondary)"
                    >
                      <i className="ri-close-line text-xl" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Body: plain native scroll, no pointer handlers. */}
            <div
              className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${
                bodyClassName || "p-2 px-4"
              }`}
            >
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-(--agri-border-subtle) px-5 py-4">
                {typeof footer === "function" ? footer({ close }) : footer}
              </div>
            )}
          </div>
        </div>
      )}
    </Overlay>
  );
}
