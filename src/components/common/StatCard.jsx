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
      className={`rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm transition ${
        to
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#2D6A4F]/30 hover:shadow-md"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>

          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
