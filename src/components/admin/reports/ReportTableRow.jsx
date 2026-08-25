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

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Pending";

    case "reviewing":
      return "Reviewing";

    case "resolved":
      return "Resolved";

    case "dismissed":
      return "Dismissed";

    default:
      return status || "Unknown";
  }
}

export default function ReportTableRow({ report, onView }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {report.reason || "No reason"}
          </p>

          <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">
            {report.description || "No description"}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm text-gray-700">
            {report.reporterName || "Unknown user"}
          </p>

          {report.reporterUsername && (
            <p className="text-xs text-gray-500">@{report.reporterUsername}</p>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="capitalize text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
          {report.targetType || report.type || "user"}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
            report.status,
          )}`}
        >
          {getStatusLabel(report.status)}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(report)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          title="View report"
        >
          <i className="ri-eye-line" />
        </button>
      </td>
    </tr>
  );
}
