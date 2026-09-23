import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";

export default function ProductTableRow({ product, onView, onToggleAvailability, actionLoading }) {
  const { t } = useLanguage();

  const isPreorder = product.sellingMode === "preorder";
  const isReported = product.totalReports > 0;
  
  return (
    <tr className="border-b border-(--agri-border-subtle) last:border-0 hover:bg-(--agri-hover)/50 transition-colors">
      {/* Product Image + Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-(--agri-hover) border border-(--agri-border-subtle) shadow-2xs">
            {product.images?.[0] ? (
              <img
                src={product.images?.[0].url}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-(--agri-text-muted)">
                <i className="ri-image-line" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-(--agri-text)">
              {product.name}
            </p>
            <p className="truncate text-xs text-(--agri-text-muted) font-medium">
              {product.category}
            </p>
          </div>
        </div>
      </td>

      {/* Farmer */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
            <i className="ri-user-line" />
          </span>
          <span className="text-sm font-semibold text-(--agri-text) truncate max-w-[160px]">
            {product.farmer?.fullname || product.farmer?.username || "—"}
          </span>
        </div>
      </td>

      {/* Price */}
      <td className="px-5 py-4">
        <span className="text-sm font-bold text-(--agri-text)">
          ₱{product.price.toLocaleString()}
        </span>
        <span className="text-xs text-(--agri-text-muted) font-medium">/{product.unit}</span>
      </td>

      {/* Stock */}
      <td className="px-5 py-4">
        <span className={`text-sm font-semibold ${product.stock <= 0 ? "text-red-600 dark:text-red-400" : "text-(--agri-text)"}`}>
          {product.stock} {product.unit}
        </span>
      </td>

      {/* Selling Mode */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${isPreorder ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20" : "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/20"}`}>
          <i className={isPreorder ? "ri-timer-line" : "ri-checkbox-circle-line"} />
          {isPreorder ? t("adminProduct.preorder") : t("adminProduct.availableNow")}
        </span>
        {isPreorder && product.preOrderLimit != null && (
          <p className="mt-1 text-[10px] text-(--agri-text-muted) font-medium">
            {product.reservedQuantity ?? 0}/{product.preOrderLimit} reserved
          </p>
        )}
      </td>

      {/* Availability */}
      <td className="px-5 py-4">
        <button
          onClick={() => onToggleAvailability(product.id, !product.available)}
          disabled={actionLoading}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs ${product.available ? "bg-[#2D6A4F]" : "bg-(--agri-border)"}`}
          title={product.available ? t("adminProduct.clickToDisable") : t("adminProduct.clickToEnable")}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${product.available ? "translate-x-4.5" : "translate-x-0.5"}`} />
        </button>
      </td>

      {/* Reports */}
      <td className="px-5 py-4">
        {isReported ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(product)}
            className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/25 hover:bg-orange-500/25 shadow-2xs text-xs font-bold"
          >
            <i className="ri-alert-line" />
            {product.totalReports}
            {product.pendingReports > 0 && (
              <span className="ml-0.5 text-[10px]">({product.pendingReports} pending)</span>
            )}
          </Button>
        ) : (
          <span className="text-xs text-(--agri-text-muted)">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <button
          onClick={() => onView(product)}
          className="rounded-lg p-2 text-(--agri-text-muted) hover:bg-(--agri-hover) hover:text-(--agri-text) border border-(--agri-border-subtle) shadow-2xs transition cursor-pointer"
          title={t("adminProduct.viewDetails")}
          aria-label={t("adminProduct.viewDetails")}
        >
          <i className="ri-eye-line text-lg" />
        </button>
      </td>
    </tr>
  );
}
