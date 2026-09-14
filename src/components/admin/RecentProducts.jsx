import { useLanguage } from "../../context/LanguageContext";

function getImageUrl(images) {
  const image = images?.[0];

  if (typeof image === "string") {
    return image;
  }

  return image?.url || "";
}

export default function RecentProducts({ products = [], showHeader = true }) {
  const { t } = useLanguage();
  const displayedProducts = products.slice(0, 4);

  if (showHeader) {
    return (
      <section className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) shadow-lg shadow-black/5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-(--agri-border-subtle) px-3 py-2 bg-(--agri-hover)/50">
          <div>
            <h2 className="text-sm font-bold text-(--agri-text)">{t("admin.recentProducts")}</h2>
            <p className="mt-0.5 text-[11px] text-(--agri-text-muted) font-medium">
              {t("admin.recentlyListed")}
            </p>
          </div>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="p-4 text-center text-xs font-medium text-(--agri-text-muted)">
            {t("admin.noProductsFound")}
          </div>
        ) : (
          <div className="divide-y divide-(--agri-border-subtle)">
            {displayedProducts.map((product) => {
              const imageUrl = getImageUrl(product.images);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-(--agri-hover)/60 transition-colors"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name || "Product"}
                      className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-(--agri-brand)">
                      <i className="ri-shopping-basket-line text-xs" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-(--agri-text)">
                      {product.name || "Unnamed Product"}
                    </p>
                    <p className="truncate text-[11px] text-(--agri-text-muted) font-medium mt-0.5">
                      {product.storeName || product.farmerName || "Unknown farmer"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-[#1B4332] dark:text-(--agri-brand-light)">
                      ₱{Number(product.price || 0).toLocaleString()}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        product.available ? "text-[#2D6A4F] dark:text-(--agri-brand)" : "text-(--agri-text-muted)"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          product.available ? "bg-[#2D6A4F]" : "bg-(--agri-text-muted)"
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {displayedProducts.length === 0 ? (
        <div className="p-4 text-center text-xs font-medium text-(--agri-text-muted)">
          {t("admin.noProductsFound")}
        </div>
      ) : (
        <div className="divide-y divide-(--agri-border-subtle)">
          {displayedProducts.map((product) => {
            const imageUrl = getImageUrl(product.images);
            return (
              <div
                key={product.id}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-(--agri-hover)/60 transition-colors"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-(--agri-brand)">
                    <i className="ri-shopping-basket-line text-xs" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-(--agri-text)">
                    {product.name || "Unnamed Product"}
                  </p>
                  <p className="truncate text-[11px] text-(--agri-text-muted) font-medium mt-0.5">
                    {product.storeName || product.farmerName || "Unknown farmer"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-[#1B4332] dark:text-(--agri-brand-light)">
                    ₱{Number(product.price || 0).toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      product.available ? "text-[#2D6A4F] dark:text-(--agri-brand)" : "text-(--agri-text-muted)"
                    }`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${
                        product.available ? "bg-[#2D6A4F]" : "bg-(--agri-text-muted)"
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
    </div>
  );
}
