import { Link } from "react-router-dom";

import Avatar from "../../common/Avatar"

export default function NearbyFarmerCard({ farmer }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <Avatar src={farmer.profilePicture} name={farmer.fullname} />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{farmer.fullname}</h3>

          <p className="text-sm text-gray-500">@{farmer.username}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Distance</span>

          <span className="font-semibold text-[#2D6A4F]">
            {farmer.distance.toFixed(1)} km
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Rating</span>

          <span>⭐ {farmer.rating ?? "N/A"}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/profile/${farmer.uid}`}
          className="flex-1 rounded-lg border border-[#2D6A4F] py-2 text-center text-sm font-medium text-[#2D6A4F] hover:bg-green-50"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
