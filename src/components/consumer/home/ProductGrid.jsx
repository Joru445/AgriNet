import ProductCard from "../../common/ProductCard";
import EmptyProducts from "./EmptyProducts";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <EmptyProducts />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
