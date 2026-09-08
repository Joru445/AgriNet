export default function DashboardSection({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  compact = false,
  fill = false,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-lg shadow-black/5 ${
        fill ? "flex min-h-0 flex-col" : ""
      } ${className}`}
    >
      <div
        className={`flex items-center justify-between border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 ${
          compact ? "px-3 py-2" : "p-5"
        }`}
      >
        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
          {icon && (
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[var(--agri-brand)] ${
                compact ? "h-7 w-7" : "h-9 w-9"
              }`}
            >
              <i className={`${icon} ${compact ? "text-sm" : "text-base"}`} />
            </div>
          )}

          <div>
            <h2
              className={`font-bold text-[var(--agri-text)] ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {title}
            </h2>

            {subtitle && (
              <p
                className={`${
                  compact ? "mt-0.5 text-[11px]" : "mt-0.5 text-xs"
                } text-[var(--agri-text-muted)] font-medium`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {headerAction}
      </div>

      <div className={`${fill ? "min-h-0 flex-1" : ""} ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}