import { useRef } from "react";

import StarRating from "./StarRating";

import defaultAvatar from "../../assets/img/defaultAvatar.png";

export default function ProfileHeader({
  profile,
  editing,

  onEdit,
  onCancel,
  onSave,
  onLogout,

  onAvatarChange,
}) {
  const fileInput = useRef();

  const isFarmer = profile.role === "farmer";

  return (
    <>
      <div className="relative h-44 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F]">
        <div className="absolute -bottom-14 left-4 lg:left-8 flex items-end gap-5">
          <div className="relative">
            <img
              src={profile.profilePicture || defaultAvatar}
              alt={profile.username}
              className="w-28 h-28 rounded-full border-4 border-white object-cover bg-white"
            />

            {editing && (
              <>
                <button
                  onClick={() => fileInput.current.click()}
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                >
                  <i className="ri-camera-line" />
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

          <div className="pb-8">
            <h3 className="text-2xl font-bold text-white">
              {profile.fullname}
            </h3>

            <p className="capitalize text-[#2D6A4F]">{profile.role}</p>
          </div>
        </div>

        <div className="absolute right-6 top-6 flex gap-3 flex-col md:flex-row">
          {!editing ? (
            <>
              <button
                onClick={onEdit}
                className="px-5 py-2 rounded-lg bg-white text-[#1B4332] font-medium hover:bg-gray-100"
              >
                <i className="ri-edit-line mr-2" />
                Edit
              </button>

              <button
                onClick={onLogout}
                className="px-5 py-2 rounded-lg bg-[#dc2626]/60 text-white hover:bg-[#dc2626]/80"
              >
                <i className="ri-logout-box-line mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="px-5 py-2 rounded-lg border bg-white"
              >
                Cancel
              </button>

              <button
                onClick={onSave}
                className="px-5 py-2 rounded-lg bg-[#000080]/60 text-white hover:bg-[#000080]/80"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="h-20" />
    </>
  );
}
