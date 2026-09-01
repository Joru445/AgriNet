export default function EmptyState({
  icon = "ri-inbox-line",
  title = "Nothing here yet",
  description,
  action,
  onAction,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-5 py-16 text-center anim-fade-in ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--agri-hover)] anim-pop-in">
        <i className={`${icon} text-2xl text-[var(--agri-text-muted)]`} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[var(--agri-text)]">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--agri-text-muted)]">{description}</p>
      )}

      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B4332] cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
}
