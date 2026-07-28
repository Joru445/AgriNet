const categories = [
  "All",
  "Vegetables",
  "Fruits",
  "Grains",
  "Livestock",
  "Herbs",
  "Root Crops",
];

const icons = {
  All: "ri-apps-line",
  Vegetables: "ri-plant-line",
  Fruits: "ri-seedling-line",
  Grains: "ri-leaf-line",
  Livestock: "ri-heart-line",
  Herbs: "ri-medicine-bottle-line",
  "Root Crops": "ri-earth-line",
};

export default function CategoryChips({ value, onChange }) {
  return (
    <div className="max-w-4xl mx-auto mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const active = value === category;

        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              active
                ? "bg-[#2D6A4F] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
            }`}
          >
            <i className={icons[category]} />

            {category === "All" ? "All Products" : category}
          </button>
        );
      })}
    </div>
  );
}
