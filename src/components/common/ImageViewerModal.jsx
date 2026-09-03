import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Reusable full-screen zoomable Image Viewer Modal (Lightbox).
 *
 * Supports:
 * - Zoom in / Zoom out (+/- buttons)
 * - Mouse wheel zooming
 * - Double-click / Double-tap zoom toggle (1x <-> 2.5x)
 * - Pinch-to-zoom on touch devices
 * - Pan / Drag when zoomed in
 * - Keyboard shortcuts (Esc to close, + / - to zoom, 0 to reset)
 * - Clean translucent backdrop and floating toolbar
 */
export default function ImageViewerModal({
  isOpen,
  src,
  imageUrl,
  alt,
  title,
  onClose,
}) {
  const { t } = useLanguage();
  const imageSrc = src || imageUrl;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const lastTouchDistanceRef = useRef(null);
  const lastTapRef = useRef(0);

  // Reset zoom & position whenever a new image opens or modal closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageSrc]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(5, Math.round((prev + 0.5) * 10) / 10));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(1, Math.round((prev - 0.5) * 10) / 10);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, zoomIn, zoomOut, resetZoom]);

  // Double click or double tap toggle (1x <-> 2.5x)
  const handleToggleZoom = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setScale((prev) => {
      const next = Math.min(5, Math.max(1, prev + delta));
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers (Drag & Pinch-to-zoom)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Check for double-tap
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleToggleZoom(e);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      }
    } else if (e.touches.length === 2) {
      // Pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      lastTouchDistanceRef.current = distance;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const delta = (distance - lastTouchDistanceRef.current) * 0.01;

      setScale((prev) => {
        const next = Math.min(5, Math.max(1, prev + delta));
        if (next === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });

      lastTouchDistanceRef.current = distance;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      lastTouchDistanceRef.current = null;
    }
  };

  if (!isOpen || !imageSrc) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm select-none p-2 sm:p-6"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Top Floating Control Bar */}
      <div
        className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title or Info if provided */}
        <div className="pointer-events-auto flex items-center gap-2 max-w-[50%]">
          {title && (
            <span className="truncate rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white/90 shadow-lg border border-white/10">
              {title}
            </span>
          )}
        </div>

        {/* Zoom Controls & Close Button */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Percentage Badge */}
          <span className="hidden sm:inline-flex items-center rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white/80 border border-white/10 shadow-lg">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg hover:bg-white/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t("imageViewer.zoomOut")}
          >
            <i className="ri-zoom-out-line text-base font-semibold" />
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 5}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg hover:bg-white/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t("imageViewer.zoomIn")}
          >
            <i className="ri-zoom-in-line text-base font-semibold" />
          </button>

          {/* Reset Zoom Button */}
          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title={t("imageViewer.resetZoom")}
            >
              <i className="ri-restart-line text-base font-semibold" />
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white border border-white/20 hover:bg-white/30 active:scale-95 transition cursor-pointer shadow-lg ml-1"
            title={t("imageViewer.close")}
          >
            <i className="ri-close-line text-xl font-bold" />
          </button>
        </div>
      </div>

      {/* Main Zoomable Image Canvas */}
      <div
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt={alt || t("imageViewer.imagePreviewAlt")}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleToggleZoom}
          draggable={false}
          className={`max-h-[88vh] max-w-[92vw] object-contain rounded-xl shadow-2xl transition-transform ${
            isDragging ? "transition-none" : "duration-200 ease-out"
          } ${
            scale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Mobile Double-tap Hint */}
      {scale === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-70 hover:opacity-100 transition">
          <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-[11px] font-medium text-white/80 shadow-md border border-white/10">
            {t("imageViewer.doubleClickHint")}
          </span>
        </div>
      )}
    </div>,
    document.body
  );
}
