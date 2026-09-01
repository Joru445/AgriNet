import { useNavigate } from "react-router-dom";

export default function BackButton({
  to,
  className = "",
  label = "Back",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 font-medium text-gray-600 transition hover:text-[#2D6A4F] dark:text-(--agri-primary) ${className}`}
      aria-label={label}
    >
      <i className="ri-arrow-left-line text-2xl" />
    </button>
  );
}