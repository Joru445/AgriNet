import Spinner from "./Spinner";

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2",
  icon: "p-2",
};

const VARIANT_CLASSES = {
  primary:
    "bg-[#2D6A4F] text-white hover:bg-[#1B4332] dark:bg-emerald-600 dark:hover:bg-emerald-500",

  secondary:
    "border border-[#2D6A4F] bg-transparent text-[#2D6A4F] dark:text-(--agri-brand) dark:border-emerald-500/40 hover:bg-[#2D6A4F]/10 dark:hover:bg-emerald-500/10",

  danger:
    "bg-[#DC2626] text-white hover:bg-[#B91C1C] dark:bg-red-600 dark:hover:bg-red-500",

  logout:
    "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/15 dark:hover:bg-red-500/25",

  save:
    "bg-[#000080]/60 text-white hover:bg-[#000080]/80 dark:bg-blue-600/70 dark:hover:bg-blue-600/90",

  cancel:
    "border border-(--agri-border) bg-transparent text-(--agri-text-secondary) hover:bg-(--agri-hover)",

  ghost:
    "text-[#2D6A4F] dark:text-(--agri-brand) hover:bg-[#2D6A4F]/10 dark:hover:bg-emerald-500/10",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex self-start items-center justify-center
        rounded-lg
        font-medium
        transition-colors
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="shrink-0" />
      ) : icon ? (
        <i className={`${icon} shrink-0`} />
      ) : null}
      {children}
    </button>
  );
}
