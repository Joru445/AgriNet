import { Link } from "react-router-dom";

import defaultAvatar from "../../assets/img/defaultAvatar.png";

export default function ProductCard({ product }) {
  const image =
    product.images?.[0]?.url ?? product.images?.[0] ?? "/placeholder.png";

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {!product.available && (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            Out of Stock
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-gray-900">{product.name}</h3>

            <p className="text-sm text-gray-500">{product.category}</p>
          </div>

          <div className="min-w-0">
            <span className="whitespace-nowrap font-bold text-[#2D6A4F]">
              ₱{Number(product.price).toFixed(2)}/{product.unit}
            </span>
            <p className="text-sm text-gray-400 justify-self-end">{product.stock} stocks</p>
          </div>
        </div>

        {/* Farmer */}
        <div className="flex items-center gap-3">
          <img
            src={product.farmer?.profilePicture || defaultAvatar}
            alt={product.farmer?.fullname}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{product.farmer?.fullname}</p>

            <p className="truncate text-sm text-gray-500">
              {product.farmer?.farmName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            {product.reviewCount > 0 ? (
              <>
                <i className="ri-star-fill" />
                <span>{product.productRating}</span>
                <span className="text-gray-400">({product.reviewCount})</span>
              </>
            ) : (
              <span className="text-gray-400">No reviews</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <i className="ri-map-pin-line" />

            <span>
              {product.distance == null
                ? "--"
                : `${product.distance.toFixed(1)} km`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
