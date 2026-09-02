import { formatFullDateTime } from "../../../utils/date";
import { useLanguage } from "../../../context/LanguageContext";

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

export default function ReportTableRow({ report, onView }) {
  const { t } = useLanguage();

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return t("adminReport.pending");
      case "reviewing":
        return t("adminReport.reviewing");
      case "resolved":
        return t("adminReport.resolved");
      case "dismissed":
        return t("adminReport.dismissed");
      default:
        return status || t("adminReport.unknown");
    }
  };

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors">
      <td className="px-5 py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {report.reason || t("adminReport.noReason")}
            </p>
            {report.evidenceUrl && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200" title={t("adminReport.proofImageAttached")}>
                <i className="ri-image-line" /> {t("adminReport.proofLabel")}
              </span>
            )}
          </div>

          {report.targetTitle && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-gray-400 font-medium">{t("adminReport.targetLabel")}</span>
              <span className="font-semibold text-gray-800 truncate max-w-xs">{report.targetTitle}</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {report.reporterName || t("adminReport.unknownUser")}
          </p>

          {report.reporterUsername && (
            <p className="text-xs text-gray-500 font-medium">@{report.reporterUsername}</p>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="capitalize text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200/80 px-2.5 py-1 rounded-lg">
          {report.targetType || report.type || "user"}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize shadow-2xs ${getStatusClasses(
            report.status,
          )}`}
        >
          {getStatusLabel(report.status)}
        </span>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <span className="text-xs font-semibold text-gray-700">
          {formatFullDateTime(report.createdAt) || "—"}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(report)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-[#2D6A4F] hover:text-white shadow-2xs cursor-pointer active:scale-95"
          title={t("adminReport.viewReportDetails")}
          aria-label={t("adminReport.viewReportAria")}
        >
          <i className="ri-eye-line text-base" />
        </button>
      </td>
    </tr>
  );
}
