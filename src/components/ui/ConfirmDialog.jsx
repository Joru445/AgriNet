import { useLanguage } from "../../context/LanguageContext";
import Button from "./Button";
import Modal from "./Modal";

/**
 * Reusable confirmation dialog for destructive or important actions.
 *
 * Renders as a centered modal (via the shared Modal / overlay foundation)
 * with icon, title, description, and confirm/cancel buttons. Supports an
 * optional danger variant.
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

  const resolvedConfirm = confirmLabel ?? t("common.yes");
  const resolvedCancel = cancelLabel ?? t("common.cancel");

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-sm"
      hideTitleBar
      bodyClassName="p-6"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            danger
              ? "bg-red-100/80 text-red-600"
              : "bg-(--agri-hover) text-(--agri-text-muted)"
          }`}
        >
          <i className={`${icon} text-2xl`} />
        </div>

        <div>
          <h3 className="text-base font-bold text-(--agri-text)">{title}</h3>
          {description && (
            <p className="mt-1 text-sm font-medium text-(--agri-text-secondary)">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="cancel" size="md" onClick={onClose} disabled={loading}>
          {resolvedCancel}
        </Button>

        <Button
          variant={danger ? "danger" : "primary"}
          size="md"
          onClick={onConfirm}
          disabled={loading}
          loading={loading}
        >
          {resolvedConfirm}
        </Button>
      </div>
    </Modal>
  );
}