import { useLanguage } from "../../../context/LanguageContext";
import { formatTimestamp } from "../../../utils/date";

const STATUS_CONFIG = {
  pending: { color: "bg-gray-500/10 text-gray-600", labelKey: "adminTransaction.statusPending" },
  accepted: { color: "bg-emerald-500/10 text-emerald-600", labelKey: "adminTransaction.statusAccepted" },
  reserved: { color: "bg-violet-500/10 text-violet-600", labelKey: "adminTransaction.statusReserved" },
  ongoing: { color: "bg-blue-500/10 text-blue-600", labelKey: "adminTransaction.statusOngoing" },
  awaiting_proof: { color: "bg-blue-500/10 text-blue-600", labelKey: "adminTransaction.statusAwaitingProof" },
  proof_submitted: { color: "bg-orange-500/10 text-orange-600", labelKey: "adminTransaction.statusProofSubmitted" },
  completed: { color: "bg-green-500/10 text-green-600", labelKey: "adminTransaction.statusCompleted" },
  cancelled: { color: "bg-gray-500/10 text-gray-500", labelKey: "adminTransaction.statusCancelled" },
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
    <tr className="border-b border-[var(--agri-border-subtle)] last:border-0 hover:bg-[var(--agri-hover)]/80 transition-colors">
      {/* Product */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--agri-hover)]">
            {(inquiry.product?.images?.[0] || inquiry.productSnapshot?.imageUrl) ? (
              <img
                src={inquiry.product?.images?.[0].url || inquiry.productSnapshot?.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--agri-text-muted)]">
                <i className="ri-image-line" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
              {productName}
            </p>
            <p className="truncate text-xs text-[var(--agri-text-muted)]">
              {quantity} {unit} × ₱{price.toLocaleString()}
            </p>
          </div>
        </div>
      </td>

      {/* Farmer */}
      <td className="px-5 py-4">
        <span className="text-sm font-medium text-[var(--agri-text-secondary)]">
          {farmerName}
        </span>
      </td>

      {/* Consumer */}
      <td className="px-5 py-4">
        <span className="text-sm font-medium text-[var(--agri-text-secondary)]">
          {consumerName}
        </span>
      </td>

      {/* Type */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isPreorder ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
          <i className={isPreorder ? "ri-timer-line" : "ri-shopping-bag-line"} />
          {isPreorder ? t("adminTransaction.typePreorder") : t("adminTransaction.typeStandard")}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCfg.color}`}>
          {t(statusCfg.labelKey)}
        </span>
      </td>

      {/* Date */}
      <td className="px-5 py-4">
        <span className="text-xs text-[var(--agri-text-muted)]">
          {formatTimestamp(inquiry.createdAt) || "—"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <button
          onClick={() => onView(inquiry)}
          className="rounded-lg p-2 text-[var(--agri-text-muted)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text)] transition cursor-pointer"
          title={t("adminTransaction.viewDetails")}
          aria-label={t("adminTransaction.viewDetails")}
        >
          <i className="ri-eye-line text-lg" />
        </button>
      </td>
    </tr>
  );
}
