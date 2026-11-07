import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function InquiryTabs({ activeTab, onChange, counts = null, userRole }) {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const role = userRole || profile?.role;
  const isConsumer = role === "consumer";

  const tabs = [
    !isConsumer && { id: "requests", label: t("transactions.groups.requests") },
    { id: "in-progress", label: t("transactions.groups.inProgress") },
    { id: "completed", label: t("transactions.groups.completed") },
    { id: "cancelled", label: t("transactions.groups.cancelled") },
  ].filter(Boolean);

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-(--agri-border-subtle) scrollbar-none">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const count = counts ? Number(counts[tab.id] || 0) : 0;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all active:bg-(--agri-hover) active:scale-95 flex items-center gap-2 ${active
                ? "border-[#2D6A4F] text-[#2D6A4F] dark:text-(--agri-brand)"
                : "border-transparent text-(--agri-text-muted) hover:text-(--agri-text-secondary)"
              }`}
          >
            <span>{tab.label}</span>
            {count > 0 && (
              <span
                className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums transition-colors ${
                  active
                    ? "bg-[#2D6A4F] text-white dark:bg-(--agri-brand) dark:text-black"
                    : "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-(--agri-brand)/20 dark:text-(--agri-brand)"
                }`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
