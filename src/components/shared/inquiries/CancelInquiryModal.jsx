import { createPortal } from "react-dom";
import { useLanguage } from "../../../context/LanguageContext";

export default function CancelInquiryModal({
  open,
  onCancel,
  onConfirm,
  cancelling = false,
}) {
  const { t } = useLanguage();
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--agri-card)] p-6 shadow-2xl anim-scale-in">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <i className="ri-close-circle-line text-2xl" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[var(--agri-text)]">
              {t("transactions.cancelModal.title")}
            </h3>
            <p className="mt-1 text-sm text-[var(--agri-text-secondary)] font-medium">
              {t("transactions.cancelModal.body")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer disabled:opacity-50"
          >
            {t("transactions.cancelModal.no")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#b91c1c] shadow-xs cursor-pointer disabled:opacity-50"
          >
            {cancelling ? t("transactions.cancelModal.cancelling") : t("transactions.cancelModal.confirm")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
