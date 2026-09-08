import SkeletonBox from "../common/SkeletonBox";
import RangeSelector from "./RangeSelector";

/**
 * Wrapper for analytics chart cards. Handles a header (title + subtitle +
 * optional range selector) and the standard loading / empty / error states.
 *
 * Children (charts) own their own explicit heights.
 */
export default function ChartCard({
  title,
  subtitle,
  range,
  onRangeChange,
  loading = false,
  error = null,
  empty = false,
  emptyIcon = "ri-line-chart-line",
  emptyTitle,
  emptyDescription,
  children,
  className = "",
}) {
  const body = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-3" style={{ minHeight: 224 }}>
          <div className="w-full space-y-2">
            <SkeletonBox className="h-44 w-full" />
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-2 w-8" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center"
          style={{ minHeight: 224 }}
        >
          <i className="ri-error-warning-line text-2xl text-red-400" />
          <p className="text-sm font-medium text-(--agri-text-secondary)">
            {error?.message || "Failed to load analytics."}
          </p>
        </div>
      );
    }

    if (empty) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center"
          style={{ minHeight: 224 }}
        >
          <i className={`${emptyIcon} text-2xl text-(--agri-text-muted)`} />
          <p className="text-sm font-semibold text-(--agri-text-secondary)">
            {emptyTitle}
          </p>
          {emptyDescription && (
            <p className="max-w-xs text-xs text-(--agri-text-muted)">{emptyDescription}</p>
          )}
        </div>
      );
    }

    return <div className="p-3">{children}</div>;
  };

  return (
    <section
      className={`rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) shadow-lg shadow-black/5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-(--agri-text)">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] font-medium text-(--agri-text-muted)">
              {subtitle}
            </p>
          )}
        </div>

        {onRangeChange && !loading && !error && (
          <RangeSelector value={range} onChange={onRangeChange} />
        )}
      </div>

      {body()}
    </section>
  );
}
