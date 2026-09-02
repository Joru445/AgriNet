import { useLanguage } from "../../../context/LanguageContext";

export default function EmptyProducts() {
  const { t } = useLanguage();

  return (
    <div className="py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
        <i className="ri-shopping-basket-2-line text-4xl text-[#2D6A4F]" />
      </div>

      <h3 className="text-xl font-bold text-gray-800">{t("consumer.noProducts")}</h3>

      <p className="mt-2 text-gray-500">
        {t("consumer.noProductsHint")}
      </p>
    </div>
  );
}
