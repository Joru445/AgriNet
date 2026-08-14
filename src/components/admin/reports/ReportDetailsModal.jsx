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

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Report Details
            </h2>

            <p className="text-sm text-gray-500">
              Review the submitted report.
            </p>
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
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reason
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {report.reason || "No reason provided"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {report.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Type
              </p>

              <p className="mt-1 text-sm capitalize text-gray-700">
                {report.type || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Status
              </p>

              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                  report.status,
                )}`}
              >
                {report.status || "Unknown"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reported By
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {report.reporterName || "Unknown user"}
            </p>

            {report.reporterUsername && (
              <p className="text-xs text-gray-500">
                @{report.reporterUsername}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reported User
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {report.reportedUserName || "Unknown user"}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
