import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const OPTIONS = [
  { value: "system", labelKey: "settings.theme.system", icon: "ri-computer-line" },
  { value: "light", labelKey: "settings.theme.light", icon: "ri-sun-line" },
  { value: "dark", labelKey: "settings.theme.dark", icon: "ri-moon-line" },
];

export default function ThemeToggle({ compact = false }) {
  const { preference, setTheme } = useTheme();
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
            <i className="ri-palette-line text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--agri-text)]">
              {t("settings.appearance")}
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              {t("settings.appearanceDesc")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 rounded-lg border border-[var(--agri-border)] bg-[var(--agri-hover)] p-0.5">
          {OPTIONS.map((opt) => {
            const active = preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                title={t(opt.labelKey)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all cursor-pointer ${
                  active
                    ? "bg-[var(--agri-brand)] text-white shadow-sm"
                    : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text)]"
                }`}
              >
                <i className={opt.icon} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-secondary)]">
          <i className="ri-palette-line text-lg" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--agri-text)]">
            {t("settings.appearance")}
          </p>
          <p className="text-xs text-[var(--agri-text-muted)]">
            {t("settings.appearanceDesc")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const active = preference === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-all cursor-pointer ${
                active
                  ? "bg-[#2D6A4F] text-white shadow-md"
                  : "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-active)]"
              }`}
            >
              <i className={`${opt.icon} text-lg`} />
              <span>{t(opt.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
