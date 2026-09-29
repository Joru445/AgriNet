import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import { auth } from "../../firebase/auth";
import * as pageCache from "../../utils/pageCache";
import { isCloudinaryUrl, applyTransform } from "../../utils/cloudinaryTransform";
import { getGroupMemberCount } from "../../services/group.service";

const GROUP_IMG_TF = "w_600,h_400,c_fill,f_auto,q_auto";

const STATUS_STYLES = {
  pending: {
    badge: "bg-amber-500/95 text-white border-amber-300/40 shadow-amber-950/20",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: "ri-time-line",
  },
  approved: {
    badge: "bg-emerald-600/95 text-white border-emerald-300/40 shadow-emerald-950/20",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    icon: "ri-checkbox-circle-fill",
  },
  rejected: {
    badge: "bg-red-600/95 text-white border-red-300/40 shadow-red-950/20",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    icon: "ri-close-circle-fill",
  },
  removed: {
    badge: "bg-gray-800/95 text-white border-white/20 shadow-black/40",
    chip: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    icon: "ri-forbid-line",
  },
};

export default function GroupCard({
  group,
  membershipStatus,
  showMembership = false,
  membershipLoading = false,
}) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [fetchedCount, setFetchedCount] = useState(() => {
    if (typeof group.memberCount === "number") return group.memberCount;
    if (Array.isArray(group.members)) return group.members.length;
    return null;
  });

  const rawImage = group.imageUrl;
  const image =
    imgError || !rawImage
      ? null
      : isCloudinaryUrl(rawImage)
        ? applyTransform(rawImage, GROUP_IMG_TF)
        : rawImage;

  useEffect(() => {
    let cancelled = false;

    if (group.id && fetchedCount == null) {
      getGroupMemberCount(group.id)
        .then((count) => {
          if (!cancelled && typeof count === "number") {
            setFetchedCount(count);
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [group.id, fetchedCount]);

  const resolvedStatus = (() => {
    if (membershipStatus && membershipStatus !== "none") return membershipStatus;
    if (!showMembership) return null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(`pending_app_${group.id}_`)) {
          return "pending";
        }
      }
    } catch {}
    try {
      const authUser = auth.currentUser;
      if (authUser?.uid) {
        const cachedApp = pageCache.get(`approvedUserGroups:${authUser.uid}`);
        if (Array.isArray(cachedApp)) {
          const match = cachedApp.some(
            (g) => String(g.groupId || g.id) === String(group.id),
          );
          if (match) return "approved";
        }
        const myAll = pageCache.get(`my_memberships_${authUser.uid}`);
        if (Array.isArray(myAll)) {
          const found = myAll.find((m) => String(m.groupId).trim() === String(group.id).trim());
          if (found?.status) return found.status;
        }
      }
    } catch {}
    return membershipStatus;
  })();

  const baseCount = fetchedCount ?? group.memberCount ?? group.members?.length ?? 0;
  const memberCount = resolvedStatus === "approved" ? Math.max(baseCount, 1) : baseCount;
  const locationStr =
    typeof group.location === "object"
      ? group.location?.city || group.location?.address
      : group.city || group.location;

  return (
    <Link
      to={`/groups/${group.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) shadow-md shadow-black/5 dark:shadow-black/25 hover:shadow-xl hover:shadow-[#2D6A4F]/10 dark:hover:shadow-black/40 hover:-translate-y-1 hover:border-[#2D6A4F]/50 dark:hover:border-emerald-500/50 transition-all duration-300"
    >
      {/* Image with subtle gradient shadow overlay for badge/text readability */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F0F5F2] dark:bg-(--agri-hover)">
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D6A4F]/10 via-[#2D6A4F]/5 to-transparent">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-2xl font-bold text-[#2D6A4F] dark:text-(--agri-brand) shadow-sm ring-1 ring-[#2D6A4F]/20">
              {(group.name || "?")[0].toUpperCase()}
            </div>
          </div>
        )}

        {/* Gradient shadow overlay only when there is no image inserted */}
        {!image && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none transition-opacity duration-300 group-hover:from-black/70" />
        )}

        {/* Inactive badge */}
        {group.active === false && (
          <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md border border-white/20">
            <i className="ri-pause-circle-line text-amber-300 text-xs" />
            <span>{t("groups.inactive")}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="text-base font-bold text-(--agri-text) group-hover:text-[#2D6A4F] dark:group-hover:text-(--agri-brand) transition-colors line-clamp-1">
            {group.name}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-(--agri-text-secondary) line-clamp-2 leading-relaxed min-h-[2.25rem]">
            {group.description || t("groups.noDescription") || "No description provided."}
          </p>

          {/* Metadata badges: Member count & Location */}
          <div className="mt-3 flex items-center gap-2 text-xs text-(--agri-text-muted) flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold rounded-lg bg-(--agri-hover) px-2 py-0.5 border border-(--agri-border-subtle) text-[11px] text-(--agri-text) shadow-2xs">
              <i className="ri-team-line text-[#2D6A4F] dark:text-(--agri-brand) text-xs" />
              {t("groups.memberCount", { count: memberCount })}
            </span>
            {locationStr ? (
              <span className="inline-flex items-center gap-1 font-medium rounded-lg bg-(--agri-hover) px-2 py-0.5 border border-(--agri-border-subtle) text-[11px] truncate max-w-[170px] shadow-2xs">
                <i className="ri-map-pin-line text-[#2D6A4F] dark:text-(--agri-brand) text-xs shrink-0" />
                <span className="truncate">{locationStr}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-(--agri-border-subtle)">
          {showMembership && membershipLoading && (!resolvedStatus || resolvedStatus === "none") ? (
            <div className="h-5 w-24 rounded-full bg-(--agri-hover) animate-pulse" />
          ) : showMembership && resolvedStatus && resolvedStatus !== "none" ? (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${STATUS_STYLES[resolvedStatus]?.chip || "text-(--agri-text-muted)"}`}>
              <i className={`${STATUS_STYLES[resolvedStatus]?.icon || "ri-information-line"} text-xs`} />
              {resolvedStatus === "pending"
                ? t("groups.pending") || "Application Pending"
                : resolvedStatus === "approved"
                ? t("groups.approved") || "Member"
                : resolvedStatus === "rejected"
                ? t("groups.rejected") || "Application Rejected"
                : t("groups.removed") || "Removed"}
            </span>
          ) : (
            <span className={`text-xs font-bold ${showMembership ? "text-[#2D6A4F] dark:text-(--agri-brand)" : "text-(--agri-text)"}`}>
              {showMembership ? t("groups.applyToJoin") : t("groups.viewGroup")}
            </span>
          )}

          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-(--agri-hover) group-hover:bg-[#2D6A4F] group-hover:text-white transition-all shadow-2xs">
            <i className="ri-arrow-right-line text-xs transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
