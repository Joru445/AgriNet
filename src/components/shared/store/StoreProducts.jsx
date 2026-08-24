import ProductCard from "../../common/ProductCard";

export default function StoreProducts({ farmer, products }) {
  return (
    <section className="px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#1B4332]">Products</h2>

          <p className="text-sm text-gray-500">
            {products.length} product{products.length !== 1 && "s"} available
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <i className="ri-shopping-basket-line text-5xl text-gray-300" />

          <h3 className="mt-4 text-lg font-semibold">No products yet</h3>

          <p className="text-gray-500 mt-2">
            {farmer.fullname} hasn't listed any products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
