import { useNavigate } from "react-router-dom";
import { getMessagesPath } from "../../../utils/routes";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductActions({ product, farmer, isOwner }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  function handleInquiry() {
    const farmerId = farmer?.uid || farmer?.id || product?.farmerId;
    if (!farmerId) return;

    navigate(`${getMessagesPath("consumer")}?user=${farmerId}`, {
      state: {
        inquiryProduct: product,
      },
    });
  }

  function handleProduct() {
    navigate(`/farmer/products`);
  }

  return (
    <section className="sticky bottom-0 z-10 pt-2 pb-2 sm:pb-0">
      {isOwner ? (
        <button
          onClick={handleProduct}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] active:scale-[0.99] cursor-pointer"
        >
          <i className="ri-settings-3-line text-lg" />
          {t("productDetails.manageProduct")}
        </button>
      ) : (
        <button
          onClick={handleInquiry}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] active:scale-[0.99] cursor-pointer"
        >
          <i className="ri-chat-1-line text-lg" />
          {t("productDetails.sendInquiry")}
        </button>
      )}
    </section>
  );
}
