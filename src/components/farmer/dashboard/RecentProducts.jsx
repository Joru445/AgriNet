import { Link } from "react-router-dom";
import ProductCard from "../../common/ProductCard";

export default function RecentProducts({ products }) {
  const displayedProducts = products.slice(0, 3);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
        <Link
          to="/farmer/products"
          className="text-sm font-semibold text-[#2D6A4F] hover:text-[#1B4332] transition hover:underline"
        >
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No products yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
