import { useState } from "react";
import { getInitials } from "../../utils/getInitials";
import { applyTransform, AVATAR_MD_TF, isCloudinaryUrl } from "../../utils/cloudinaryTransform";

const SIZE_MAP = {
  xs: { container: "h-8 w-8 text-xs", px: 32 },
  sm: { container: "h-10 w-10 text-xs", px: 40 },
  md: { container: "h-14 w-14 text-lg", px: 56 },
  lg: { container: "h-20 w-20 text-2xl", px: 80 },
  xl: { container: "h-28 w-28 text-3xl", px: 112 },
};

export default function Avatar({ src, name, size = "md", className = "", onClick }) {
  const [imgError, setImgError] = useState(false);
  const { container: sizeClass, px } = SIZE_MAP[size] || SIZE_MAP.md;

  const showImage = src && !imgError;
  const imageSrc = showImage && isCloudinaryUrl(src)
    ? applyTransform(src, AVATAR_MD_TF)
    : src;

  const clickAttrs = onClick
    ? {
        onClick: (e) => {
          e.stopPropagation();
          onClick(e);
        },
        className: `cursor-pointer ${className}`,
      }
    : { className };

  if (showImage) {
    return (
      <img
        src={imageSrc}
        alt={name || "User"}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover object-top ${clickAttrs.className}`}
        {...(onClick ? { onClick: clickAttrs.onClick } : {})}
      />
    );
  }

  return (
    <div
      className={`
        flex shrink-0 items-center justify-center
        rounded-full
        bg-[#D8F3DC] dark:bg-(--agri-brand-bg)
        font-semibold text-[#2D6A4F] dark:text-(--agri-brand)
        ${sizeClass}
        ${clickAttrs.className}
      `}
      aria-label={name || "User"}
      {...(onClick ? { onClick: clickAttrs.onClick } : {})}
    >
      {getInitials(name)}
    </div>
  );
}
