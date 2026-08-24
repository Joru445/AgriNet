import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";

export default function FarmerPopup({ farmer, onMessage }) {
  return (
    <div className="w-56 p-0.5 select-none text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar
            src={farmer.profilePicture}
            name={farmer.fullname}
            size="sm"
            className="w-11 h-11 ring-2 ring-[#D8F3DC]"
          />
          {farmer.verified && (
            <span
              title="Verified Farmer"
              aria-label="Verified Farmer"
              className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-white text-[#2D6A4F] text-[11px] shadow-xs"
            >
              <i className="ri-verified-badge-fill" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h2 className="font-bold text-sm text-gray-900 truncate leading-tight !m-0 !p-0">
            {farmer.fullname}
          </h2>

          <p className="text-xs text-gray-500 truncate !m-0 !mt-0.5 !p-0 leading-tight">
            @{farmer.username}
          </p>

          {farmer.farmName && (
            <p className="text-[11px] text-[#2D6A4F] font-medium truncate !m-0 !mt-0.5 !p-0 leading-tight flex items-center gap-1">
              <i className="ri-store-2-line text-[11px] shrink-0 text-[#2D6A4F]" />
              <span className="truncate">{farmer.farmName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Distance & Rating Badges */}
      <div className="mt-3 flex items-center justify-between gap-1.5 pt-2.5 border-t border-gray-100">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6A4F] bg-[#D8F3DC]/45 px-2 py-0.5 rounded-md">
          <i className="ri-map-pin-2-fill text-xs text-[#2D6A4F]" />
          <span>{farmer.distance != null ? `${farmer.distance.toFixed(1)} km` : "--"}</span>
        </span>

        {farmer.rating != null && Number(farmer.rating) > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <i className="ri-star-fill text-amber-500 text-xs" />
            <span>{Number(farmer.rating).toFixed(1)}</span>
            {farmer.reviewCount > 0 && (
              <span className="text-gray-500 font-medium text-[11px]">({farmer.reviewCount})</span>
            )}
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">No reviews</span>
        )}
      </div>

      {/* Bio / Description */}
      {farmer.bio && (
        <p className="!mt-2 !mb-0 !p-0 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {farmer.bio}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Link
          to={`/profile/${farmer.uid}`}
          className="flex-1 rounded-xl border border-[#2D6A4F] py-2 text-center text-xs font-semibold !text-[#2D6A4F] hover:!bg-[#2D6A4F] hover:!text-white transition shadow-xs"
        >
          Profile
        </Link>

        <button
          type="button"
          onClick={onMessage}
          className="flex-1 rounded-xl bg-[#2D6A4F] py-2 text-xs font-semibold text-white hover:bg-[#1B4332] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <i className="ri-chat-3-line text-xs" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
}
