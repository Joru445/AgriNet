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
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "border-[#2D6A4F] text-[#2D6A4F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
