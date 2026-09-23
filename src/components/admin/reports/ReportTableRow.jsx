import { formatFullDateTime } from "../../../utils/date";
import { useLanguage } from "../../../context/LanguageContext";

function getStatusClasses(status) {
  switch (status) {
    case "pending":
      return "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30";
    case "reviewing":
      return "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30";
    case "resolved":
      return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30";
    case "dismissed":
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    default:
      return "bg-(--agri-hover) text-(--agri-text-secondary) border border-(--agri-border)";
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
    <tr className="border-b border-(--agri-border-subtle) last:border-0 hover:bg-(--agri-hover)/60 transition-colors">
      <td className="px-5 py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-(--agri-text) leading-tight">
              {report.reason || t("adminReport.noReason")}
            </p>
            {report.evidenceUrl && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-500/20" title={t("adminReport.proofImageAttached")}>
                <i className="ri-image-line" /> {t("adminReport.proofLabel")}
              </span>
            )}
          </div>

          {report.targetTitle && (
            <div className="flex items-center gap-1.5 text-xs text-(--agri-text-muted)">
              <span className="text-(--agri-text-muted) font-medium">{t("adminReport.targetLabel")}</span>
              <span className="font-semibold text-(--agri-text-secondary) truncate max-w-xs">{report.targetTitle}</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-(--agri-text)">
            {report.reporterName || t("adminReport.unknownUser")}
          </p>

          {report.reporterUsername && (
            <p className="text-xs text-(--agri-text-muted) font-medium">@{report.reporterUsername}</p>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="capitalize text-xs font-bold text-(--agri-text-secondary) bg-(--agri-hover) border border-(--agri-border) px-2.5 py-1 rounded-lg">
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
        <span className="text-xs font-semibold text-(--agri-text-secondary)">
          {formatFullDateTime(report.createdAt) || "—"}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(report)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--agri-hover) text-(--agri-text-secondary) transition hover:bg-[#2D6A4F] hover:text-white dark:hover:bg-(--agri-brand) dark:hover:text-white shadow-2xs cursor-pointer active:scale-95"
          title={t("adminReport.viewReportDetails")}
          aria-label={t("adminReport.viewReportAria")}
        >
          <i className="ri-eye-line text-base" />
        </button>
      </td>
    </tr>
  );
}
