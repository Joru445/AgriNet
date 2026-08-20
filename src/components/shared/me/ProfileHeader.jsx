import { useRef } from "react";

import landscape from "../../../assets/img/landscapeCover.jpg";

import { getInitials } from "../../../utils/getInitials";
import Button from "../../ui/Button";

export default function ProfileHeader({
  profile,
  editing,

  onEdit,
  onCancel,
  onSave,
  onLogout,

  onAvatarChange,
}) {
  const fileInput = useRef(null);

  return (
    <section className="bg-white">
      {/* Cover Photo */}
      <div className="relative">
        <div className="relative h-56 overflow-hidden sm:rounded-b-2xl sm:h-72 md:h-80 lg:h-95">
          <img
            src={profile.coverPhoto || landscape}
            alt="Cover"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />
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
                  src={profile.profilePicture}
                  alt={profile.username}
                  className="
                    h-32 w-32
                    rounded-full
                    border-4 border-white
                    bg-white
                    object-cover
                    shadow-sm
                    sm:h-40 sm:w-40
                  "
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

              {/* Avatar Edit */}
              {editing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="
                      absolute
                      bottom-1
                      right-1
                      flex
                      h-9 w-9
                      items-center justify-center
                      rounded-full
                      bg-[#2D6A4F]
                      text-white
                      shadow-md
                      transition-colors
                      hover:bg-[#1B4332]
                    "
                  >
                    <i className="ri-camera-line text-lg" />
                  </button>

                  <input
                    hidden
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    onChange={onAvatarChange}
                  />
                </>
              )}
            </div>

            {/* Profile Details */}
            <div className="pb-4 pt-3 sm:pb-5 sm:pl-5">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {profile.fullname}
              </h1>

              <p className="mt-1 capitalize text-sm font-medium text-[#2D6A4F]">
                {profile.role}
              </p>
            </div>
          </div>

          {/* Actions */}
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
    </section>
  );
}
