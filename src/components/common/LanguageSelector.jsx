import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage();

  const options = [
    {
      code: "en",
      abbreviation: "EN",
      name: t("settings.languageEnglish"),
      description: t("settings.languageEnglishDescription"),
    },
    {
      code: "fil",
      abbreviation: "FIL",
      name: t("settings.languageFilipino"),
      description: t("settings.languageFilipinoDescription"),
    },
  ];

  return (
    <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-secondary)]">
          <i className="ri-translate-2 text-lg" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--agri-text)]">
            {t("settings.language")}
          </p>
          <p className="text-xs text-[var(--agri-text-muted)]">
            {t("settings.languageDescription")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = lang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLang(opt.code)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-center transition-all cursor-pointer ${
                active
                  ? "bg-[#2D6A4F] text-white shadow-md"
                  : "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-active)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)]"
                }`}
              >
                {opt.abbreviation}
              </span>
              <span className="text-sm font-semibold">{opt.name}</span>
              <span
                className={`text-[10px] leading-tight ${
                  active ? "text-white/75" : "text-[var(--agri-text-muted)]"
                }`}
              >
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}