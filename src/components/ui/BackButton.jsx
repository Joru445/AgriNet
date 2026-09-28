import { useNavigate, useLocation } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import { getLogicalParent } from "../../utils/routes";

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
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(getLogicalParent(location.pathname));
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center justify-center size-9 rounded-xl font-medium text-(--agri-text-secondary) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) hover:bg-(--agri-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40 shadow-2xs transition-all duration-150 active:scale-90 cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      <i className="ri-arrow-left-line text-xl" />
    </button>
  );
}
