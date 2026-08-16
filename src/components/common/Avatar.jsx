import { getInitials } from "../../utils/getInitials";

export default function Avatar({ src, name, size = "md", className = "" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-3xl",
  };

  const sizeClass = sizes[size] || sizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={`${sizeClass} shrink-0 rounded-full object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        flex shrink-0 items-center justify-center
        rounded-full
        bg-[#D8F3DC]
        font-semibold text-[#2D6A4F]
        ${sizeClass}
        ${className}
      `}
      aria-label={name || "User"}
    >
      {getInitials(name)}
    </div>
  );
}
