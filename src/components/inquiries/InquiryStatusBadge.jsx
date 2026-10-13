import { useLanguage } from "../../context/LanguageContext";
import StatusBadge from "../ui/StatusBadge";

/** Transaction statuses share the same accessibility, color, and icon system. */
export default function InquiryStatusBadge({ status }) {
  const { t } = useLanguage();
  const translations = {
    pending: t("transactions.status.pending"),
    accepted: t("transactions.status.accepted"),
    reserved: t("transactions.status.reserved"),
    ongoing: t("transactions.status.ongoing"),
    awaiting_proof: t("transactions.status.awaitingProof"),
    proof_submitted: t("transactions.status.proofSubmitted"),
    completed: t("transactions.status.completed"),
    cancelled: t("transactions.status.cancelled"),
  };
  return <StatusBadge status={status} label={translations[status]} size="sm" />;
}
