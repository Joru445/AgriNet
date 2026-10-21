import { useLanguage } from "../../context/LanguageContext";
import InquiryRow from "./InquiryRow";

export default function InquiryTable({
  inquiries,
  inquiryData,
  userRole,
  updatingId,
  onStatusChange,
  view = "grid",
  activeTab = "requests",
  counts = null,
  onSelectTab,
}) {
  const { t } = useLanguage();

  if (!inquiries.length) {
    const tabLabels = {
      requests: t("transactions.groups.requests"),
      confirmed: t("transactions.groups.confirmed"),
      preparation: t("transactions.groups.preparation"),
      "in-progress": t("transactions.groups.inProgress"),
      completed: t("transactions.groups.completed"),
      cancelled: t("transactions.groups.cancelled"),
    };

    const otherTabsWithItems = counts
      ? Object.entries(counts).filter(
          ([id, count]) => id !== activeTab && Number(count) > 0,
        )
      : [];

    return (
      <div className="rounded-2xl border border-dashed border-(--agri-border) bg-(--agri-card) px-5 py-14 text-center shadow-xs">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--agri-hover) text-(--agri-text-muted)">
          <i className="ri-inbox-line text-2xl" />
        </div>
        <p className="text-base font-bold text-(--agri-text-secondary)">{t("transactions.emptyTitle")}</p>

        <p className="mt-1 text-xs text-(--agri-text-muted)">
          {t("transactions.emptySubtitle")}
        </p>

        {otherTabsWithItems.length > 0 && onSelectTab && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {otherTabsWithItems.map(([tabId, count]) => (
              <button
                key={tabId}
                type="button"
                onClick={() => onSelectTab(tabId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D6A4F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1b4332] cursor-pointer shadow-xs"
              >
                <i className="ri-arrow-right-line text-sm" />
                <span>
                  {tabLabels[tabId] || tabId} ({count})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-1 lg:grid-cols-3 gap-4"
          : "space-y-4"
      }
    >
      {inquiries.map((inquiry) => {
        const data = inquiryData[inquiry.id];

        return (
          <InquiryRow
            key={inquiry.id}
            inquiry={inquiry}
            product={data?.product}
            consumer={data?.consumer}
            farmer={data?.farmer}
            userRole={userRole}
            updating={updatingId === inquiry.id}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
}
