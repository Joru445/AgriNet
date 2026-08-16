import productPlaceholder from "../assets/img/productPlaceholder.png";

export function getProductImage(product) {
  const image = product?.imageUrl ?? product?.images?.[0];
  return typeof image === "string" ? image : image?.url || productPlaceholder;
}
