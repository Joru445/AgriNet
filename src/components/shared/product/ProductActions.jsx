import { useNavigate } from "react-router-dom";
import { getMessagesPath } from "../../../utils/routes";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { useFavorites } from "../../../context/FavoritesContext";

export default function ProductActions({ product, farmer, isOwner }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  function handleInquiry() {
    if (!profile) {
      navigate("/login");
      return;
    }

    const farmerId = farmer?.uid || farmer?.id || product?.farmerId;
    if (!farmerId) return;

    navigate(`${getMessagesPath(profile.role)}?user=${farmerId}`, {
      state: {
        inquiryProduct: product,
      },
    });
  }

  function handleProduct() {
    navigate(`/farmer/products`);
  }

  return (
    <section className="px-4 sm:px-6 mt-4 sm:mt-5 pb-2">
      {/* Favorite Toggle */}
      {!isOwner && (
        <button
          onClick={() => profile && toggleFavorite("product", product.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition cursor-pointer mb-3
            ${isFavorite("product", product.id)
              ? "border-[#E63946] bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20"
              : "border-[var(--agri-border)] bg-transparent text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]"
            }
            ${!profile ? "opacity-60 cursor-default" : ""}
          `}
        >
          <i className={`${isFavorite("product", product.id) ? "ri-heart-fill" : "ri-heart-line"} text-lg`} />
          {isFavorite("product", product.id) ? t("favorites.saved") : t("favorites.save")}
        </button>
      )}

      {isOwner ? (
        <button
          onClick={handleProduct}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] active:scale-[0.99] cursor-pointer"
        >
          <i className="ri-settings-3-line text-lg" />
          {t("productDetails.manageProduct")}
        </button>
      ) : (
        <button
          onClick={handleInquiry}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] active:scale-[0.99] cursor-pointer"
        >
          <i className="ri-chat-1-line text-lg" />
          {profile ? t("productDetails.sendInquiry") : t("guest.loginToSendInquiry")}
        </button>
      )}
    </section>
  );
}
