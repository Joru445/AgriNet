import { useNavigate, useLocation } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";

export default function BackButton({
  to,
  className = "",
  label,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const ariaLabel = label ?? t("common.back");

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else if (location.pathname.startsWith("/admin")) {
      navigate("/admin");
    } else if (location.pathname.startsWith("/farmer")) {
      navigate("/farmer");
    } else {
      navigate("/marketplace");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center justify-center size-9 rounded-xl font-medium text-(--agri-text-secondary) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) hover:bg-(--agri-hover) shadow-2xs transition-colors active:scale-95 cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      <i className="ri-arrow-left-line text-2xl" />
    </button>
  );
}