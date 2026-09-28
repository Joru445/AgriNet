/**
 * Reusable PageHeader pattern for feature pages across Consumer, Farmer, and Admin.
 *
 * Supports:
 * - title (required)
 * - description (optional helper text)
 * - actions (primary / secondary buttons or toolbar)
 * - badge (status badge or counter)
 * - children (optional custom content below header)
 */
export default function PageHeader({
  title,
  description,
  actions,
  badge,
  className = "",
  children,
}) {
  return (
    <header className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-(--agri-text) truncate">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {description && (
            <p className="mt-1 text-sm text-(--agri-text-muted) leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
