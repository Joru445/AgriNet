import { createPortal } from "react-dom";

export default function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
  loggingOut = false,
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100/80 text-red-600">
            <i className="ri-logout-box-r-line text-2xl" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">
              Log Out
            </h3>
            <p className="mt-1 text-sm text-gray-600 font-medium">
              Are you sure you want to log out?
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loggingOut}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loggingOut}
            className="rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#b91c1c] shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Yes"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
