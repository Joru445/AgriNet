import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import productPlaceholder from "../../../assets/img/productPlaceholder.png";

const DEFAULT_ASPECT = 4 / 3;

/**
 * Reusable message image with a stable-aspect-ratio loading skeleton,
 * graceful error fallback, and click-to-preview (lightbox).
 *
 * - The <img> is always mounted so it reports onLoad/onError.
 * - A skeleton is layered behind the image and revealed until the image
 *   loads, preventing layout shift and deadlock (img never "loading-only").
 * - Locks the container's aspect ratio to the real image dimensions once
 *   known (or the passed width/height), so re-renders don't shift layout.
 * - Shows a graceful placeholder on error.
 * - Supports light and dark mode via theme tokens.
 */
export default function MessageImage({
  src,
  alt,
  width,
  height,
  onLightbox,
  className = "",
  imageClassName = "",
  eager = false,
  loading = false,
}) {
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [naturalSize, setNaturalSize] = useState(null);

  const knownRatio = width && height ? width / height : null;
  const naturalRatio =
    naturalSize && naturalSize.height ? naturalSize.width / naturalSize.height : null;

  const ratio = knownRatio || naturalRatio || DEFAULT_ASPECT;

  // Pure skeleton while `loading` (real src not available yet).
  if (loading || (src === null && !error)) {
    return (
      <div
        className={`relative w-full overflow-hidden ${className}`}
        style={{ aspectRatio: String(ratio) }}
      >
        <div className="absolute inset-0 animate-pulse rounded-xl bg-[var(--agri-hover)]" />
      </div>
    );
  }

  const effectiveSrc = error ? productPlaceholder : src || productPlaceholder;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: String(ratio) }}
    >
      {/* Skeleton backdrop */}
      {!error && (
        <div
          className={[
            "absolute inset-0 animate-pulse bg-[var(--agri-hover)] transition-opacity duration-300",
            loaded ? "opacity-0 pointer-events-none" : "opacity-100",
          ].join(" ")}
        />
      )}

      <img
        src={effectiveSrc}
        alt={error ? t("messages.imageError") : alt}
        loading={eager ? "eager" : "lazy"}
        onLoad={(e) => {
          const el = e.currentTarget;
          if (!error && el.naturalWidth && el.naturalHeight) {
            setNaturalSize({ width: el.naturalWidth, height: el.naturalHeight });
          }
          if (!error) setLoaded(true);
        }}
        onError={() => setError(true)}
        onClick={() => {
          if (loaded && !error && onLightbox) onLightbox();
        }}
        className={[
          "relative z-10 h-full w-full object-cover rounded-none transition-opacity duration-300",
          error
            ? "opacity-60"
            : loaded
              ? "opacity-100 cursor-pointer"
              : "opacity-0",
          imageClassName,
        ].join(" ")}
      />
    </div>
  );
}