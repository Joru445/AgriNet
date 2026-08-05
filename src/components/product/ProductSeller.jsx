import { Link } from "react-router-dom";

import defaultAvatar from "../../assets/img/defaultAvatar.png";

export default function ProductSeller({ farmer }) {
  if (!farmer) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold mb-4">Sold By</h2>

      <div className="flex items-center gap-4">
        <img
          src={farmer.profilePicture || defaultAvatar}
          alt={farmer.fullname}
          className="h-16 w-16 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-lg">{farmer.fullname}</h3>

          {farmer.farmName && (
            <p className="text-sm text-[#2D6A4F]">{farmer.farmName}</p>
          )}

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>
              <i className="ri-map-pin-line mr-1" />
              Lucena City
            </span>
          </div>
        </div>

        <Link
          to={`/profile/${farmer.uid}`}
          className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Visit Store
        </Link>
      </div>
    </section>
  );
}
