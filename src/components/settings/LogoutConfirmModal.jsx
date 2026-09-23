import { useLanguage } from "../../context/LanguageContext";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
  loggingOut = false,
}) {
  const { t } = useLanguage();

  return (
    <ConfirmDialog
      open={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={t("common.logOut")}
      description={t("common.logoutConfirmBody")}
      confirmLabel={t("common.yes")}
      cancelLabel={t("common.cancel")}
      icon="ri-logout-box-r-line"
      danger
      loading={loggingOut}
    />
  );
}
