import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getProductById } from "../../services/product.service";
import {
  apiSendMessage,
} from "../../services/message.service";
import { apiFindOrCreateConversation } from "../../services/conversation.service";
import { apiAcceptInquiry } from "../../services/inquiry.service";
import { buildOptimisticConversation } from "../../utils/messaging/buildOptimisticConversation";
import { getProductInquiryState } from "../../utils/productStatus";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast";

// i18n keys for each blocked inquiry state — mirrors the backend's
// authoritative error wording ("The pre-order deadline has passed." etc.)
const BLOCKED_MESSAGES = {
  OUT_OF_STOCK: "inquiryFlow.outOfStock",
  UNAVAILABLE: "inquiryFlow.unavailable",
  EXPIRED: "inquiryFlow.unavailable",
  PREORDER_FULL: "inquiryFlow.preOrderFull",
  PREORDER_ENDED: "inquiryFlow.preOrderEnded",
  PREORDER_UNAVAILABLE: "inquiryFlow.unavailable",
};

export default function useInquiryFlow({
  profile,
  activeConversation,
  activeUser,
  setActiveConversation,
  setActiveUser,
  setSearchParams,
}) {
  const location = useLocation();
  const { t } = useLanguage();

  const [inquiryProduct, setInquiryProduct] = useState(
    () => location.state?.inquiryProduct || null,
  );
  const [inquiryProducts, setInquiryProducts] = useState({});
  const productCache = useRef(new Map());

  useEffect(() => {
    const product = location.state?.inquiryProduct;
    if (product) {
      setInquiryProduct(product);
    }
  }, [location.state]);

  const getCachedProduct = useCallback(
    async (productId) => {
      if (!productId) return null;

      if (productCache.current.has(productId)) {
        return productCache.current.get(productId);
      }

      try {
        const product = await getProductById(productId);
        const cachedProduct = product || null;

        productCache.current.set(productId, cachedProduct);
        setInquiryProducts((current) => ({
          ...current,
          [productId]: cachedProduct,
        }));

        return cachedProduct;
      } catch (error) {
        console.error("Failed to load inquiry product:", error);
        productCache.current.set(productId, null);
        setInquiryProducts((current) => ({
          ...current,
          [productId]: null,
        }));
        return null;
      }
    },
    [],
  );

  const loadInquiryProducts = useCallback(
    (messages) => {
      if (!messages.length) return;

      const productIds = [
        ...new Set(
          messages
            .filter(
              (m) =>
                m.type === "product_inquiry" && m.productId,
            )
            .map((m) => m.productId),
        ),
      ];

      productIds.forEach((productId) => {
        getCachedProduct(productId);
      });
    },
    [getCachedProduct],
  );

  const sendInquiry = useCallback(
    async (quantity) => {
      if (!inquiryProduct) {
        showToast.error(t("inquiryFlow.noProduct"));
        return;
      }

      if (!profile?.uid) {
        showToast.error(t("inquiryFlow.notLoggedIn"));
        return;
      }

      const parsedQuantity = Number(quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        showToast.error(t("inquiryFlow.validQuantity"));
        return;
      }

      // Re-check eligibility against the CURRENT product state before doing
      // anything. Router state and the composer's copy can be stale — the
      // deadline may have passed, capacity may be full, or the farmer may
      // have marked the product unavailable since the page was opened.
      // Always fetch fresh; on fetch failure fall back to the last known
      // state (the canonical helper still evaluates time-derived fields
      // against the current clock). Backend validation remains the
      // authoritative final gate.
      let currentProduct = inquiryProduct;
      try {
        const freshProduct = await getProductById(inquiryProduct.id);
        if (freshProduct) currentProduct = freshProduct;
      } catch {
        // Offline / transient failure — validate against last known state.
      }

      const inquiryState = getProductInquiryState(currentProduct);
      if (!inquiryState.allowed) {
        showToast.error(
          t(BLOCKED_MESSAGES[inquiryState.code] ?? "inquiryFlow.unavailable"),
        );
        return;
      }

      if (parsedQuantity > inquiryState.quantityAvailable) {
        showToast.error(
          t("inquiryFlow.onlyAvailable", {
            count: inquiryState.quantityAvailable,
            unit: currentProduct.unit || t("productDetails.unit"),
          }),
        );
        return;
      }

      try {
        let conversationId = activeConversation?.id;

        if (!conversationId) {
          if (!activeUser?.uid) {
            showToast.error(t("inquiryFlow.unableFarmer"));
            return;
          }

          conversationId = await apiFindOrCreateConversation(activeUser.uid);
        }

        const inquiryText = `I'm interested in ${inquiryProduct.name}.`;

        // --- Inquiry message: Plain text in Firestore by default ---
        const inquiryPayload = {
          conversationId,
          senderId: profile.uid,
          receiverId: activeUser?.uid || activeConversation?.otherUser?.uid,
          text: inquiryText || "",
          type: "product_inquiry",
          productId: inquiryProduct.id,
          quantity: parsedQuantity,
          inquiryStatus: "pending",
        };

        await apiSendMessage(inquiryPayload);

        if (!activeConversation?.id) {
          setActiveConversation(
            buildOptimisticConversation({
              conversationId,
              currentUser: profile,
              otherUser: activeUser,
            }),
          );
          setActiveUser(null);
          setSearchParams(
            { conversation: conversationId },
            { replace: true },
          );
        }

        setInquiryProduct(null);
        showToast.success(t("inquiryFlow.sent"));
      } catch (error) {
        console.error("Failed to send inquiry:", error);
        showToast.error(error.message || t("inquiryFlow.sendFailed"));
      }
    },
    [
      inquiryProduct,
      profile,
      activeConversation,
      activeUser,
      setActiveConversation,
      setActiveUser,
      setSearchParams,
      t,
    ],
  );

  const acceptInquiry = useCallback(
    async (inquiryMessage) => {
      if (!inquiryMessage?.id) {
        showToast.error(t("inquiryFlow.invalidMessage"));
        return;
      }

      if (inquiryMessage.type !== "product_inquiry") {
        showToast.error(t("inquiryFlow.notInquiry"));
        return;
      }

      if (inquiryMessage.inquiryStatus !== "pending") {
        showToast.error(t("inquiryFlow.processed"));
        return;
      }

      if (!profile?.uid) {
        showToast.error(t("inquiryFlow.notLoggedIn"));
        return;
      }

      try {
        await apiAcceptInquiry({
          messageId: inquiryMessage.id,
          conversationId: inquiryMessage.conversationId,
          productId: inquiryMessage.productId,
          consumerId: inquiryMessage.senderId,
          quantity: inquiryMessage.quantity,
        });
        showToast.success(t("inquiryFlow.accepted"));
      } catch (error) {
        console.error("Failed to accept inquiry:", error);
        showToast.error(
          error.message || t("inquiryFlow.acceptFailed"),
        );
        throw error;
      }
    },
    [profile, t],
  );

  const cancelInquiryProduct = useCallback(() => {
    setInquiryProduct(null);
  }, []);

  return {
    inquiryProduct,
    inquiryProducts,
    loadInquiryProducts,
    sendInquiry,
    acceptInquiry,
    cancelInquiryProduct,
  };
}
