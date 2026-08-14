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
      "border border-[#2D6A4F] bg-white text-[#2D6A4F] hover:bg-green-50",

    danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",

    logout: "bg-red-50 text-[#B91C1C] hover:bg-red-100",

    save: "bg-[#000080]/60 text-white hover:bg-[#000080]/80",

    cancel: "border bg-white text-gray-700 hover:bg-gray-50",

    ghost: "text-[#2D6A4F] hover:bg-green-50",
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
