import { useRef, useState } from "react";

import landscape from "../../../assets/img/landscapeCover.jpg";

import { getInitials } from "../../../utils/getInitials";
import Button from "../../ui/Button";
import ImageViewerModal from "../../common/ImageViewerModal";
import { applyTransform, COVER_TF, PROFILE_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";

export default function ProfileHeader({
  profile,
  editing,
  uploadingAvatar = false,

  onEdit,
  onCancel,
  onSave,
  onLogout,

  onAvatarChange,
}) {
  const fileInput = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  return (
    <section className="bg-white">
      {/* Cover Photo */}
      <div className="relative">
        <div
          className="relative h-56 overflow-hidden sm:rounded-b-2xl sm:h-72 md:h-80 lg:h-95 cursor-pointer group"
          onClick={() =>
            setFullscreenImage({
              src: profile.coverPhoto || landscape,
              title: "Cover Photo",
            })
          }
          title="Click to view cover photo"
        >
          <img
            src={
              isCloudinaryUrl(profile.coverPhoto)
                ? applyTransform(profile.coverPhoto, COVER_TF)
                : profile.coverPhoto || landscape
            }
            alt="Cover"
            loading="lazy"
            width={1600}
            height={380}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        </div>
      </div>

      {/* Profile Information */}
      <div
        className="
          relative
          -mt-8
          rounded-t-3xl
          bg-white
          px-4
          sm:mt-0
          sm:rounded-none
          sm:px-6
        "
      >
        <div>
          {/* Left side: Avatar + Information */}
          <div className="flex sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative -mt-8 shrink-0 sm:-mt-20">
              {profile.profilePicture ? (
                <img
                  src={
                    isCloudinaryUrl(profile.profilePicture)
                      ? applyTransform(profile.profilePicture, PROFILE_TF)
                      : profile.profilePicture
                  }
                  alt={profile.username}
                  width={160}
                  height={160}
                  onClick={() =>
                    setFullscreenImage({
                      src: profile.profilePicture,
                      title: `${profile.fullname || profile.username}'s Profile Picture`,
                    })
                  }
                  className="
                    h-32 w-32
                    rounded-full
                    border-4 border-white
                    bg-white
                    object-cover
                    shadow-sm
                    sm:h-40 sm:w-40
                    cursor-pointer
                    hover:opacity-95
                    transition
                  "
                  title="Click to view full photo"
                />
              ) : (
                <div
                  className="
                    flex
                    h-32 w-32
                    items-center justify-center
                    rounded-full
                    border-4 border-white
                    bg-[#D8F3DC]
                    text-5xl
                    font-semibold
                    text-[#2D6A4F]
                    shadow-sm
                    sm:h-40 sm:w-40
                  "
                >
                  {getInitials(profile.fullname)}
                </div>
              )}

              {/* Avatar Edit Camera Button - always clickable to change photo */}
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
                "
                title="Change profile picture"
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
              />
            </div>

            {/* Profile Text Info */}
            <div className="min-w-0 flex-1 pt-3 sm:pt-0 sm:pb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {profile.fullname || "Unnamed User"}
              </h1>
              <p className="text-sm text-gray-500 font-medium truncate">
                @{profile.username || "user"}
              </p>
              {profile.bio && (
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 py-4 sm:justify-end">
            {!editing ? (
              <>
                <Button
                  onClick={onLogout}
                  variant="logout"
                  icon="ri-logout-box-line"
                >
                  Logout
                </Button>
                <Button onClick={onEdit} icon="ri-edit-line">
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onCancel} variant="cancel">
                  Cancel
                </Button>

                <Button onClick={onSave} variant="save">
                  Save Changes
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
