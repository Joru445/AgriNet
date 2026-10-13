import { useLanguage } from "../../../context/LanguageContext";
import InlineSearchInput from "../../ui/InlineSearchInput";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import Input from "../../ui/Input";

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
    <div className="mb-6 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3.5">
        {/* Row 1: Search */}
        <InlineSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={t("adminTransaction.searchPlaceholder")}
        />

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Status */}
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminTransaction.allStatuses")}</option>
            <option value="pending">{t("adminTransaction.statusPending")}</option>
            <option value="accepted">{t("adminTransaction.statusAccepted")}</option>
            <option value="reserved">{t("adminTransaction.statusReserved")}</option>
            <option value="awaiting_agreement">Awaiting agreement</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="ongoing">{t("adminTransaction.statusOngoing")}</option>
            <option value="awaiting_proof">{t("adminTransaction.statusAwaitingProof")}</option>
            <option value="proof_submitted">{t("adminTransaction.statusProofSubmitted")}</option>
            <option value="completed">{t("adminTransaction.statusCompleted")}</option>
            <option value="cancelled">{t("adminTransaction.statusCancelled")}</option>
          </Select>

          {/* Type */}
          <Select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer shadow-2xs"
          >
            <option value="">{t("adminTransaction.allTypes")}</option>
            <option value="standard">{t("adminTransaction.typeStandard")}</option>
            <option value="preorder">{t("adminTransaction.typePreorder")}</option>
          </Select>

          {/* Date From */}
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            placeholder={t("adminTransaction.dateFrom")} className="min-w-0 flex-1 sm:min-w-36"
          />

          {/* Date To */}
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            placeholder={t("adminTransaction.dateTo")} className="min-w-0 flex-1 sm:min-w-36"
          />

          {/* Clear dates */}
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onDateFromChange(""); onDateToChange(""); }}
              className="shadow-2xs"
            >
              <i className="ri-close-line" />
              {t("adminTransaction.clearDates")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
