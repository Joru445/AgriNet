import { useLanguage } from "../../../context/LanguageContext";

export default function InquiryStatusBadge({ status }) {
  const { t } = useLanguage();
  const styles = {
    accepted: "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold",

    ongoing: "bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold",

    awaiting_proof: "bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold",

    proof_submitted: "bg-orange-500/10 text-orange-700 dark:text-orange-300 font-semibold",

    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold",

    cancelled: "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] font-semibold",
  };

  const labels = {
    accepted: t("inquiries.status.accepted"),
    ongoing: t("inquiries.status.ongoing"),
    awaiting_proof: t("inquiries.status.awaitingProof"),
    proof_submitted: t("inquiries.status.proofSubmitted"),
    completed: t("inquiries.status.completed"),

    cancelled: t("inquiries.status.cancelled"),
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs ${
        styles[status] || "bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] font-semibold"
      }`}
    >
      {labels[status] || t("inquiries.status.unknown")}
    </span>
  );
}
