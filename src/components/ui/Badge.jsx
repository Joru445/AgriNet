export default function Badge({ count, className = "" }) {
  if (!count) return null;

  const display = count > 99 ? "99+" : count;

  return (
    <span
      className={`absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none ${className}`}
    >
      {display}
    </span>
  );
}

export function Dot({ className = "" }) {
  return (
    <span
      className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ${className}`}
    />
  );
}

export function PulsingDot({ className = "" }) {
  return (
    <span className={`flex h-2.5 w-2.5 relative ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}
