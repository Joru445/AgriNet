import ProductCard from "./ProductCard";
import EmptyProducts from "./EmptyProducts";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <EmptyProducts />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
