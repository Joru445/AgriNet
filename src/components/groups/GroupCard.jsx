import { useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import { isCloudinaryUrl, applyTransform } from "../../utils/cloudinaryTransform";

const GROUP_IMG_TF = "w_600,h_400,c_fill,f_auto,q_auto";

const STATUS_STYLES = {
  pending: {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    icon: "ri-time-line",
  },
  approved: {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: "ri-check-line",
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    icon: "ri-close-line",
  },
  removed: {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-600 dark:text-gray-400",
    icon: "ri-forbid-line",
  },
};

function MembershipBadge({ status, t }) {
  if (!status || status === "none") return null;

  const style = STATUS_STYLES[status];
  if (!style) return null;

  const labels = {
    pending: t("groups.pending"),
    approved: t("groups.approved"),
    rejected: t("groups.rejected"),
    removed: t("groups.removed"),
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.text}`}
    >
      <i className={`${style.icon} text-xs`} />
      {labels[status]}
    </span>
  );
}

export default function GroupCard({ group, membershipStatus, showMembership = false }) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const rawImage = group.imageUrl;
  const image =
    imgError || !rawImage
      ? null
      : isCloudinaryUrl(rawImage)
        ? applyTransform(rawImage, GROUP_IMG_TF)
        : rawImage;

  return (
    <Link
      to={`/groups/${group.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-(--agri-border) bg-(--agri-card) shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2D6A4F]/40 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#F0F5F2] dark:bg-(--agri-hover)">
        {image ? (
          <img
            src={image}
            alt={group.name}
            width={600}
            height={400}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <i className="ri-team-line text-4xl text-[#2D6A4F]/20 dark:text-(--agri-brand)/20" />
          </div>
        )}

        {/* Active badge */}
        {group.active === false && (
          <div className="absolute left-2 top-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {t("groups.inactive")}
          </div>
        )}

        {/* Membership badge */}
        {showMembership && membershipStatus && membershipStatus !== "none" && (
          <div className="absolute right-2 top-2">
            <MembershipBadge status={membershipStatus} t={t} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-(--agri-text) line-clamp-1">
            {group.name}
          </h3>
          {group.description && (
            <p className="mt-1 text-xs sm:text-sm text-(--agri-text-muted) line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-(--agri-border-subtle)">
          {showMembership && membershipStatus && membershipStatus !== "none" ? (
            <MembershipBadge status={membershipStatus} t={t} />
          ) : (
            <span className="text-xs text-(--agri-text-muted)">
              {t("groups.viewGroup")}
            </span>
          )}

          <i className="ri-arrow-right-s-line text-lg text-(--agri-text-muted) group-hover:text-[#2D6A4F] dark:group-hover:text-(--agri-brand) transition-colors" />
        </div>
      </div>
    </Link>
  );
}
