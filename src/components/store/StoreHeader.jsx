import { Link } from "react-router-dom";

import defaultAvatar from "../../assets/img/defaultAvatar.png";

export default function StoreHeader({ farmer, reviewCount, averageRating }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="h-36 bg-gradient-to-r to-gray-200 from-[#40916C]">
        <Link
          to="/nearby"
          className="inline-flex items-center gap-2 p-3 text-sm text-gray-200 hover:underline"
        >
          <i className="ri-arrow-left-line" />
          Back
        </Link>
      </div>

      <div className="px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
          <img
            src={farmer.profilePicture || defaultAvatar}
            alt={farmer.fullname}
            className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow"
          />

          <div className="flex-1">
            <h1 className="mt-2 text-3xl font-bold text-[#1B4332] md:text-white">
              {farmer.fullname}
            </h1>

            {farmer.farmName && (
              <p className="mt-1 text-lg text-[#40916C] font-medium">
                {farmer.farmName}
              </p>
            )}

            <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <i className="ri-star-fill text-yellow-400" />
                {averageRating ?? "0"} ({reviewCount ?? "0"})
              </span>

              <span className="flex items-center gap-1">
                <i className="ri-map-pin-line" />
                {farmer.location?.address}
              </span>

              <span className="flex items-center gap-1">
                <i className="ri-calendar-line" />
                Joined{" "}
                {farmer.createdAt?.seconds
                  ? new Date(
                      farmer.createdAt.seconds * 1000,
                    ).toLocaleDateString("en-PH", {
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
