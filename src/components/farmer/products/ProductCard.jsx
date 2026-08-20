import productPlaceholder from "../../../assets/img/productPlaceholder.png"

export default function ProductCard({ product, view, onEdit, onDelete }) {
  const image = product.images?.[0]?.url || productPlaceholder;

  if (view === "list") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
        <img
          src={image}
          alt={product.name}
          className="w-24 h-24 rounded-xl object-cover"
        />

        <div className="flex-1">
          <h3 className="font-semibold">{product.name}</h3>

          <p className="text-sm text-gray-500">{product.category}</p>

          <div className="mt-2 flex gap-4 text-sm">
            <span>
              ₱{product.price}/{product.unit}
            </span>

            <span>
              {product.stock} {product.unit}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <i className="ri-edit-line" />
          </button>

          <button
            onClick={() => onDelete(product)}
            className="w-10 h-10 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
          >
            <i className="ri-delete-bin-line" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="relative">
        <img
          src={image}
          alt={product.name}
          className="h-48 w-full object-cover"
        />

        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
            product.available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {product.available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold truncate">{product.name}</h3>

        <p className="text-sm text-gray-500">{product.category}</p>

        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="font-bold text-[#2D6A4F]">₱{product.price}</p>

            <p className="text-xs text-gray-400">
              {product.stock} {product.unit}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <i className="ri-edit-line" />
            </button>

            <button
              onClick={() => onDelete(product)}
              className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
            >
              <i className="ri-delete-bin-line" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
