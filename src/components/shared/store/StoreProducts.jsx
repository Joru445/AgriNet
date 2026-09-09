import { useState, useMemo } from "react";

import { useLanguage } from "../../../context/LanguageContext";

import ProductCard from "../../common/ProductCard";

export default function StoreProducts({ farmer, products = [] }) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const CATEGORIES = [
    { id: "All", label: t("storeProfile.all"), icon: "ri-apps-2-line" },
    { id: "Vegetables", label: t("storeProfile.vegetables"), icon: "ri-plant-line" },
    { id: "Fruits", label: t("storeProfile.fruits"), icon: "ri-seedling-line" },
    { id: "Grains", label: t("storeProfile.grains"), icon: "ri-leaf-line" },
    { id: "Livestock", label: t("storeProfile.livestock"), icon: "ri-heart-pulse-line" },
    { id: "Herbs", label: t("storeProfile.herbs"), icon: "ri-medicine-bottle-line" },
    { id: "Root Crops", label: t("storeProfile.rootCrops"), icon: "ri-earth-line" },
    { id: "Poultry", label: t("storeProfile.poultry"), icon: "ri-egg-line" },
    { id: "Meat", label: t("storeProfile.meat"), icon: "ri-restaurant-line" },
    { id: "Seafood", label: t("storeProfile.seafood"), icon: "ri-water-flash-line" },
    { id: "Others", label: t("storeProfile.others"), icon: "ri-shopping-basket-2-line" },
  ];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const isLimited = filteredProducts.length > 4 && !showAll;
  const displayedProducts = isLimited
    ? filteredProducts.slice(0, 4)
    : filteredProducts;

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setShowAll(false);
  };

  return (
    <section className="px-4 sm:px-6 py-8">
      {/* Products Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)]">{t("storeProfile.products")}</h2>

          <p className="text-sm text-[var(--agri-text-muted)]">
            {filteredProducts.length === 0
              ? t("storeProfile.noProductsYet")
              : isLimited
                ? t("storeProfile.showingOutOfProducts", {
                    shown: 4,
                    total: filteredProducts.length,
                  })
                : filteredProducts.length === 1
                  ? t("storeProfile.productAvailableSingular", { count: filteredProducts.length })
                  : t("storeProfile.productsAvailable", { count: filteredProducts.length })}
          </p>
        </div>

        {filteredProducts.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:underline cursor-pointer"
          >
            <span>
              {showAll
                ? t("storeProfile.showLess")
                : t("storeProfile.viewAllProducts")}
            </span>
            <i className={showAll ? "ri-arrow-up-s-line" : "ri-arrow-right-s-line"} />
          </button>
        )}
      </div>

      {/* Category Chips - In bottom of Products text */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none mb-4">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
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
              ? t("storeProfile.noProductsYet")
              : t("storeProfile.noProductsCategory", { category: selectedCategory })}
          </h3>

          <p className="text-[var(--agri-text-muted)] mt-1 text-sm">
            {selectedCategory === "All"
              ? t("storeProfile.noProductsListed", { farmer: farmer?.fullname || t("farmer.farmerFallback") })
              : t("storeProfile.noItemsCategory", { category: selectedCategory })}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length > 4 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2D6A4F]/30 bg-[var(--agri-card)] px-5 py-2.5 text-sm font-bold text-[#1B4332] dark:text-[var(--agri-brand)] shadow-2xs hover:bg-[#2D6A4F] hover:text-white dark:hover:bg-[#2D6A4F] dark:hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <span>
                  {showAll
                    ? t("storeProfile.showLess")
                    : t("storeProfile.viewAllProducts")}
                </span>
                <i className={showAll ? "ri-arrow-up-s-line text-lg" : "ri-arrow-down-s-line text-lg"} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
