function getStatusClasses(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "reviewing":
      return "bg-blue-100 text-blue-700";

    case "resolved":
      return "bg-green-100 text-green-700";

    case "dismissed":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function ReportDetailsModal({ report, onClose }) {
  if (!report) return null;

  const targetType = report.targetType || report.type || "user";

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl border border-gray-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <i className="ri-shield-alert-line text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Report Details
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Review submitted report information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-200/70 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Reason & Status */}
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Report Reason
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {report.reason || "No reason provided"}
                </p>
              </div>

              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getStatusClasses(
                  report.status,
                )}`}
              >
                {report.status || "pending"}
              </span>
            </div>

            {report.targetTitle && (
              <div className="mt-3 pt-3 border-t border-gray-200/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Reported Target ({targetType})
                </p>
                <p className="text-xs font-semibold text-gray-800 mt-0.5">
                  {report.targetTitle}
                </p>
                {report.targetId && (
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                    ID: {report.targetId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1">
              Description / User Explanation
            </p>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-3 text-xs sm:text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
              {report.description || "No additional description provided."}
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Reported User */}
            <div className="rounded-2xl border border-gray-100 bg-red-50/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Reported User
              </p>
              <p className="text-xs font-bold text-gray-900 mt-1">
                {report.reportedUserName || "User"}
              </p>
              {report.reportedUserUsername && (
                <p className="text-[11px] text-gray-500">
                  @{report.reportedUserUsername}
                </p>
              )}
              {report.reportedUserRole && (
                <span className="inline-block mt-1.5 rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 capitalize">
                  {report.reportedUserRole}
                </span>
              )}
            </div>

            {/* Reporter */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Submitted By
              </p>
              <p className="text-xs font-bold text-gray-900 mt-1">
                {report.reporterName || "Reporter"}
              </p>
              {report.reporterUsername && (
                <p className="text-[11px] text-gray-500">
                  @{report.reporterUsername}
                </p>
              )}
              {report.reporterRole && (
                <span className="inline-block mt-1.5 rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700 capitalize">
                  {report.reporterRole}
                </span>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
