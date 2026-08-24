import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";

export default function NearbyFarmerCard({ farmer }) {
  return (
    <div className="group flex flex-col justify-between h-full rounded-2xl border border-gray-200/90 bg-white p-3.5 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
      <div>
        {/* Top Header: Avatar + Farmer Info */}
        <div className="flex items-start gap-2.5 sm:gap-3 text-left">
          <div className="relative shrink-0">
            <Avatar
              src={farmer.profilePicture}
              name={farmer.fullname}
              size="md"
              className="w-11 h-11 sm:w-12 sm:h-12 ring-2 ring-[#D8F3DC]"
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

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[#2D6A4F] transition-colors leading-tight">
              {farmer.fullname}
            </h3>

            <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5">
              @{farmer.username}
            </p>

            {farmer.farmName && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                <i className="ri-store-2-line text-gray-400 shrink-0 text-xs" />
                <span className="truncate">{farmer.farmName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Distance & Rating Section */}
        <div className="mt-3 space-y-1.5 text-xs pt-2.5 border-t border-gray-100">
          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
            <span className="text-gray-500 flex items-center gap-1 shrink-0">
              <i className="ri-map-pin-range-line text-gray-400 text-xs" />
              <span>Distance</span>
            </span>

            <span className="font-semibold text-[#2D6A4F] bg-[#D8F3DC]/40 px-1.5 py-0.5 rounded text-[11px] shrink-0">
              {farmer.distance != null ? `${farmer.distance.toFixed(1)} km` : "--"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
            <span className="text-gray-500 flex items-center gap-1 shrink-0">
              <i className="ri-star-line text-gray-400 text-xs" />
              <span>Rating</span>
            </span>

            {farmer.rating != null && Number(farmer.rating) > 0 ? (
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <i className="ri-star-fill text-amber-500 text-xs" />
                <span className="font-bold text-gray-900 text-[11px]">
                  {Number(farmer.rating).toFixed(1)}
                </span>
                {farmer.reviewCount > 0 && (
                  <span className="text-gray-500 font-medium text-[10px]">
                    ({farmer.reviewCount})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 font-medium text-[11px] shrink-0">
                No reviews
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-1">
        <Link
          to={`/profile/${farmer.uid}`}
          className="block w-full rounded-xl border border-[#2D6A4F] bg-white py-1.5 sm:py-2 text-center text-xs font-semibold text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white active:scale-98 shadow-xs hover:shadow-md transition-all duration-150"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
