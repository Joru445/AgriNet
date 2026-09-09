import { useLanguage } from "../../../context/LanguageContext";
import ConfirmDialog from "../../ui/ConfirmDialog";

export default function DeleteProductModal({
  open,
  product,
  deleting,
  onCancel,
  onConfirm,
}) {
  const { t } = useLanguage();

  return (
    <ConfirmDialog
      open={open && Boolean(product)}
      onClose={onCancel}
      onConfirm={() => onConfirm(product)}
      title={t("products.deleteTitle")}
      description={t("products.deleteConfirm")}
      confirmLabel={t("deleteProduct.delete")}
      cancelLabel={t("common.cancel")}
      icon="ri-delete-bin-line"
      danger
      loading={deleting}
    />
  );
}
