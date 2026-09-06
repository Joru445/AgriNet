import { useLanguage } from "../../context/LanguageContext";

export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  locationLabel,
}) {
  const { t } = useLanguage();
  const displayLocation = locationLabel ?? t("common.locationFallback");

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit?.(value);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          px-2
          py-1
          border-2
          bg-(--agri-card)
          border-(--agri-input-border)
          shadow-xs
          focus-within:border-[#2D6A4F]
          focus-within:shadow-md
          focus-within:ring-3
          focus-within:ring-[#2D6A4F]/15
          transition-all
        "
      >
        <div className="flex-1 min-w-0 flex items-center gap-3 px-3.5">
          <i className="ri-search-line text-[#2D6A4F] dark:text-(--agri-brand) text-xl font-bold shrink-0" />

          <input
            type="search"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={t("search.placeholder")}
            className="
              min-w-0
              flex-1
              py-2.5
              text-sm
              sm:text-base
              text-(--agri-text)
              placeholder-(--agri-text-muted)
              font-medium
              focus:outline-none
              bg-transparent
              [&::-webkit-search-cancel-button]:appearance-none
              [&::-webkit-search-decoration]:appearance-none
            "
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="
                shrink-0
                p-1
                rounded-full
                text-(--agri-text-muted)
                hover:text-(--agri-text)
                hover:bg-(--agri-hover)
                transition
                cursor-pointer
              "
              title={t("search.clear")}
              aria-label={t("search.clear")}
            >
              <i className="ri-close-circle-fill text-lg" />
            </button>
          )}

          {/*displayLocation && (
            <div
              className="
                hidden
                md:flex
                shrink-0
                items-center
                gap-2
                px-3.5
                py-1.5
                bg-[#2D6A4F]/10
                rounded-xl
                border
                border-[#2D6A4F]/20
              "
            >
              <i className="ri-map-pin-2-fill text-[#2D6A4F] dark:text-(--agri-brand) text-base" />

              <span className="text-sm font-bold text-(--agri-text)">
                {displayLocation}
              </span>
            </div>
          )*/}
        </div>
      </div>
    </form>
  );
}
