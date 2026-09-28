export default function Badge({ count, className = "", variant = "danger" }) {
  if (!count) return null;

  const display = count > 99 ? "99+" : count;
  const defaultBg =
    variant === "success" || variant === "green"
      ? "bg-[#2D6A4F] text-white"
      : variant === "brand"
        ? "bg-(--agri-brand) text-white"
        : variant === "warning"
          ? "bg-amber-500 text-white"
          : "bg-red-500 text-white";

  const defaultPos =
    className.includes("right-") || className.includes("left-")
      ? ""
      : "-top-1.5 -right-2";

  return (
    <span
      className={`absolute ${defaultPos} min-w-[1.125rem] h-4.5 px-1.5 rounded-full ring-2 ring-(--agri-card) ${
        className.includes("bg-") ? "" : defaultBg
      } text-[10px] font-bold tabular-nums flex items-center justify-center leading-none shrink-0 box-border pointer-events-none select-none shadow-xs ${className}`}
    >
      {display}
    </span>
  );
}

export function Dot({ className = "" }) {
  return (
    <span
      className={`absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-(--agri-card) ${className}`}
    />
  );
}

export function PulsingDot({ className = "", color = "bg-red-500", pingColor = "bg-red-400" }) {
  return (
    <span className={`flex h-2.5 w-2.5 relative ${className}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingColor}`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ring-2 ring-(--agri-card) ${color}`} />
    </span>
  );
}
