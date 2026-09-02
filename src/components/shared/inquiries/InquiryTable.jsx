import { useLanguage } from "../../../context/LanguageContext";
import InquiryRow from "./InquiryRow";

export default function InquiryTable({
  inquiries,
  inquiryData,
  userRole,
  updatingId,
  onStatusChange,
  view = "grid",
}) {
  const { t } = useLanguage();

  if (!inquiries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--agri-border)] bg-[var(--agri-card)] px-5 py-14 text-center shadow-xs">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
          <i className="ri-inbox-line text-2xl" />
        </div>
        <p className="text-base font-bold text-[var(--agri-text-secondary)]">{t("inquiries.emptyTitle")}</p>

        <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
          {t("inquiries.emptySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-1 lg:grid-cols-3 gap-4"
          : "space-y-4"
      }
    >
      {inquiries.map((inquiry) => {
        const data = inquiryData[inquiry.id];

        return (
          <InquiryRow
            key={inquiry.id}
            inquiry={inquiry}
            product={data?.product}
            consumer={data?.consumer}
            farmer={data?.farmer}
            userRole={userRole}
            updating={updatingId === inquiry.id}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
}
