import productPlaceholder from "../../assets/img/productPlaceholder.png";
import Avatar from "../../common/Avatar";

export default function TransactionSummary({ inquiry }) {
  if (!inquiry) {
    return null;
  }

  const product = inquiry.productSnapshot ?? {};

  const farmer = inquiry.farmerSnapshot ?? {};

  const productImage = getImageUrl(product.imageUrl) || productPlaceholder;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#2D6A4F]">
          Completed transaction
        </p>

        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          Transaction review
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Experience with the farmer and the product.
        </p>
      </div>

      <div className="flex gap-4">
        <img
          src={productImage}
          alt={product.name || "Product"}
          className="
            h-20
            w-20
            shrink-0
            rounded-xl
            object-cover
          "
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">
            {product.name || "Product"}
          </h3>

          {product.price != null && (
            <p className="mt-1 text-sm text-gray-600">
              ₱{product.price}
              {product.unit ? ` / ${product.unit}` : ""}
            </p>
          )}

          {inquiry.quantity != null && (
            <p className="mt-1 text-sm text-gray-500">
              Quantity:{" "}
              <span className="font-medium text-gray-700">
                {inquiry.quantity}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
        <Avatar src={farmer.profilePicture} name={farmer.fullname} />

        <div className="min-w-0">
          <p className="text-xs text-gray-500">Farmer</p>

          <p className="truncate text-sm font-semibold text-gray-900">
            {farmer.fullname || farmer.username || "Farmer"}
          </p>
        </div>
      </div>
    </section>
  );
}

function getImageUrl(image) {
  if (typeof image === "string") {
    return image;
  }

  return image?.url || "";
}
