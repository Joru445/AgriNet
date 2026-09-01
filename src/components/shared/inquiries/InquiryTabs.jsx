export default function InquiryTabs({ activeTab, onChange }) {
  const tabs = [
    {
      id: "all",
      label: "All",
    },
    {
      id: "accepted",
      label: "Accepted",
    },
    {
      id: "ongoing",
      label: "Ongoing",
    },
    {
      id: "completed",
      label: "Completed",
    },
    {
      id: "cancelled",
      label: "Cancelled",
    },
  ];

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--agri-border-subtle)] scrollbar-none">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all active:bg-[var(--agri-hover)] active:scale-95 ${active
                ? "border-[#2D6A4F] text-[#2D6A4F] dark:text-[var(--agri-brand)]"
                : "border-transparent text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]"
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
