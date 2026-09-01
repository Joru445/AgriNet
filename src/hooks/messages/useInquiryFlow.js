import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getProductById } from "../../services/product.service";
import {
  sendMessage as sendMessageService,
} from "../../services/message.service";
import { createConversation } from "../../services/conversation.service";
import { acceptProductInquiry } from "../../services/inquiry.service";
import { buildOptimisticConversation } from "../../utils/messaging/buildOptimisticConversation";
import { showToast } from "../../utils/toast";

export default function useInquiryFlow({
  profile,
  activeConversation,
  activeUser,
  setActiveConversation,
  setActiveUser,
  setSearchParams,
}) {
  const location = useLocation();

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
        showToast.error("No product selected for inquiry.");
        return;
      }

      if (!profile?.uid) {
        showToast.error("You must be logged in.");
        return;
      }

      const parsedQuantity = Number(quantity);
      const stock = Number(inquiryProduct.stock);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        showToast.error("Please enter a valid quantity.");
        return;
      }

      if (
        inquiryProduct.available !== true ||
        !Number.isInteger(stock) ||
        stock < 1
      ) {
        showToast.error("This product is currently unavailable.");
        return;
      }

      if (parsedQuantity > stock) {
        showToast.error(
          `Only ${stock} ${inquiryProduct.unit || "units"} available.`,
        );
        return;
      }

      try {
        let conversationId = activeConversation?.id;

        if (!conversationId) {
          if (!activeUser?.uid) {
            showToast.error("Unable to determine the farmer.");
            return;
          }

          conversationId = await createConversation(profile, activeUser);
        }

        const receiverId =
          activeUser?.uid ||
          activeConversation?.otherUser?.uid ||
          inquiryProduct.farmerId ||
          null;

        await sendMessageService({
          conversationId,
          senderId: profile.uid,
          receiverId,
          text: `I'm interested in ${inquiryProduct.name}.`,
          type: "product_inquiry",
          productId: inquiryProduct.id,
          quantity: parsedQuantity,
          inquiryStatus: "pending",
        });

        if (!activeConversation?.id) {
          const otherUserInfo = activeUser || { uid: receiverId };
          setActiveConversation(
            buildOptimisticConversation({
              conversationId,
              currentUser: profile,
              otherUser: otherUserInfo,
            }),
          );
          setActiveUser(null);
          setSearchParams(
            { conversation: conversationId },
            { replace: true },
          );
        }

        setInquiryProduct(null);
        showToast.success("Inquiry sent successfully.");
      } catch (error) {
        console.error("Failed to send inquiry:", error);
        showToast.error(error.message || "Failed to send inquiry.");
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
    ],
  );

  const acceptInquiry = useCallback(
    async (inquiryMessage) => {
      if (!inquiryMessage?.id) {
        showToast.error("Invalid inquiry message.");
        return;
      }

      if (inquiryMessage.type !== "product_inquiry") {
        showToast.error("This message is not an inquiry.");
        return;
      }

      if (inquiryMessage.inquiryStatus !== "pending") {
        showToast.error("This inquiry has already been processed.");
        return;
      }

      if (!profile?.uid) {
        showToast.error("You must be logged in.");
        return;
      }

      try {
        await acceptProductInquiry({
          inquiryMessage,
          farmer: profile,
        });
        showToast.success("Inquiry accepted.");
      } catch (error) {
        console.error("Failed to accept inquiry:", error);
        showToast.error(
          error.message || "Failed to accept inquiry.",
        );
        throw error;
      }
    },
    [profile],
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
