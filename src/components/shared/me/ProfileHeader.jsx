import { useRef, useState } from "react";

import landscape from "../../../assets/img/landscapeCover.jpg";

import Avatar from "../../common/Avatar";
import Button from "../../ui/Button";
import ImageViewerModal from "../../common/ImageViewerModal";
import StarRating from "./StarRating";
import { useLanguage } from "../../../context/LanguageContext";
import { applyTransform, COVER_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";

export default function ProfileHeader({
  profile,
  editing,
  saving = false,
  uploadingAvatar = false,

  onEdit,
  onCancel,
  onSave,

  onAvatarChange,
}) {
  const fileInput = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const { t } = useLanguage();

  const coverSrc = isCloudinaryUrl(profile.coverPhoto)
    ? applyTransform(profile.coverPhoto, COVER_TF)
    : profile.coverPhoto || landscape;

  const isFarmer = profile.role === "farmer";
  const displayName = profile.fullname || t("profile.unnamedUser");
  const roleLabel = isFarmer ? t("roles.farmer") : t("roles.consumer");

  const openAvatarViewer = () =>
    setFullscreenImage({
      src: profile.profilePicture,
      title: t("profile.picOf", { name: displayName }),
    });

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-md">
      {/* Cover Photo */}
      <div className="relative h-44 sm:h-60 md:h-72 lg:h-80">
        <button
          type="button"
          onClick={() =>
            setFullscreenImage({
              src: coverSrc,
              title: t("profile.coverOf", { name: displayName }),
            })
          }
          className="block h-full w-full cursor-pointer"
          title={t("profile.viewCover")}
          aria-label={t("profile.viewCover")}
        >
          <img
            src={coverSrc}
            alt="Cover"
            loading="lazy"
            width={1600}
            height={380}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </button>

        {/* Gradient overlay so the header text reads well */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10"
        />
      </div>

      {/* Avatar + Identity */}
      <div className="relative px-4 pb-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Avatar (overlaps the cover) */}
          <div className="relative -mt-14 sm:-mt-16 shrink-0 self-start">
            <button
              type="button"
              onClick={openAvatarViewer}
              className="block rounded-full border-4 border-[var(--agri-card)] shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2"
              title={t("profile.viewFullPhoto")}
              aria-label={t("profile.viewProfilePic")}
            >
              <Avatar
                src={profile.profilePicture}
                name={profile.fullname}
                size="xl"
                className="!h-28 !w-28 sm:!h-32 sm:!w-32"
              />
            </button>

            {/* Avatar Edit Camera Button */}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploadingAvatar}
              className="
                absolute
                bottom-1
                right-1
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#2D6A4F]
                text-white
                shadow-md
                hover:bg-[#1B4332]
                active:scale-95
                transition
                cursor-pointer
                disabled:opacity-60
                focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2
              "
              title={t("profile.changePic")}
              aria-label={t("profile.changePic")}
            >
              {uploadingAvatar ? (
                <i className="ri-loader-4-line animate-spin text-lg" />
              ) : (
                <i className="ri-camera-line text-lg" />
              )}
            </button>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1 pt-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--agri-text)]">
                {displayName}
              </h1>

              {profile.verified && (
                <i
                  className="ri-verified-badge-fill text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]"
                  title={t("common.verifiedFarmer")}
                  aria-label={t("common.verifiedFarmer")}
                />
              )}

              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--agri-brand-bg)] px-2.5 py-0.5 text-[11px] font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                <i className="ri-user-star-line" />
                {roleLabel}
              </span>
            </div>

            <p className="mt-0.5 text-sm text-[var(--agri-text-muted)] font-medium">
              @{profile.username || "user"}
            </p>

            {isFarmer && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--agri-text-secondary)]">
                {profile.storeName && (
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-store-2-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
                    <span className="font-semibold text-[var(--agri-text)]">
                      {profile.storeName}
                    </span>
                  </span>
                )}
                {profile.rating > 0 && (
                  <StarRating rating={profile.rating || 0} showValue />
                )}
              </div>
            )}

            {profile.bio && (
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[var(--agri-text-secondary)]">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 sm:self-end sm:shrink-0">
            {!editing ? (
              <Button onClick={onEdit} icon="ri-edit-line">
                {t("common.edit")}
              </Button>
            ) : (
              <>
                <Button onClick={onCancel} variant="cancel" disabled={saving}>
                  {t("common.cancel")}
                </Button>

                <Button
                  onClick={onSave}
                  variant="save"
                  disabled={saving || uploadingAvatar}
                  icon={saving ? "ri-loader-4-line" : undefined}
                >
                  {saving ? t("profile.saving") : t("profile.saveChanges")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={Boolean(fullscreenImage)}
        src={fullscreenImage?.src}
        title={fullscreenImage?.title}
        onClose={() => setFullscreenImage(null)}
      />
    </section>
  );
}