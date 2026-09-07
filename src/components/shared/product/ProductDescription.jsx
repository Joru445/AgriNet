import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductDescription({ product }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const description = product.description || t("productDetails.noDescription");
  const isLong = description.length > 200;

  return (
    <section className="mx-4 sm:mx-6 mt-4 sm:mt-5">
      <h2 className="font-bold text-base sm:text-lg text-[var(--agri-text)] mb-2">
        {t("productDetails.description")}
      </h2>

      <p
        className={`text-sm sm:text-base text-[var(--agri-text-secondary)] whitespace-pre-wrap font-normal leading-relaxed ${
          !expanded && isLong ? "line-clamp-3" : ""
        }`}
      >
        {description}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1.5 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] hover:underline inline-flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          {expanded ? t("productDetails.seeLess") : t("productDetails.seeMore")}
          <i
            className={`text-xs ${
              expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
            }`}
          />
        </button>
      )}
    </section>
  );
}
