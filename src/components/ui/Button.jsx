export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  icon,
  disabled = false,
  ...props
}) {
  const variants = {
    primary: "bg-[#2D6A4F] text-white hover:bg-[#1B4332]",

    secondary:
      "border border-[#2D6A4F] bg-transparent text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:bg-[#2D6A4F]/10",

    danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",

    logout: "bg-red-500/10 text-red-500 hover:bg-red-500/20",

    save: "bg-[#000080]/60 text-white hover:bg-[#000080]/80",

    cancel: "border border-[var(--agri-border)] bg-transparent text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]",

    ghost: "text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:bg-[#2D6A4F]/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex self-start items-center justify-center
        rounded-lg
        px-5 py-2
        font-medium
        transition-colors
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {icon && <i className={`${icon} mr-2`} />}
      {children}
    </button>
  );
}
