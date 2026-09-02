import { useLanguage } from "../../../context/LanguageContext";

export default function DeleteProductModal({
  open,
  product,
  deleting,
  onCancel,
  onConfirm,
}) {
  const { t } = useLanguage();
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--agri-card)] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <i className="ri-delete-bin-line text-2xl text-red-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">{t("products.deleteTitle")}</h2>

            <p className="text-sm text-[var(--agri-text-muted)]">
              {t("products.deleteConfirm")}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[var(--agri-hover)]">
          <p className="font-semibold">{product.name}</p>

          <p className="text-sm text-[var(--agri-text-muted)]">{product.category}</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl border border-[var(--agri-border)] hover:bg-gray-100 cursor-pointer"
          >
            {t("common.cancel")}
          </button>

          <button
            onClick={() => onConfirm(product)}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white cursor-pointer disabled:opacity-50"
          >
            {deleting ? t("deleteProduct.deleting") : t("deleteProduct.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
