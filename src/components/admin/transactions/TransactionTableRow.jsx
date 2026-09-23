import { useLanguage } from "../../../context/LanguageContext";
import { formatTimestamp } from "../../../utils/date";

const STATUS_CONFIG = {
  pending: { color: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20", labelKey: "adminTransaction.statusPending" },
  accepted: { color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20", labelKey: "adminTransaction.statusAccepted" },
  reserved: { color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20", labelKey: "adminTransaction.statusReserved" },
  ongoing: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20", labelKey: "adminTransaction.statusOngoing" },
  awaiting_proof: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20", labelKey: "adminTransaction.statusAwaitingProof" },
  proof_submitted: { color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20", labelKey: "adminTransaction.statusProofSubmitted" },
  completed: { color: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20", labelKey: "adminTransaction.statusCompleted" },
  cancelled: { color: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20", labelKey: "adminTransaction.statusCancelled" },
};

export default function TransactionTableRow({ inquiry, onView }) {
  const { t } = useLanguage();

  const statusCfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.pending;
  const isPreorder = inquiry.type === "preorder";
  const productName = inquiry.productSnapshot?.name || inquiry.product?.name || "—";
  const farmerName = inquiry.farmerSnapshot?.fullname || inquiry.farmer?.fullname || inquiry.farmer?.username || "—";
  const consumerName = inquiry.consumerSnapshot?.fullname || inquiry.consumer?.fullname || inquiry.consumer?.username || "—";
  const quantity = inquiry.quantity || 0;
  const unit = inquiry.productSnapshot?.unit || inquiry.product?.unit || "kg";
  const price = inquiry.productSnapshot?.price || inquiry.product?.price || 0;

  return (
    <tr className="border-b border-(--agri-border-subtle) last:border-0 hover:bg-(--agri-hover)/50 transition-colors">
      {/* Product */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-(--agri-hover) border border-(--agri-border-subtle) shadow-2xs">
            {(inquiry.product?.images?.[0] || inquiry.productSnapshot?.imageUrl) ? (
              <img
                src={inquiry.product?.images?.[0].url || inquiry.productSnapshot?.imageUrl}
                alt=""
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
              {productName}
            </p>
            <p className="truncate text-xs text-(--agri-text-muted) font-medium">
              {quantity} {unit} × ₱{price.toLocaleString()}
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
            {farmerName}
          </span>
        </div>
      </td>

      {/* Consumer */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
            <i className="ri-shopping-cart-line" />
          </span>
          <span className="text-sm font-semibold text-(--agri-text) truncate max-w-[160px]">
            {consumerName}
          </span>
        </div>
      </td>

      {/* Type */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${isPreorder ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20" : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20"}`}>
          <i className={isPreorder ? "ri-timer-line" : "ri-shopping-bag-line"} />
          {isPreorder ? t("adminTransaction.typePreorder") : t("adminTransaction.typeStandard")}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${statusCfg.color}`}>
          {t(statusCfg.labelKey)}
        </span>
      </td>

      {/* Date */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-(--agri-text-secondary) font-medium">
          <i className="ri-time-line text-(--agri-text-muted)" />
          <span>{formatTimestamp(inquiry.createdAt) || "—"}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <button
          onClick={() => onView(inquiry)}
          className="rounded-lg p-2 text-(--agri-text-muted) hover:bg-(--agri-hover) hover:text-(--agri-text) border border-(--agri-border-subtle) shadow-2xs transition cursor-pointer"
          title={t("adminTransaction.viewDetails")}
          aria-label={t("adminTransaction.viewDetails")}
        >
          <i className="ri-eye-line text-lg" />
        </button>
      </td>
    </tr>
  );
}
