import { Link } from "react-router-dom";

import Avatar from "../../common/Avatar"


export default function ProductSeller({ farmer, isOwner }) {
  if (!farmer) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg flex font-semibold mb-4 gap-1">
        {isOwner ? "You" : "Sold By"}
      </h2>

      <div className="flex items-center gap-4">
        <Avatar src={farmer.profilePicture} name={farmer.fullname} />

        <div className="flex-1">
          <h3 className="font-semibold text-lg">{farmer.fullname}</h3>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>
              <i className="ri-map-pin-line mr-1" />
              Lucena City
            </span>
          </div>
        </div>

        {!isOwner && (
          <Link
            to={`/profile/${farmer.uid}`}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Visit Store
          </Link>
        )}
      </div>
    </section>
  );
}
