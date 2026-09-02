import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

import defaultAvatar from "../../../assets/img/defaultAvatar.png";
import productPlaceholder from "../../../assets/img/productPlaceholder.png";

export default function ProductInquiryMessage({
  user,
  message,
  product,
  onAccept,
  isLastMine = false,
  isSeen = false,
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const isOwn = message.senderId === profile.uid;
  const isFarmer = profile.role === "farmer";

  const showAccept = isFarmer && !isOwn && message.inquiryStatus === "pending";

  if (product === undefined) {
    return (
      <div className="w-72 rounded-xl bg-[var(--agri-card)] p-4">
        <p className="text-sm text-[var(--agri-text-muted)]">{t("productInquiryMsg.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-72 rounded-xl bg-[var(--agri-card)] p-4">
        <p className="text-xs font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)]">{t("productInquiryMsg.title")}</p>

        <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
          {t("productInquiryMsg.noLongerAvailable")}
        </p>

        {message.quantity != null && (
          <div className="mt-3 rounded-lg bg-[var(--agri-hover)] px-3 py-2">
            <p className="text-xs text-[var(--agri-text-muted)]">{t("productInquiryMsg.quantityRequested")}</p>

            <p className="mt-0.5 text-sm font-semibold text-[var(--agri-text)]">
              {message.quantity}
            </p>
          </div>
        )}
      </div>
    );
  }

  const productImage = product.images?.[0]?.url || productPlaceholder;

  const quantity = Number(message.quantity);

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} min-w-0`}>
      <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"} min-w-0 w-full`}>
        <img
          src={user?.profilePicture || defaultAvatar}
          alt={user?.fullname}
          className={`h-10 w-10 shrink-0 rounded-full object-cover ${
            isOwn ? "hidden" : "flex"
          }`}
        />

        <div className="w-64 sm:w-72 max-w-[78vw] sm:max-w-xs min-w-0 overflow-hidden rounded-xl bg-[var(--agri-card)] shadow-sm border border-[var(--agri-border-subtle)]">
          <img
            src={productImage}
            alt={product.name}
            className="h-36 sm:h-40 w-full object-cover"
          />

          <div className="p-3">
            <p className="text-xs font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)]">{t("productInquiryMsg.title")}</p>

            <h3 className="mt-1 font-semibold text-[var(--agri-text)] truncate">{product.name}</h3>

            {product.price != null && (
              <p className="mt-1 text-sm font-medium text-[var(--agri-text-secondary)]">
                ₱{product.price}
                {product.unit ? ` / ${product.unit}` : ""}
              </p>
            )}

            {/* Quantity */}
            {message.quantity && (
              <div className="mt-3 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)] px-3 py-2.5">
                <p className="text-xs font-medium text-[var(--agri-text-muted)]">
                  {t("productInquiryMsg.quantityRequested")}
                </p>

                <p className="mt-0.5 text-base font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                  {Number.isFinite(quantity) ? quantity : message.quantity}{" "}
                  {product.unit || t("productInquiryMsg.units")}
                </p>
              </div>
            )}

            <p className="mt-3 text-sm text-[var(--agri-text-secondary)] break-words [overflow-wrap:anywhere] [word-break:break-word]">{message.text}</p>

            {showAccept && (
              <button
                type="button"
                onClick={() => onAccept(message, product)}
                className="
                  mt-3 w-full rounded-lg
                  bg-[#2D6A4F]
                  px-3 py-2
                  text-sm font-medium text-white
                  hover:bg-[#1B4332]
                  cursor-pointer transition-colors shadow-xs
                "
              >
                {t("productInquiryMsg.acceptInquiry")}
              </button>
            )}

            {message.inquiryStatus === "accepted" && (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 border border-emerald-500/20">
                  <i className="ri-checkbox-circle-fill text-emerald-600" />
                  <span>{t("productInquiryMsg.inquiryAccepted")}</span>
                </div>
                <Link
                  to={isFarmer ? `/farmer/transactions` : `/transactions`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer no-underline shadow-xs"
                >
                  <i className="ri-file-list-3-line" />
                  <span>{t("productInquiryMsg.goToInquiry")}</span>
                </Link>
              </div>
            )}

            {message.inquiryStatus === "rejected" && (
              <div className="mt-3 rounded-lg bg-[var(--agri-hover)] px-3 py-2 text-center text-sm font-medium text-[var(--agri-text-secondary)]">
                {t("productInquiryMsg.inquiryRejected")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sent / Seen indicator for sender */}
      {isOwn && isLastMine && (
        <div className="flex items-center justify-end gap-1 mt-1 mr-1 text-[11px] font-bold select-none transition-all">
          {isSeen ? (
            <span className="flex items-center gap-1 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              <i className="ri-check-double-line text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
              {t("productInquiryMsg.seen")}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[var(--agri-text-muted)] font-semibold">
              <i className="ri-check-line text-xs text-[var(--agri-text-muted)]" />
              {t("productInquiryMsg.sent")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
