import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { getMessagesPath } from "../../utils/routes";
import Avatar from "../ui/Avatar";

/**
 * Fixed bottom action bar for Product Details on mobile.
 * Shows farmer identity + save + inquiry action.
 */
export default function MobileActionBar({ product, farmer, isOwner }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, authInitializing, identity } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isPreorder = product?.sellingMode === "preorder";
  const isSignedIn = Boolean(user) && !authInitializing;
  const saved = isFavorite("product", product?.id);

  const farmerName =
    farmer?.fullname || farmer?.storeName || farmer?.username || "";
  const farmerId = farmer?.uid || farmer?.id || product?.farmerId;

  function handleInquiry() {
    if (authInitializing) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!farmerId) return;
    navigate(`${getMessagesPath(identity?.role || "")}?user=${farmerId}`, {
      state: { inquiryProduct: product },
    });
  }

  function handleFarmerClick() {
    if (farmerId) navigate(`/profile/${farmerId}`);
  }

  function handleSave() {
    if (isSignedIn) toggleFavorite("product", product?.id);
  }

  // Owner sees a simplified bar
  if (isOwner) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden border-t border-(--agri-border) bg-(--agri-card) px-4 py-3">
        <button
          onClick={() => navigate("/farmer/products")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--agri-green-mid) py-3 text-sm font-bold text-white shadow-lg shadow-(--agri-green-mid)/20 transition hover:bg-(--agri-green-dark) active:scale-[0.99] cursor-pointer"
        >
          <i className="ri-settings-3-line text-lg" />
          {t("productDetails.manageProduct")}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed h-16 bottom-0 inset-x-0 z-50 lg:hidden border-t border-(--agri-border) bg-(--agri-card) px-3 py-2.5">
      <div className="flex items-center px-3 gap-2">
        {/* Farmer identity — clickable */}
        <button
          type="button"
          onClick={handleFarmerClick}
          className="flex min-w-0 max-w-38 items-center gap-2 shrink-0 rounded-lg px-1 py-1 -ml-1 text-left transition cursor-pointer"
        >
          <Avatar src={farmer?.profilePicture} name={farmerName} size="xs" />

          <span className="text-sm truncate whitespace-nowrap">{farmer.fullname}</span>
          {(farmer?.verificationStatus === "approved" || farmer?.verified) && (
            <i
              className="ri-verified-badge-fill text-(--agri-green-mid) dark:text-(--agri-brand) text-sm shrink-0"
              title={t("productSeller.verifiedFarmer")}
            />
          )}
        </button>

        <div className="flex-1" />

        {/* Save / heart */}
        <button
          type="button"
          onClick={handleSave}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition cursor-pointer ${
            saved
              ? "text-[#E63946]"
              : "text-(--agri-text-secondary) hover:bg-(--agri-hover)"
          } ${!isSignedIn ? "opacity-60 cursor-default" : ""}`}
          aria-label={saved ? t("favorites.saved") : t("favorites.save")}
        >
          <i
            className={`${saved ? "ri-heart-fill" : "ri-heart-line"} text-lg`}
          />
        </button>

        {/* Inquiry action */}
        <button
          type="button"
          onClick={handleInquiry}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-(--agri-green-mid) px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-(--agri-green-mid)/20 transition hover:bg-(--agri-green-dark) active:scale-[0.99] cursor-pointer"
        >
          <span className="whitespace-nowrap">
            {isSignedIn
              ? isPreorder
                ? t("productDetails.sendPreOrderInquiry")
                : t("productDetails.sendInquiry")
              : t("guest.loginToSendInquiry")}
          </span>
        </button>
      </div>
    </div>
  );
}
