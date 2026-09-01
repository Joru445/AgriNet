import { useState } from "react";
import RoleBadge from "../../common/RoleBadge";
import ImageViewerModal from "../../common/ImageViewerModal";

function formatFullDateTime(timestamp) {
  if (!timestamp) return "Not available";

  let date = null;
  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    date = new Date(timestamp);
  }

  if (!date || isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function UserDetailsModal({ user, onClose }) {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (!user) return null;

  const isSuspended = user.status === "suspended";

  // Build complete location string
  const locationParts = [
    user.address,
    user.barangay ? `Brgy. ${user.barangay}` : null,
    user.municipality || user.city,
    user.province,
    user.postalCode,
  ].filter(Boolean);

  const fullLocation =
    user.location?.address ||
    (locationParts.length > 0 ? locationParts.join(", ") : null) ||
    "No address provided";

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[var(--agri-card)] p-4 sm:p-5 shadow-2xl border border-[var(--agri-border)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--agri-border)]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--agri-text)] tracking-tight">
              User Details
            </h3>
            <p className="text-xs font-medium text-[var(--agri-text-muted)]">
              Complete account and system information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--agri-text-muted)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text-secondary)] transition cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Profile Card / Avatar */}
        <div className="flex flex-col items-center text-center pt-2.5 pb-2">
          <div className="relative mb-2">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullname}
                onClick={() =>
                  setFullscreenImage({
                    src: user.profilePicture,
                    title: `${user.fullname || user.username}'s Profile Picture`,
                  })
                }
                className="h-16 w-16 rounded-full object-cover ring-3 ring-[#D8F3DC] cursor-pointer hover:opacity-90 transition"
                title="Click to view photo"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-xl font-black text-[#2D6A4F] dark:text-[var(--agri-brand)] ring-3 ring-[#D8F3DC]/40">
                {user.fullname
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
            )}

            {user.verified && (
              <span
                className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A4F] text-white ring-2 ring-white"
                title="Verified Account"
              >
                <i className="ri-check-line text-[10px] font-bold" />
              </span>
            )}
          </div>

          <h4 className="text-base font-bold text-[var(--agri-text)]">
            {user.fullname || "Unnamed User"}
          </h4>

          <p className="text-xs font-medium text-[var(--agri-text-muted)] mb-1.5">
            @{user.username || "user"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <RoleBadge role={user.role || "consumer"} />

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isSuspended
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isSuspended ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              {isSuspended ? "Suspended Account" : "Active Account"}
            </span>
          </div>
        </div>

        {/* Complete Information Section */}
        <div className="space-y-2 text-left my-2">
          {/* Full Name & Username */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
              <i className="ri-user-3-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  Full Name
                </p>
                <p className="text-xs font-semibold text-[var(--agri-text)] truncate mt-0.5">
                  {user.fullname || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
              <i className="ri-at-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  Username
                </p>
                <p className="text-xs font-semibold text-[var(--agri-text)] truncate mt-0.5">
                  @{user.username || "user"}
                </p>
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
            <i className="ri-mail-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                Email Address
              </p>
              <p className="text-xs font-semibold text-[var(--agri-text)] break-all mt-0.5">
                {user.email || "No email provided"}
              </p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
            <i className="ri-phone-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                Phone Number
              </p>
              <p className="text-xs font-semibold text-[var(--agri-text)] mt-0.5">
                {user.phone || user.contactNumber || "No phone provided"}
              </p>
            </div>
          </div>

          {/* Full Location */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
            <i className="ri-map-pin-2-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                Full Location / Address
              </p>
              <p className="text-xs font-semibold text-[var(--agri-text)] whitespace-normal break-words leading-snug mt-0.5">
                {fullLocation}
              </p>
              {user.location?.latitude && user.location?.longitude && (
                <p className="text-[11px] text-[var(--agri-text-muted)] font-mono mt-0.5">
                  GPS: {user.location.latitude}, {user.location.longitude}
                </p>
              )}
            </div>
          </div>

          {/* Registration & Update Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
              <i className="ri-calendar-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  Created
                </p>
                <p className="text-xs font-semibold text-[var(--agri-text)] mt-0.5">
                  {formatFullDateTime(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
              <i className="ri-time-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  Updated
                </p>
                <p className="text-xs font-semibold text-[var(--agri-text)] mt-0.5">
                  {formatFullDateTime(user.updatedAt || user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Bio / Description */}
          {user.bio && (
            <div className="p-2.5 rounded-xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)] mb-0.5">
                Bio / About
              </p>
              <p className="text-xs text-[var(--agri-text)] font-medium whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}
        </div>

        {/* Modal Close Action */}
        <div className="mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold hover:bg-[#1B4332] active:scale-[0.99] transition cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={Boolean(fullscreenImage)}
        src={fullscreenImage?.src}
        title={fullscreenImage?.title}
        onClose={() => setFullscreenImage(null)}
      />
    </div>
  );
}
