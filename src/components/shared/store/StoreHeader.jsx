import { useState } from "react";
import landscape from "../../../assets/img/landscapeCover.jpg";

import { getInitials } from "../../../utils/getInitials";
import { useAuth } from "../../../context/AuthContext";
import ReportModal from "../../common/ReportModal";

export default function StoreHeader({
  farmer,
  reviewCount,
  averageRating,
  onMessage,
}) {
  const { profile } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const joinedDate = farmer.createdAt?.seconds
    ? new Date(farmer.createdAt.seconds * 1000).toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <section className="bg-white">
      {/* Cover Photo */}
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative
            h-56
            overflow-hidden
            bg-gray-200
            sm:h-72
            md:h-80
            lg:h-[380px]
            sm:rounded-b-2xl
          "
        >
          <img
            src={farmer.coverPhoto || landscape}
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
          rounded-t-3xl
          bg-white
          px-4
          sm:rounded-none
          sm:px-6
        "
      >
        <div className="mx-auto max-w-7xl">
          {/* Main Profile Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            {/* Avatar + Details */}
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative -mt-14 shrink-0 sm:-mt-20">
                {farmer.profilePicture ? (
                  <img
                    src={farmer.profilePicture}
                    alt={farmer.username}
                    className="
                      h-28 w-28
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
                      h-28 w-28
                      items-center justify-center
                      rounded-full
                      border-4 border-white
                      bg-[#D8F3DC]
                      text-5xl
                      font-semibold
                      text-[#2D6A4F]
                      shadow-sm
                      sm:h-40 sm:w-40
                      sm:text-6xl
                    "
                  >
                    {getInitials(farmer.fullname)}
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="min-w-0 pb-3 pt-3 sm:pb-5 sm:pl-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="truncate text-xl font-bold text-gray-900 sm:text-3xl">
                    {farmer.fullname}
                  </h1>
                  {farmer.verified && (
                    <span
                      title="Verified Farmer"
                      aria-label="Verified Farmer"
                      className="inline-flex shrink-0 items-center text-[#2D6A4F] text-xl sm:text-2xl"
                    >
                      <i className="ri-verified-badge-fill" />
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 sm:mt-4 sm:gap-5">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <i className="ri-star-fill text-yellow-400" />
                    {averageRating ?? "0"} ({reviewCount ?? "0"})
                  </span>

                  {/*farmer.location?.address && (
                    <span className="flex min-w-0 items-center gap-1">
                      <i className="ri-map-pin-line shrink-0" />
                      <span className="truncate">
                        {farmer.location.address}
                      </span>
                    </span>
                  )*/}

                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <i className="ri-calendar-line" />
                    Joined {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Message & Report */}
            <div className="flex items-center gap-2 pb-4 pt-3 sm:pt-4 md:pb-5 md:pt-0">
              <button
                type="button"
                onClick={onMessage}
                className="
                  inline-flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#2D6A4F]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#1B4332]
                  active:scale-95
                  cursor-pointer
                  sm:w-auto
                "
              >
                <i className="ri-message-3-line mr-1.5" />
                Message
              </button>

              {profile?.uid && profile?.uid !== farmer.uid && profile?.uid !== farmer.id && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3.5
                    text-xs
                    font-bold
                    text-gray-600
                    hover:border-red-200
                    hover:bg-red-50
                    hover:text-red-600
                    transition-all
                    active:scale-95
                    cursor-pointer
                    shadow-2xs
                  "
                  title="Report this store"
                >
                  <i className="ri-alert-line text-sm sm:mr-1" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="profile"
        targetId={farmer.uid || farmer.id}
        targetTitle={`Store of ${farmer.storeName || farmer.fullname || farmer.username}`}
        reportedUser={farmer}
      />
    </section>
  );
}
