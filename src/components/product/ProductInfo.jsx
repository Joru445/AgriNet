export default function ProductInfo({ product, reviewCount, averageRating }) {
  return (
    <section>
      <div className="mb-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            product.available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.available ? "Available" : "Unavailable"}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-[#1B4332]">{product.name}</h1>

      <div className="mt-3 flex items-center gap-2">
        <i className="ri-star-fill text-yellow-500" />

        <span className="font-semibold">{averageRating.toFixed(1)}</span>

        <span className="text-gray-500">({reviewCount} reviews)</span>
      </div>

      <div className="mt-6">
        <p className="text-4xl font-bold text-[#2D6A4F]">₱{product.price}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-100 px-4 py-2 text-sm">
          {product.category}
        </span>
      </div>
    </section>
  );
}
