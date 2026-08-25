import { Link } from "react-router-dom";

import Avatar from "../../common/Avatar"


export default function ProductSeller({ farmer, isOwner }) {
  if (!farmer) return null;

  const farmerName = farmer.fullname || farmer.storeName || farmer.username || "Farmer";
  const farmerAvatar = farmer.profilePicture || "";
  const farmerId = farmer.uid || farmer.id;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg flex font-semibold mb-4 gap-1">
        {isOwner ? "You" : "Sold By"}
      </h2>

      <div className="flex items-center gap-4">
        <Avatar src={farmerAvatar} name={farmerName} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
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

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>
              <i className="ri-map-pin-line mr-1" />
              {farmer.location?.address || farmer.address || "Lucena City"}
            </span>
          </div>
        </div>

        {!isOwner && farmerId && (
          <Link
            to={`/profile/${farmerId}`}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            Visit Store
          </Link>
        )}
      </div>
    </section>
  );
}
