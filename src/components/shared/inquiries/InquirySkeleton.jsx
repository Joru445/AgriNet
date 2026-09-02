import { useLanguage } from "../../../context/LanguageContext";

export default function InquirySkeleton() {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--agri-hover)]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--agri-text-muted)]">
                {t("inquiries.table.product")}
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--agri-text-muted)]">
                {t("inquiries.table.consumer")}
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--agri-text-muted)]">
                {t("inquiries.table.date")}
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--agri-text-muted)]">
                {t("inquiries.table.status")}
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--agri-text-muted)]">
                {t("inquiries.table.action")}
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse border-t border-[var(--agri-border-subtle)]">
                {/* Product */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--agri-hover)]" />

                    <div className="space-y-2">
                      <div className="h-3 w-32 rounded bg-[var(--agri-hover)]" />
                      <div className="h-2.5 w-16 rounded bg-[var(--agri-hover)]/60" />
                    </div>
                  </div>
                </td>

                {/* Consumer */}
                <td className="px-5 py-3">
                  <div className="h-3 w-24 rounded bg-[var(--agri-hover)]" />
                </td>

                {/* Date */}
                <td className="px-5 py-3">
                  <div className="h-3 w-20 rounded bg-[var(--agri-hover)]" />
                </td>

                {/* Status */}
                <td className="px-5 py-3">
                  <div className="h-6 w-16 rounded-full bg-[var(--agri-hover)]" />
                </td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-8 rounded bg-[var(--agri-hover)]" />
                    <div className="h-4 w-4 rounded bg-[var(--agri-hover)]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
