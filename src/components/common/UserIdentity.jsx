import { useState } from "react";
import { getInitials } from "../../utils/getInitials";
import { applyTransform, isCloudinaryUrl } from "../../utils/cloudinaryTransform";
import { useLanguage } from "../../context/LanguageContext";

const SIZE_CONFIG = {
  sm: {
    image: "h-8 w-8",
    name: "text-sm",
    username: "text-xs",
    badge: "text-sm",
    px: 32,
    tf: "w_64,h_64,c_fill,f_auto,q_auto",
  },
  md: {
    image: "h-10 w-10",
    name: "text-sm",
    username: "text-xs",
    badge: "text-base",
    px: 40,
    tf: "w_80,h_80,c_fill,f_auto,q_auto",
  },
  lg: {
    image: "h-12 w-12",
    name: "text-base",
    username: "text-sm",
    badge: "text-lg",
    px: 48,
    tf: "w_96,h_96,c_fill,f_auto,q_auto",
  },
};

export default function UserIdentity({
  user,
  currentUserId,
  size = "md",
  onlyPic = false,
  showUsername = true,
  showRole = false,
  showVerified = true,
  colorWhite = false,
  className = "",
}) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  if (!user) return null;

  const isCurrentUser = currentUserId && user.uid === currentUserId;
  const isVerified = showVerified && user.verified === true;
  const currentSize = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const roleLabel = user.role ? t(`roles.${user.role}`) : "";

  const showImage = user.profilePicture && !imgError;
  const imageSrc = showImage && isCloudinaryUrl(user.profilePicture)
    ? applyTransform(user.profilePicture, currentSize.tf)
    : user.profilePicture;

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      {showImage ? (
        <img
          src={imageSrc}
          alt={user.fullname}
          width={currentSize.px}
          height={currentSize.px}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className={`${currentSize.image} shrink-0 rounded-full object-cover`}
        />
      ) : (
        <div className={`flex ${currentSize.image} shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-sm font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)]`}>
          {getInitials(user.fullname)}
        </div>
      )}
      {!onlyPic && (
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p
              className={`truncate font-semibold ${currentSize.name} ${colorWhite ? "text-white" : "text-[var(--agri-text)]"}`}
              title={user.fullname}
            >
              {user.fullname || t("common.unknownUser")}
            </p>

            {isVerified && (
              <span
                title={t("common.verifiedFarmer")}
                aria-label={t("common.verifiedFarmer")}
                className={`inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-[var(--agri-brand)] ${currentSize.badge}`}
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}

            {isCurrentUser && (
              <span className="shrink-0 rounded-full bg-[var(--agri-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--agri-text-muted)]">
                {t("common.you")}
              </span>
            )}
          </div>

          {showUsername && user.username && (
            <p className={`truncate ${currentSize.username} ${colorWhite ? "text-white/60" : "text-[var(--agri-text-muted)]"} `}>
              @{user.username}
            </p>
          )}

          {showRole && user.role && (
            <p className={`truncate ${currentSize.username} ${colorWhite ? "text-white/60" : "text-[var(--agri-text-muted)]"}`}>
              {roleLabel}
            </p>
          )}
        </div>)}
    </div>
  );
}
