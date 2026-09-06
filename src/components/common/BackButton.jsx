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
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 font-medium text-[var(--agri-text-secondary)] transition hover:text-(--agri-brand) px-3 pl-2 ${className}`}
      aria-label={ariaLabel}
    >
      <i className="ri-arrow-left-line text-2xl" />
    </button>
  );
}