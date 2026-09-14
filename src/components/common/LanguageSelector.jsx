import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSelector({ compact = false }) {
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

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--agri-hover) text-(--agri-text-muted)">
            <i className="ri-translate-2 text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-(--agri-text)">
              {t("settings.language")}
            </p>
            <p className="text-xs text-(--agri-text-muted)">
              {t("settings.languageDescription")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 rounded-lg border border-(--agri-border) bg-(--agri-hover) p-0.5">
          {options.map((opt) => {
            const active = lang === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLang(opt.code)}
                className={`flex h-8 items-center justify-center rounded-md px-3 text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-(--agri-brand) text-white shadow-sm"
                    : "text-(--agri-text-muted) hover:text-(--agri-text)"
                }`}
              >
                {opt.abbreviation}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--agri-border) bg-(--agri-card) p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--agri-hover) text-(--agri-text-secondary)">
          <i className="ri-translate-2 text-lg" />
        </div>
        <div>
          <p className="text-sm font-semibold text-(--agri-text)">
            {t("settings.language")}
          </p>
          <p className="text-xs text-(--agri-text-muted)">
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
                  : "bg-(--agri-hover) text-(--agri-text-secondary) hover:bg-(--agri-active)"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-(--agri-card) text-[#2D6A4F] dark:text-(--agri-brand)"
                }`}
              >
                {opt.abbreviation}
              </span>
              <span className="text-sm font-semibold">{opt.name}</span>
              <span
                className={`text-[10px] leading-tight ${
                  active ? "text-white/75" : "text-(--agri-text-muted)"
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
