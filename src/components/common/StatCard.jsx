import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";

export default function StatCard({ title, value, description, to, compact = false }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <div
      onClick={handleClick}
      role={to ? "button" : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={to ? (e) => e.key === "Enter" && handleClick() : undefined}
      className={`group rounded-2xl border bg-[var(--agri-card)] transition-all select-none ${
        compact ? "p-3" : "p-5"
      } ${
        to
          ? "border-[var(--agri-border)] shadow-md shadow-black/5 cursor-pointer hover:-translate-y-0.5 hover:border-[#2D6A4F]/40 hover:shadow-xl active:scale-95 active:shadow-sm"
          : "border-[var(--agri-border-subtle)] shadow-md shadow-black/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold text-[var(--agri-text-muted)] ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 font-bold text-[var(--agri-text)] ${
              compact ? "text-2xl" : "mt-2 text-3xl"
            }`}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {description && (
            <p
              className={`mt-1 text-[var(--agri-text-muted)] ${
                compact ? "text-[11px]" : "text-xs"
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {/* Clickable indicator — arrow icon */}
        {to && (
          <div className="shrink-0 flex flex-col items-end justify-between h-full gap-1">
            <div
              className={`flex items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[var(--agri-brand)] group-hover:bg-[#2D6A4F] group-hover:text-white transition-all ${
                compact ? "h-6 w-6" : "h-8 w-8"
              }`}
            >
              <i className={`ri-arrow-right-line font-bold ${compact ? "text-xs" : "text-base"}`} />
            </div>
          </div>
        )}
      </div>

      {/* "Tap to view" hint — visible on mobile only */}
      {to && (
        <p
          className={`mt-2 flex items-center gap-1 font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)]/70 sm:hidden ${
            compact ? "text-[10px]" : "mt-3 text-[11px]"
          }`}
        >
          <i className="ri-tap-line text-xs" />
          {t("common.tapToView")}
        </p>
      )}
    </div>
  );
}
