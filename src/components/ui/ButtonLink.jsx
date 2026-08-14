import { Link } from "react-router-dom";

export default function ButtonLink({
  children,
  to,
  variant = "secondary",
  icon,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-[#2D6A4F] text-white hover:bg-[#1B4332]",

    secondary:
      "border border-[#2D6A4F] bg-white text-[#2D6A4F] hover:bg-green-50",

    ghost: "text-[#2D6A4F] hover:bg-green-50",
  };

  return (
    <Link
      to={to}
      className={`
        inline-flex items-center justify-center
        rounded-lg
        px-5 py-2
        font-medium
        transition-colors
        ${variants[variant] || variants.secondary}
        ${className}
      `}
      {...props}
    >
      {icon && <i className={`${icon} mr-2`} />}
      {children}
    </Link>
  );
}
