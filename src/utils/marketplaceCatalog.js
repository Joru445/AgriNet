import { isProductExpired } from "./productExpiration";
import { getProductAvailability } from "./productStatus";

/** Apply runtime-only checks to a server-paginated marketplace page. */
export function filterMarketplaceProducts(items, filters, location) {
  const search = String(filters?.search || "").trim().toLowerCase();
  const selectedCategory = String(filters?.category || "").trim().toLowerCase();
  return items.filter((product) => {
    if (selectedCategory && selectedCategory !== "all") {
      const productCat = String(product.category || "").trim().toLowerCase();
      if (selectedCategory === "others" || selectedCategory === "other") {
        if (productCat !== "others" && productCat !== "other") return false;
      } else if (
        selectedCategory === "root-crops" ||
        selectedCategory === "rootcrops" ||
        selectedCategory === "root crops"
      ) {
        if (!["root-crops", "rootcrops", "root crops"].includes(productCat)) return false;
      } else if (productCat !== selectedCategory) {
        return false;
      }
    }
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
