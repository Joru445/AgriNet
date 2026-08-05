import { Link } from "react-router-dom";

import defaultAvatar from "../../assets/img/defaultAvatar.png"

export default function FarmerPopup({ farmer, onMessage }) {

  return (
    <div className="w-64">
      <div className="flex items-start gap-3">
        <img
          src={farmer.profilePicture || defaultAvatar}
          alt={farmer.fullname}
          className="w-12 h-12 rounded-full object-cover border"
        />

        <div className="flex-1">
          <h2 className="font-semibold text-[#1B4332]">{farmer.fullname}</h2>

          {farmer.distance != null && (
            <p className="text-xs text-[#2D6A4F] !my-2">
              📍 {farmer.distance.toFixed(1)} km away
            </p>
          )}
        </div>
      </div>

      {farmer.bio && (
        <p className="!my-3 text-sm text-gray-600 line-clamp-2">{farmer.bio}</p>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          to={`/profile/${farmer.uid}`}
          className="flex-1 rounded-lg border border-[#2D6A4F] py-2 text-center text-sm font-medium !text-[#2D6A4F] !hover:bg-green-50"
        >
          Profile
        </Link>

        <button
          type="button"
          onClick={onMessage}
          className="flex-1 rounded-lg bg-[#2D6A4F] py-2 text-sm font-medium text-white hover:bg-[#1B4332]"
        >
          Message
        </button>
      </div>
    </div>
  );
}
