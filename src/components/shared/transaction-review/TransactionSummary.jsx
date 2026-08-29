import productPlaceholder from "../../../assets/img/productPlaceholder.png";
import Avatar from "../../common/Avatar";

export default function TransactionSummary({ inquiry }) {
  if (!inquiry) {
    return null;
  }

  const product = inquiry.productSnapshot ?? {};

  const farmer = inquiry.farmerSnapshot ?? {};

  const productImage = getImageUrl(product.imageUrl) || productPlaceholder;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md">
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-[#2D6A4F] border border-green-200">
          <i className="ri-checkbox-circle-fill text-xs" />
          Completed Transaction
        </span>

        <h2 className="mt-2 text-lg font-bold text-gray-900">
          Transaction Review
        </h2>

        <p className="mt-0.5 text-sm text-gray-600 font-medium">
          Feedback and details about this completed order.
        </p>
      </div>

      <div className="flex gap-4 items-center bg-gray-50/80 rounded-xl p-3.5 border border-gray-200 shadow-2xs">
        <img
          src={productImage}
          alt={product.name || "Product"}
          className="
            h-20
            w-20
            shrink-0
            rounded-xl
            object-cover
            border border-gray-200
          "
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-gray-900 text-base">
            {product.name || "Product"}
          </h3>

          {product.price != null && (
            <p className="mt-0.5 text-sm font-bold text-[#2D6A4F]">
              ₱{product.price}
              {product.unit ? ` / ${product.unit}` : ""}
            </p>
          )}

          {inquiry.quantity != null && (
            <p className="mt-1 text-xs font-semibold text-gray-600">
              Quantity:{" "}
              <span className="font-bold text-gray-800">
                {inquiry.quantity} {product.unit || "units"}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4">
        <Avatar src={farmer.profilePicture} name={farmer.fullname} />

        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500">Farmer</p>

          <div className="flex items-center gap-1.5 min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              {farmer.fullname || farmer.username || "Farmer"}
            </p>
            {farmer.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-xs"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>
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
