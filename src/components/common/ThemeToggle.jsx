import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { value: "system", label: "System", icon: "ri-computer-line" },
  { value: "light", label: "Light", icon: "ri-sun-line" },
  { value: "dark", label: "Dark", icon: "ri-moon-line" },
];

export default function ThemeToggle() {
  const { preference, setTheme } = useTheme();

  return (
    <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-secondary)]">
          <i className="ri-palette-line text-lg" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--agri-text)]">
            Appearance
          </p>
          <p className="text-xs text-[var(--agri-text-muted)]">
            Choose your preferred theme
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
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
