import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";

export default function BackButton({
  to,
  className = "",
  label,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const ariaLabel = label ?? t("common.back");

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center justify-center size-9 rounded-xl font-medium text-[var(--agri-text-secondary)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] hover:bg-[var(--agri-hover)] transition-colors active:scale-95 cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      <i className="ri-arrow-left-line text-2xl" />
    </button>
  );
}