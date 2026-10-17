import { isProductExpired } from "./productExpiration";
import { getProductAvailability } from "./productStatus";

/** Apply runtime-only checks to a server-paginated marketplace page. */
export function filterMarketplaceProducts(items, filters, location) {
  const search = String(filters?.search || "").trim().toLowerCase();
  return items.filter((product) => {
    if (
      search &&
      ![
        product.name,
        product.category,
        product.farmer?.fullname,
        product.farmer?.username,
        product.farmer?.storeName,
      ].some((part) => String(part || "").toLowerCase().includes(search))
    ) return false;
    if (isProductExpired(product) && !filters.showUnavailable) return false;
    if (!filters.showUnavailable && !getProductAvailability(product).allowed) return false;
    const price = Number(product.price || 0);
    if ((filters.minPrice && price < filters.minPrice) || (filters.maxPrice && price > filters.maxPrice)) return false;
    if (Number(product.productRating || 0) < filters.rating) return false;
    return !(location && product.distance != null && product.distance > filters.distance);
  });
}
