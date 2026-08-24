import { useEffect, useState } from "react";
import RoleBadge from "../../common/RoleBadge";

export default function UserEditModal({
  user,
  farmer,
  loading,
  onClose,
  onSave,
}) {
  const [status, setStatus] = useState("active");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!user) return;

    setStatus(user.status || "active");

    if (user.role === "farmer") {
      setVerified(farmer?.verified === true);
    } else {
      setVerified(false);
    }
  }, [user, farmer]);

  if (!user) return null;

  const isFarmer = user.role === "farmer";
  const originalStatus = user.status || "active";
  const originalVerified = farmer?.verified === true;
  const statusChanged = status !== originalStatus;
  const verificationChanged = isFarmer && verified !== originalVerified;
  const hasChanges = statusChanged || verificationChanged;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!hasChanges) {
      onClose();
      return;
    }

    const updates = {};

    if (statusChanged) {
      updates.status = status;
    }

    if (verificationChanged) {
      updates.verified = verified;
    }

    await onSave(user.uid, updates);
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Edit User Account
            </h3>
            <p className="text-xs font-medium text-gray-500">
              Manage account status & permissions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* User Quick Identity Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/90 border border-gray-200/80">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullname}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#D8F3DC]"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] text-sm font-bold text-[#2D6A4F]">
                {user.fullname
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user.fullname || "Unnamed User"}
              </p>
              <p className="text-xs text-gray-500 font-medium truncate">
                {user.email || "No email"}
              </p>
            </div>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              User Role
            </label>

            <div className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gray-50/70 px-3.5 py-2.5">
              <RoleBadge role={user.role || "consumer"} />
              <span className="text-[11px] font-semibold text-gray-400">
                Fixed Role
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Account Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200/90 bg-gray-50/50 px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#2D6A4F] focus:bg-white focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer disabled:opacity-60"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Farmer Verification Toggle */}
          {isFarmer && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Farmer Verification
              </label>

              <button
                type="button"
                onClick={() => setVerified((current) => !current)}
                disabled={loading}
                className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                  verified
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-gray-200/90 bg-gray-50/70 hover:bg-gray-100/70"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      verified ? "text-emerald-800" : "text-gray-700"
                    }`}
                  >
                    {verified ? "Verified Farmer" : "Not Verified"}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 font-medium">
                    {verified
                      ? "Farmer displays verified badge"
                      : "Farmer does not display verified badge"}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${
                    verified ? "bg-[#2D6A4F]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                      verified ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold hover:bg-[#1B4332] active:scale-[0.99] transition cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
