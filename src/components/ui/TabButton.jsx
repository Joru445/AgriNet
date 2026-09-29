import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { tabIndicatorTransition } from "../../utils/motion";

export default function TabButton({
  active,
  onClick,
  label,
  count,
  icon,
  layoutId,
  className = "",
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (active && btnRef.current) {
      btnRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [active]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold lg:font-bold transition-all duration-150 whitespace-nowrap inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/30 select-none ${
        active
          ? "text-[#1B4332] dark:text-(--agri-brand-light)"
          : "text-(--agri-text-muted) hover:text-(--agri-text) hover:bg-(--agri-hover)"
      } ${className}`}
    >
      {active && (
        layoutId ? (
          <motion.span
            layoutId={layoutId}
            transition={tabIndicatorTransition}
            className="absolute inset-0 rounded-xl bg-(--agri-card) shadow-md shadow-black/8 dark:shadow-black/35 border border-(--agri-border) -z-10"
          />
        ) : (
          <span className="absolute inset-0 rounded-xl bg-(--agri-card) shadow-md shadow-black/8 dark:shadow-black/35 border border-(--agri-border) -z-10" />
        )
      )}
      {icon && <i className={`${icon} text-sm lg:text-base`} />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`ml-1 text-[11px] lg:text-xs font-bold tabular-nums px-1.5 py-0.2 rounded-full ${
            active
              ? "bg-[#2D6A4F]/10 dark:bg-emerald-500/20 text-[#2D6A4F] dark:text-(--agri-brand)"
              : "opacity-75"
          }`}
        >
          ({count})
        </span>
      )}
    </button>
  );
}
