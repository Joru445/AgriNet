import { useLanguage } from "../../context/LanguageContext";

export default function InquiryTabs({ activeTab, onChange }) {
  const { t } = useLanguage();
  const tabs = [
    { id: "requests", label: t("transactions.groups.requests") },
    { id: "confirmed", label: t("transactions.groups.confirmed") },
    { id: "preparation", label: t("transactions.groups.preparation") },
    { id: "in-progress", label: t("transactions.groups.inProgress") },
    { id: "completed", label: t("transactions.groups.completed") },
    { id: "cancelled", label: t("transactions.groups.cancelled") },
  ];

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-(--agri-border-subtle) scrollbar-none">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all active:bg-(--agri-hover) active:scale-95 ${active
                ? "border-[#2D6A4F] text-[#2D6A4F] dark:text-(--agri-brand)"
                : "border-transparent text-(--agri-text-muted) hover:text-(--agri-text-secondary)"
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
