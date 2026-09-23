import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";

export default function EmptyProducts({ onAdd }) {
  const { t } = useLanguage();

  return (
    <div className="bg-(--agri-card) border border-dashed border-(--agri-border) rounded-2xl p-12 flex flex-col items-center justify-center text-center">
      <div className="w-18 h-18 rounded-full bg-green-50 flex items-center justify-center mb-5">
        <i className="ri-store-2-line text-4xl text-[#2D6A4F]" />
      </div>

      <h3 className="text-xl font-semibold text-(--agri-text)">{t("products.noProductsEmpty")}</h3>

      <p className="mt-2 max-w-sm text-sm text-(--agri-text-muted)">
        {t("products.emptyDesc")}
      </p>

      <Button variant="primary" size="md" icon="ri-add-line" onClick={onAdd} className="mt-6">
        {t("products.addProduct")}
      </Button>
    </div>
  );
}
