const categories = [
  { id: "All", label: "All Produce", icon: "ri-apps-2-line" },
  { id: "Vegetables", label: "Vegetables", icon: "ri-plant-line" },
  { id: "Fruits", label: "Fruits", icon: "ri-seedling-line" },
  { id: "Grains", label: "Grains & Rice", icon: "ri-leaf-line" },
  { id: "Livestock", label: "Livestock", icon: "ri-heart-pulse-line" },
  { id: "Poultry", label: "Poultry", icon: "ri-heart-line" },
  { id: "Herbs", label: "Herbs", icon: "ri-medicine-bottle-line" },
  { id: "Root Crops", label: "Root Crops", icon: "ri-earth-line" },
];

export default function CategoryChips({ value, onChange }) {
  return (
    <div className="w-full flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
      {categories.map((cat) => {
        const active = (value || "All") === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs ${active
              ? "bg-[#1B4332] text-white shadow-md shadow-[#1B4332]/20 ring-2 ring-[#2D6A4F]/30 scale-[1.02]"
              : "bg-white border border-[#DCE8DF] text-gray-700 hover:border-[#2D6A4F] hover:text-[#2D6A4F] hover:bg-[#F4F9F5]"
              }`}
          >
            <i className={`${cat.icon} text-base ${active ? "text-emerald-300" : "text-[#2D6A4F]"}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
