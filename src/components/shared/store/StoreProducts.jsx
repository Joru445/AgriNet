import { useState, useMemo } from "react";
import ProductCard from "../../common/ProductCard";

const CATEGORIES = [
  { id: "All", label: "All", icon: "ri-apps-2-line" },
  { id: "Vegetables", label: "Vegetables", icon: "ri-plant-line" },
  { id: "Fruits", label: "Fruits", icon: "ri-seedling-line" },
  { id: "Grains", label: "Grains", icon: "ri-leaf-line" },
  { id: "Livestock", label: "Livestock", icon: "ri-heart-pulse-line" },
  { id: "Herbs", label: "Herbs", icon: "ri-medicine-bottle-line" },
  { id: "Root Crops", label: "Root Crops", icon: "ri-earth-line" },
  { id: "Seafood", label: "Seafood", icon: "ri-water-flash-line" },
  { id: "Others", label: "Others", icon: "ri-shopping-basket-2-line" },
];

export default function StoreProducts({ farmer, products = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <section className="px-4 sm:px-6 py-8">
      {/* Products Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)]">Products</h2>

          <p className="text-sm text-[var(--agri-text-muted)]">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 && "s"} available
          </p>
        </div>
      </div>

      {/* Category Chips - In bottom of Products text */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none mb-4">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                active
                  ? "bg-[#1B4332] text-white shadow-sm ring-2 ring-[#2D6A4F]/30 scale-[1.02]"
                  : "bg-[var(--agri-card)] border border-[var(--agri-border)] text-[var(--agri-text-secondary)] hover:border-[#2D6A4F] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] hover:bg-[#F4F9F5]"
              }`}
            >
              <i
                className={`${cat.icon} text-sm ${
                  active ? "text-emerald-300" : "text-[#2D6A4F] dark:text-[var(--agri-brand)]"
                }`}
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--agri-border)] bg-[var(--agri-card)] py-14 text-center">
          <i className="ri-shopping-basket-line text-5xl text-[var(--agri-text-muted)]" />

          <h3 className="mt-3 text-lg font-semibold text-[var(--agri-text)]">
            {selectedCategory === "All"
              ? "No products yet"
              : `No ${selectedCategory} products`}
          </h3>

          <p className="text-[var(--agri-text-muted)] mt-1 text-sm">
            {selectedCategory === "All"
              ? `${farmer?.fullname || "Farmer"} hasn't listed any products.`
              : `No items available in the ${selectedCategory} category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
