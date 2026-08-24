function getImageUrl(images) {
  const image = images?.[0];

  if (typeof image === "string") {
    return image;
  }

  return image?.url || "";
}

export default function RecentProducts({ products = [] }) {
  const displayedProducts = products.slice(0, 4);

  return (
    <section className="rounded-2xl border border-gray-200/90 bg-white shadow-lg shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Products</h2>

          <p className="mt-0.5 text-xs text-gray-500 font-medium">
            Recently listed products
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 shadow-2xs">
          <i className="ri-shopping-bag-3-line text-base text-[#2D6A4F]" />
        </div>
      </div>

      {displayedProducts.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {displayedProducts.map((product) => {
            const imageUrl = getImageUrl(product.images);

            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50/60 transition-colors"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D8F3DC] text-[#2D6A4F]">
                    <i className="ri-shopping-basket-line text-lg" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {product.name || "Unnamed Product"}
                  </p>

                  <p className="truncate text-xs text-gray-500 font-medium mt-0.5">
                    {product.farmName || product.farmerName || "Unknown farmer"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[#1B4332]">
                    ₱{Number(product.price || 0).toLocaleString()}
                  </p>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      product.available ? "text-[#2D6A4F]" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        product.available ? "bg-[#2D6A4F]" : "bg-gray-400"
                      }`}
                    />
                    {product.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
