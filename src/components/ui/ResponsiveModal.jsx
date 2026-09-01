import { useCallback, useEffect, useRef, useState } from "react";

export default function ResponsiveModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = true,
}) {
  const drawerRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  // Animation state: keeps component mounted during exit animation
  const [shouldRender, setShouldRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setAnimating(false);
    } else if (shouldRender) {
      // Start exit animation
      setAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldRender]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleTouchStart = useCallback((e) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - dragStartY.current;

    if (deltaY > 0) {
      setDragY(deltaY);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    if (dragY > 100) {
      onClose();
    }

    setDragY(0);
  }, [dragY, onClose]);

  if (!shouldRender) return null;

  const isClosing = animating;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 ${isClosing ? "anim-fade-out" : "anim-fade-in"}`}
        onClick={onClose}
      />

      {/* Desktop: centered modal */}
      <div className="hidden lg:fixed lg:inset-0 lg:z-[9999] lg:flex lg:items-center lg:justify-center lg:p-4">
        <div
          className={`relative w-full ${maxWidth} rounded-2xl bg-[var(--agri-card)] shadow-2xl ${isClosing ? "anim-fade-out" : "anim-scale-in"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-[var(--agri-border-subtle)] px-5 py-4">
              {title && (
                <h2 className="text-lg font-bold text-[var(--agri-text)]">{title}</h2>
              )}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition-colors hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text-secondary)] cursor-pointer"
                  aria-label="Close"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>

      {/* Mobile: bottom drawer */}
      <div className="fixed inset-0 z-[9999] lg:hidden flex items-end">
        <div
          className={`absolute inset-0 bg-black/40 ${isClosing ? "anim-fade-out" : "anim-fade-in"}`}
          onClick={onClose}
        />

        <div
          ref={drawerRef}
          className={`relative w-full rounded-t-3xl bg-[var(--agri-card)] shadow-2xl ${isClosing ? "anim-slide-down-out" : "anim-slide-up"}`}
          style={{
            transform: isClosing
              ? undefined
              : `translateY(${isDragging ? dragY : 0}px)`,
            transition: isDragging ? "none" : undefined,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-[var(--agri-border)]" />
          </div>

          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-[var(--agri-border-subtle)] px-5 py-3">
              {title && (
                <h2 className="text-lg font-bold text-[var(--agri-text)]">{title}</h2>
              )}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition-colors hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text-secondary)] cursor-pointer"
                  aria-label="Close"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
