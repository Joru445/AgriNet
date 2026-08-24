import { useNavigate } from "react-router-dom";

export default function StatCard({ title, value, description, to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <div
      onClick={handleClick}
      role={to ? "button" : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={to ? (e) => e.key === "Enter" && handleClick() : undefined}
      className={`group rounded-2xl border bg-white p-5 transition-all select-none ${
        to
          ? "border-gray-300 shadow-md cursor-pointer hover:-translate-y-1 hover:border-[#2D6A4F]/40 hover:shadow-xl active:scale-95 active:shadow-sm"
          : "border-gray-200 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>

        {/* Clickable indicator — arrow icon */}
        {to && (
          <div className="shrink-0 flex flex-col items-end justify-between h-full gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F0F7F4] border border-[#C8DFD1] text-[#2D6A4F] group-hover:bg-[#2D6A4F] group-hover:text-white transition-all">
              <i className="ri-arrow-right-line text-base font-bold" />
            </div>
          </div>
        )}
      </div>

      {/* "Tap to view" hint — visible on mobile only */}
      {to && (
        <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F]/70 sm:hidden">
          <i className="ri-tap-line text-xs" />
          Tap to view
        </p>
      )}
    </div>
  );
}
