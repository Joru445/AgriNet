import { useLanguage } from "../../context/LanguageContext";
import Button from "./Button";

export default function EmptyState({
  icon = "ri-inbox-line",
  title,
  description,
  action,
  onAction,
  className = "",
}) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t("ui.emptyTitle");

  return (
    <div className={`flex flex-col items-center justify-center px-5 py-16 text-center anim-fade-in ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/15 text-[#2D6A4F] dark:text-(--agri-brand) anim-pop-in shadow-2xs">
        <i className={`${icon} text-3xl`} />
      </div>

      <h3 className="mt-5 text-base sm:text-lg font-bold text-(--agri-text) tracking-tight">
        {resolvedTitle}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-(--agri-text-muted) leading-relaxed">
          {description}
        </p>
      )}

      {action && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-6">
          {action}
        </Button>
      )}
    </div>
  );
}
