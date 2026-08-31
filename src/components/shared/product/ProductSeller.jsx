import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";

export default function ProductSeller({ farmer, isOwner }) {
  const [expandedAddress, setExpandedAddress] = useState(false);

  if (!farmer) return null;

  const farmerName =
    farmer.fullname || farmer.storeName || farmer.username || "Farmer";
  const farmerAvatar = farmer.profilePicture || "";
  const farmerId = farmer.uid || farmer.id;
  const address = farmer.location?.address || farmer.address || "Lucena City";
  const isLongAddress = address.length > 28;

  return (
    !isOwner &&
    farmerId && (
      <Link to={`/profile/${farmerId}`}>
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <Avatar
              src={farmerAvatar}
              name={farmerName}
              className="shrink-0 mt-0.5 sm:mt-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                  {farmerName}
                </h3>
                {farmer.verified && (
                  <span
                    title="Verified Farmer"
                    aria-label="Verified Farmer"
                    className="inline-flex shrink-0 items-center text-[#2D6A4F] text-base"
                  >
                    <i className="ri-verified-badge-fill" />
                  </span>
                )}
              </div>

              <div className="mt-1 text-xs sm:text-sm text-gray-500">
                <div className="flex items-start gap-1">
                  <i className="ri-map-pin-line shrink-0 text-gray-400 mt-0.5" />
                  <div className="min-w-0 flex-1 leading-snug">
                    <span
                      className={
                        !expandedAddress && isLongAddress
                          ? "line-clamp-1 break-words"
                          : "break-words"
                      }
                    >
                      {address}
                    </span>
                    {isLongAddress && (
                      <button
                        type="button"
                        onClick={() => setExpandedAddress((prev) => !prev)}
                        className="mt-0.5 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] hover:underline cursor-pointer inline-flex items-center gap-0.5 transition-colors"
                      >
                        {expandedAddress ? "See less" : "See more"}
                        <i
                          className={`text-xs ${
                            expandedAddress
                              ? "ri-arrow-up-s-line"
                              : "ri-arrow-down-s-line"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to={`/profile/${farmerId}`}
              className="shrink-0 rounded-xl border border-gray-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Visit Store
            </Link>
          </div>
        </section>
      </Link>
    )
  );
}
