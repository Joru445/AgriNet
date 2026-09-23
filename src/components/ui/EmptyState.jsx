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
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--agri-hover) anim-pop-in">
        <i className={`${icon} text-2xl text-(--agri-text-muted)`} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-(--agri-text)">{resolvedTitle}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-(--agri-text-muted)">{description}</p>
      )}

      {action && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-5">
          {action}
        </Button>
      )}
    </div>
  );
}
