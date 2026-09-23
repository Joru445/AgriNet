import ProductCard from "../../products/ProductCard";

const DEFAULT_GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6";

export default function ProductGrid({ products, gridClassName = DEFAULT_GRID_CLASS }) {
  if (!products.length) {
    return null;
  }

  return (
    <div className={gridClassName}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
