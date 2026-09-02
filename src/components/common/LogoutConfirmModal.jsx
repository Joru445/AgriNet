import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useLanguage } from "../../context/LanguageContext";

export default function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
  loggingOut = false,
}) {
  const { t } = useLanguage();
  const [shouldRender, setShouldRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setAnimating(false);
    } else if (shouldRender) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  const isClosing = animating;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${isClosing ? "anim-fade-out" : "anim-fade-in"}`}
        onClick={onCancel}
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--agri-card)] p-6 shadow-2xl ${isClosing ? "anim-fade-out" : "anim-scale-in"}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100/80 text-red-600">
            <i className="ri-logout-box-r-line text-2xl" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[var(--agri-text)]">
              {t("common.logOut")}
            </h3>
            <p className="mt-1 text-sm text-[var(--agri-text-secondary)] font-medium">
              {t("common.logoutConfirmBody")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loggingOut}
            className="rounded-xl border border-[var(--agri-border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loggingOut}
            className="rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#b91c1c] shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? t("common.loggingOut") : t("common.yes")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
