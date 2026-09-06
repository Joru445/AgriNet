import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useLanguage } from "../../context/LanguageContext";

/**
 * Reusable confirmation dialog for destructive or important actions.
 *
 * Renders as a centered modal with icon, title, description, and
 * confirm/cancel buttons. Supports an optional danger variant.
 *
 * Props:
 *   open        — boolean
 *   onClose     — called when user clicks cancel or backdrop
 *   onConfirm   — called when user clicks confirm
 *   title       — dialog title
 *   description — body text
 *   confirmLabel — override confirm button label
 *   cancelLabel  — override cancel button label
 *   icon        — Remix icon class (default: ri-question-line)
 *   danger      — use red confirm button for destructive actions
 *   loading     — disable buttons while async action is in progress
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  icon = "ri-question-line",
  danger = false,
  loading = false,
}) {
  const { t } = useLanguage();
  const [shouldRender, setShouldRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  const resolvedConfirm = confirmLabel ?? t("common.yes");
  const resolvedCancel = cancelLabel ?? t("common.cancel");

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
      <div
        className={`absolute inset-0 ${isClosing ? "anim-fade-out" : "anim-fade-in"}`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--agri-card)] p-6 shadow-2xl ${isClosing ? "anim-fade-out" : "anim-scale-in"}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              danger
                ? "bg-red-100/80 text-red-600"
                : "bg-[var(--agri-hover)] text-[var(--agri-text-muted)]"
            }`}
          >
            <i className={`${icon} text-2xl`} />
          </div>

          <div>
            <h3 className="text-base font-bold text-[var(--agri-text)]">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-[var(--agri-text-secondary)] font-medium">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[var(--agri-border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer disabled:opacity-50"
          >
            {resolvedCancel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition shadow-xs cursor-pointer disabled:opacity-50 ${
              danger
                ? "bg-[#dc2626] hover:bg-[#b91c1c]"
                : "bg-[var(--agri-brand)] hover:opacity-90"
            }`}
          >
            {loading ? t("common.loading") : resolvedConfirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
