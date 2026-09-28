import { Link } from "react-router-dom";

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2.5",
};

const VARIANT_CLASSES = {
  primary:
    "bg-[#2D6A4F] text-white hover:bg-[#1B4332] active:bg-[#143326] dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs hover:shadow-sm border border-transparent",

  secondary:
    "border border-(--agri-border) bg-(--agri-card) text-[#2D6A4F] dark:text-(--agri-brand) hover:bg-(--agri-hover) hover:border-[#2D6A4F]/40 dark:border-(--agri-border) dark:hover:border-emerald-500/40 shadow-xs",

  subtle:
    "bg-[#2D6A4F]/10 text-[#2D6A4F] hover:bg-[#2D6A4F]/15 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25 border border-transparent",

  outline:
    "border border-[#2D6A4F] bg-transparent text-[#2D6A4F] dark:text-(--agri-brand) dark:border-emerald-500/50 hover:bg-[#2D6A4F]/10 dark:hover:bg-emerald-500/10",

  danger:
    "bg-[#DC2626] text-white hover:bg-[#B91C1C] dark:bg-red-600 dark:hover:bg-red-500 shadow-xs border border-transparent",

  ghost:
    "text-[#2D6A4F] dark:text-(--agri-brand) hover:bg-(--agri-hover) border border-transparent",
};

export default function ButtonLink({
  children,
  to,
  variant = "secondary",
  size = "md",
  icon,
  className = "",
  ...props
}) {
  return (
    <Link
      to={to}
      className={`
        inline-flex items-center justify-center
        rounded-xl
        font-semibold
        transition-all duration-150
        cursor-pointer
        select-none
        whitespace-nowrap
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#2D6A4F]
        dark:focus-visible:ring-emerald-400
        focus-visible:ring-offset-2
        focus-visible:ring-offset-(--agri-card)
        active:scale-[0.98]
        ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.secondary}
        ${className}
      `}
      {...props}
    >
      {icon && <i className={`${icon} shrink-0 text-[1.1em]`} />}
      {children}
    </Link>
  );
}
