function formatDate(timestamp) {
  if (!timestamp) return "Not available";

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString();
  }

  return "Not available";
}

export default function UserDetailsModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4 transition-all duration-300 ease-in-out">
      <div className="w-full max-w-lg rounded-t-2xl md:rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              User Details
            </h2>

            <p className="text-sm text-gray-500">View account information</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullname}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D8F3DC] text-lg font-bold text-[#2D6A4F]">
                {user.fullname
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900">
                {user.fullname || "Unnamed User"}
              </h3>

              <p className="text-sm text-gray-500">
                @{user.username || "unknown"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem label="Email" value={user.email} />

            <InfoItem label="Phone" value={user.phone} />

            <InfoItem label="Role" value={user.role} />

            <InfoItem label="Status" value={user.status || "active"} />

            <InfoItem label="Created" value={formatDate(user.createdAt)} />

            <InfoItem label="Updated" value={formatDate(user.updatedAt)} />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Bio
            </p>

            <p className="text-sm text-gray-700">
              {user.bio || "No bio provided."}
            </p>
          </div>

          {user.location?.address && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                Location
              </p>

              <p className="text-sm text-gray-700">{user.location.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}
