import { useEffect, useState } from "react";

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
    <div className="fixed inset-0 z-9999 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4 transition-colors duration-300 ease-in-out">
      <div className="w-full max-w-md rounded-t-2xl md:rounded-b-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>

            <p className="text-sm text-gray-500">Manage account status</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* User Information */}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user.fullname}
            </p>

            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Role
            </label>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-sm capitalize text-gray-700">
                {user.role || "consumer"}
              </span>

              <span className="text-xs text-gray-400">Cannot be changed</span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Account Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2D6A4F]"
            >
              <option value="active">Active</option>

              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Farmer Verification */}
          {isFarmer && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Farmer Verification
              </label>

              <button
                type="button"
                onClick={() => setVerified((current) => !current)}
                disabled={loading}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  verified
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {verified ? "Verified Farmer" : "Not Verified"}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {verified
                      ? "This farmer is verified."
                      : "This farmer has not been verified."}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                    verified ? "bg-[#2D6A4F]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      verified ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
