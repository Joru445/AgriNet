import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search */}
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-base font-bold" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("adminTransaction.searchPlaceholder")}
            className="w-full rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 py-2.5 pl-10 pr-10 text-sm font-semibold text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]/60 transition cursor-pointer"
              title={t("search.clear")}
              aria-label={t("search.clear")}
            >
              <i className="ri-close-circle-fill text-base text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminTransaction.allStatuses")}</option>
            <option value="pending">{t("adminTransaction.statusPending")}</option>
            <option value="accepted">{t("adminTransaction.statusAccepted")}</option>
            <option value="reserved">{t("adminTransaction.statusReserved")}</option>
            <option value="ongoing">{t("adminTransaction.statusOngoing")}</option>
            <option value="awaiting_proof">{t("adminTransaction.statusAwaitingProof")}</option>
            <option value="proof_submitted">{t("adminTransaction.statusProofSubmitted")}</option>
            <option value="completed">{t("adminTransaction.statusCompleted")}</option>
            <option value="cancelled">{t("adminTransaction.statusCancelled")}</option>
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminTransaction.allTypes")}</option>
            <option value="standard">{t("adminTransaction.typeStandard")}</option>
            <option value="preorder">{t("adminTransaction.typePreorder")}</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            placeholder={t("adminTransaction.dateFrom")}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            placeholder={t("adminTransaction.dateTo")}
            className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          />

          {/* Clear dates */}
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => { onDateFromChange(""); onDateToChange(""); }}
              className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3 py-2 text-xs font-semibold text-[var(--agri-text-muted)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
            >
              <i className="ri-close-line mr-1" />
              {t("adminTransaction.clearDates")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
