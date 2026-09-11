import { useState } from "react";
import landscape from "../../../assets/img/landscapeCover.jpg";

import ImageViewerModal from "../../common/ImageViewerModal";
import RoleBadge from "../../common/RoleBadge";
import ReportModal from "../../common/ReportModal";
import { getInitials } from "../../../utils/getInitials";
import { applyTransform, COVER_TF, PROFILE_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { useFavorites } from "../../../context/FavoritesContext";
import { showToast } from "../../../utils/toast";

export default function PublicProfileHeader({
  profile,
  role,
  averageRating,
  reviewCount,
  stats,
  onMessage,
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showReportModal, setShowReportModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const isFarmer = role === "farmer";

  const name = profile.storeName || profile.fullname || profile.username;
  const initials = getInitials(name);
  const joinedDate = profile.createdAt?.seconds
    ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      })
    : null;

  const fullLocation = [
    profile.barangay,
    profile.municipality ||
      profile.location?.address ||
      profile.address,
  ]
    .filter(Boolean)
    .join(", ");

  const targetUid = profile.uid || profile.id;

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast.success(t("common.linkCopied"));
      }
    } catch {
      // User cancelled share or clipboard failed — ignore
    }
  }

  return (
    <section data-onboarding="store-header" className="bg-[var(--agri-card)]">
      {/* Cover Photo */}
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative
            h-56
            overflow-hidden
            bg-[var(--agri-hover)]
            sm:h-72
            md:h-80
            lg:h-[380px]
            sm:rounded-b-2xl
          "
        >
          <img
            src={
              isCloudinaryUrl(profile.coverPhoto)
                ? applyTransform(profile.coverPhoto, COVER_TF)
                : profile.coverPhoto || landscape
            }
            alt={t("storeProfile.cover")}
            width={1600}
            height={380}
            loading="lazy"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* Profile Information */}
      <div className="relative mx-auto max-w-7xl -mt-8 px-4 sm:mt-0 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-4">
          {/* Left side: Avatar + Info */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="block shrink-0 -mt-8 sm:-mt-16 rounded-full border-4 border-[var(--agri-card)] shadow-md">
              {profile.profilePicture ? (
                <img
                  src={
                    isCloudinaryUrl(profile.profilePicture)
                      ? applyTransform(profile.profilePicture, PROFILE_TF)
                      : profile.profilePicture
                  }
                  alt={name}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover cursor-pointer"
                  loading="lazy"
                  width={128}
                  height={128}
                  onClick={() => setLightbox({ src: profile.profilePicture, title: name })}
                />
              ) : (
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            {/* Text Info */}
            <div className="min-w-0 pb-1 sm:pb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332] dark:text-[var(--agri-brand)] [text-shadow:_0_1px_2px_rgba(255,255,255,0.9),_0_0_8px_rgba(255,255,255,0.8)] dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.8)] truncate">
                  {name}
                </h1>
                {(profile.verificationStatus === "approved" || profile.verified) && (
                  <span
                    title={t("common.verifiedFarmer")}
                    aria-label={t("common.verifiedFarmer")}
                    className="inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-lg"
                  >
                    <i className="ri-verified-badge-fill" />
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--agri-text-muted)] font-medium">
                @{profile.username}
              </p>
              <div className="mt-1.5">
                <RoleBadge role={isFarmer ? "farmer" : "consumer"} />
              </div>
            </div>
          </div>

          {/* Right side: Actions - fills full width in 2-cols on mobile, inline on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto sm:ml-auto pb-1 sm:pb-3">
            {onMessage && (
              <button
                type="button"
                onClick={onMessage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-4 sm:px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B4332] cursor-pointer"
              >
                <i className="ri-chat-1-line" />
                <span>{t("storeProfile.message")}</span>
              </button>
            )}

            {user && isFarmer && user.role !== "farmer" && (
              <button
                type="button"
                onClick={() => toggleFavorite("farmer", targetUid)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer
                  ${isFavorite("farmer", targetUid)
                    ? "bg-[#E63946] text-white hover:bg-[#C1121F]"
                    : "border border-[var(--agri-border)] bg-[var(--agri-card)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]"
                  }
                `}
              >
                <i className={`${isFavorite("farmer", targetUid) ? "ri-heart-fill" : "ri-heart-line"}`} />
                <span>{isFavorite("farmer", targetUid) ? t("favorites.saved") : t("favorites.save")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer"
            >
              <i className="ri-share-line" />
              <span>{t("storeProfile.share")}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer"
            >
              <i className="ri-flag-line" />
              <span>{t("storeProfile.report")}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-3 sm:py-4 border-t border-[var(--agri-border-subtle)]">
          {isFarmer && (
            <div className="flex items-center gap-1.5">
              <i className="ri-star-fill text-amber-500" />
              <span className="text-sm font-bold text-[var(--agri-text)]">
                {averageRating != null && !isNaN(Number(averageRating))
                  ? Number(averageRating).toFixed(1)
                  : "N/A"}
              </span>
              <span className="text-xs text-[var(--agri-text-muted)]">
                ({reviewCount || 0})
              </span>
            </div>
          )}

          {fullLocation && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--agri-text-muted)]">
              <i className="ri-map-pin-line" />
              <span className="truncate max-w-[200px]">
                {fullLocation}
              </span>
            </div>
          )}

          {joinedDate && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--agri-text-muted)]">
              <i className="ri-calendar-line" />
              <span>{t("storeProfile.joined", { date: joinedDate })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType={isFarmer ? "store" : "profile"}
        targetId={targetUid}
        targetTitle={name}
        reportedUser={profile}
      />

      <ImageViewerModal
        isOpen={Boolean(lightbox)}
        src={lightbox?.src}
        title={lightbox?.title}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}