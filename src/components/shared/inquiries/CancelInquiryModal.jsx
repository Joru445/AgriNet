import { useLanguage } from "../../../context/LanguageContext";
import ConfirmDialog from "../../ui/ConfirmDialog";

export default function CancelInquiryModal({
  open,
  onCancel,
  onConfirm,
  cancelling = false,
}) {
  const { t } = useLanguage();

  return (
    <ConfirmDialog
      open={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={t("transactions.cancelModal.title")}
      description={t("transactions.cancelModal.body")}
      confirmLabel={t("transactions.cancelModal.confirm")}
      cancelLabel={t("transactions.cancelModal.no")}
      icon="ri-close-circle-line"
      danger
      loading={cancelling}
    />
  );
}
