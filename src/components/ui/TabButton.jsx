import { motion } from "motion/react";
import { tabIndicatorTransition } from "../../utils/motion";

export default function TabButton({
  active,
  onClick,
  label,
  count,
  icon,
  layoutId,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/30 select-none ${
        active
          ? "text-[#2D6A4F] dark:text-(--agri-brand)"
          : "text-(--agri-text-muted) hover:text-(--agri-text) hover:bg-(--agri-hover)"
      }`}
    >
      {active && (
        layoutId ? (
          <motion.span
            layoutId={layoutId}
            transition={tabIndicatorTransition}
            className="absolute inset-0 rounded-lg bg-(--agri-card) shadow-xs border border-(--agri-border-subtle) -z-10"
          />
        ) : (
          <span className="absolute inset-0 rounded-lg bg-(--agri-card) shadow-xs border border-(--agri-border-subtle) -z-10" />
        )
      )}
      {icon && <i className={`${icon} text-sm`} />}
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-1 text-[11px] font-bold tabular-nums opacity-75">
          ({count})
        </span>
      )}
    </button>
  );
}
