function getImageUrl(images) {
  const image = images?.[0];

  if (typeof image === "string") {
    return image;
  }

  return image?.url || "";
}

export default function RecentProducts({ products = [] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900">Recent Products</h2>

        <p className="mt-1 text-sm text-gray-500">Recently listed products</p>
      </div>

      {products.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {products.map((product) => {
            const imageUrl = getImageUrl(product.images);

            return (
              <div key={product.id} className="flex items-center gap-4 p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D8F3DC]">
                    <i className="ri-shopping-basket-line text-lg text-[#2D6A4F]" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name || "Unnamed Product"}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {product.farmName || product.farmerName || "Unknown farmer"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₱{Number(product.price || 0).toLocaleString()}
                  </p>

                  <p
                    className={`text-xs ${
                      product.available ? "text-[#2D6A4F]" : "text-gray-400"
                    }`}
                  >
                    {product.available ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
