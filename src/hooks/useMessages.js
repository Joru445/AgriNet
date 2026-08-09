import { useEffect, useMemo, useRef, useState } from "react";
import { serverTimestamp } from "firebase/firestore";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  markConversationRead,
  createConversation,
  findConversation,
  getConversation,
  subscribeUserConversations,
} from "../services/conversation.service";

import {
  subscribeMessages,
  sendMessage,
  updateMessage,
} from "../services/message.service";

import { getUserProfile, searchUsers } from "../services/user.service";
import { getProductById } from "../services/product.service";
import { createInquiry } from "../services/inquiry.service";

import { showToast } from "../utils/toast";

export default function useMessages() {
  const { profile } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] = useState(null);

  const [activeUser, setActiveUser] = useState(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [userResults, setUserResults] = useState([]);

  // --------------------------------------------------
  // Product inquiry
  // --------------------------------------------------

  const [inquiryProduct, setInquiryProduct] = useState(
    () => location.state?.inquiryProduct || null,
  );

  // Cache products used by inquiry messages.
  // productId -> product
  const productCache = useRef(new Map());

  const [inquiryProducts, setInquiryProducts] = useState({});

  const searching = search.trim().length > 0;

  // --------------------------------------------------
  // Read inquiry product from navigation state
  // --------------------------------------------------

  useEffect(() => {
    const product = location.state?.inquiryProduct;

    if (product) {
      setInquiryProduct(product);
    }
  }, [location.state]);

  // --------------------------------------------------
  // Product cache
  // --------------------------------------------------

  async function getCachedProduct(productId) {
    if (!productId) {
      return null;
    }

    // Return cached product
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
  }

  // --------------------------------------------------
  // Load products used by inquiry messages
  // --------------------------------------------------

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    const productIds = [
      ...new Set(
        messages
          .filter(
            (message) =>
              message.type === "product_inquiry" && message.productId,
          )
          .map((message) => message.productId),
      ),
    ];

    productIds.forEach((productId) => {
      getCachedProduct(productId);
    });
  }, [messages]);

  // --------------------------------------------------
  // Realtime conversations
  // --------------------------------------------------

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const unsubscribe = subscribeUserConversations(profile.uid, (data) => {
      const mapped = data.map((conversation) => {
        const otherUid = conversation.participants.find(
          (id) => id !== profile.uid,
        );

        return {
          ...conversation,

          otherUser: {
            uid: otherUid,
            ...(conversation.participantInfo?.[otherUid] || {}),
          },

          unreadCount: conversation.unreadCount?.[profile.uid] ?? 0,
        };
      });

      setConversations(mapped);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.uid]);

  // --------------------------------------------------
  // Search users
  // --------------------------------------------------

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    async function loadSearch() {
      if (!search.trim()) {
        setUserResults([]);
        return;
      }

      try {
        const users = await searchUsers(search, profile.uid);

        const conversationUserIds = new Set(
          conversations.map((conversation) => conversation.otherUser.uid),
        );

        setUserResults(
          users.filter((user) => !conversationUserIds.has(user.uid)),
        );
      } catch (error) {
        console.error(error);
      }
    }

    loadSearch();
  }, [search, conversations, profile?.uid]);

  // --------------------------------------------------
  // Read URL params
  // --------------------------------------------------

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const conversationId = searchParams.get("conversation");

    const userId = searchParams.get("user");

    // ----------------------------------------------
    // Conversation URL
    // ----------------------------------------------

    if (conversationId) {
      getConversation(conversationId).then((conversation) => {
        if (!conversation) {
          return;
        }

        const otherUid = conversation.participants.find(
          (id) => id !== profile.uid,
        );

        setActiveConversation({
          ...conversation,

          otherUser: {
            uid: otherUid,
            ...(conversation.participantInfo?.[otherUid] || {}),
          },
        });

        setActiveUser(null);
      });

      return;
    }

    // ----------------------------------------------
    // User URL
    // ----------------------------------------------

    if (userId) {
      (async () => {
        const existing = await findConversation(profile.uid, userId);

        if (existing) {
          setSearchParams(
            {
              conversation: existing.id,
            },
            {
              replace: true,
            },
          );

          return;
        }

        const user = await getUserProfile(userId);

        setActiveConversation(null);
        setActiveUser(user);
      })();

      return;
    }

    // ----------------------------------------------
    // No active chat
    // ----------------------------------------------

    setActiveConversation(null);
    setActiveUser(null);
  }, [searchParams, profile?.uid, setSearchParams]);

  // --------------------------------------------------
  // Realtime messages + mark as read
  // --------------------------------------------------

  useEffect(() => {
    if (!activeConversation || !profile?.uid) {
      setMessages([]);
      return;
    }

    markConversationRead(activeConversation.id, profile.uid);

    return subscribeMessages(activeConversation.id, setMessages);
  }, [activeConversation?.id, profile?.uid]);

  // --------------------------------------------------
  // Select conversation
  // --------------------------------------------------

  function selectConversation(conversation) {
    setSearch("");

    setSearchParams({
      conversation: conversation.id,
    });
  }

  // --------------------------------------------------
  // Select user
  // --------------------------------------------------

  function selectUser(user) {
    setSearch("");

    setSearchParams({
      user: user.uid,
    });
  }

  // --------------------------------------------------
  // Send normal message
  // --------------------------------------------------

  async function handleSend() {
    const text = message.trim();

    if (!text) {
      return;
    }

    try {
      let conversationId = activeConversation?.id;

      if (!conversationId) {
        if (!activeUser) {
          showToast.error("No user selected.");

          return;
        }

        conversationId = await createConversation(profile, activeUser);

        setSearchParams({
          conversation: conversationId,
        });
      }

      await sendMessage({
        conversationId,
        senderId: profile.uid,
        text,
        type: "text",
      });

      setMessage("");
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    }
  }

  // --------------------------------------------------
  // Send product inquiry
  // --------------------------------------------------

  async function handleSendInquiry() {
    if (!inquiryProduct) {
      showToast.error("No product selected for inquiry.");

      return;
    }

    try {
      let conversationId = activeConversation?.id;

      // Create conversation if one doesn't exist
      if (!conversationId) {
        if (!activeUser) {
          showToast.error("Unable to determine the farmer.");

          return;
        }

        conversationId = await createConversation(profile, activeUser);

        setSearchParams(
          {
            conversation: conversationId,
          },
          {
            replace: true,
          },
        );
      }

      await sendMessage({
        conversationId,
        senderId: profile.uid,
        text: `I'm interested in ${inquiryProduct.name}.`,
        type: "product_inquiry",
        productId: inquiryProduct.id,
        inquiryStatus: "pending",
      });

      // Clear the pending inquiry
      setInquiryProduct(null);

      // Remove the product from navigation state
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });

      showToast.success("Inquiry sent successfully.");
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    }
  }

  async function handleAcceptInquiry(inquiryMessage, product) {
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
      // Make sure the farmer is the current
      // participant in this conversation.
      const conversation = await getConversation(inquiryMessage.conversationId);

      if (!conversation) {
        throw new Error("Conversation not found.");
      }

      if (!conversation.participants.includes(profile.uid)) {
        throw new Error("You are not part of this conversation.");
      }

      // Prevent duplicate acceptance if
      // the button somehow gets clicked twice.
      if (inquiryMessage.inquiryStatus !== "pending") {
        return;
      }

      // Create the actual inquiry document.
      const inquiryId = await createInquiry({
        conversationId: inquiryMessage.conversationId,

        inquiryMessageId: inquiryMessage.id,

        consumerId: inquiryMessage.senderId,

        farmerId: profile.uid,

        productId: inquiryMessage.productId,
      });

      // Update only this inquiry message.
      await updateMessage(inquiryMessage.id, {
        inquiryStatus: "accepted",
        inquiryId,
        acceptedAt: serverTimestamp(),
      });

      showToast.success("Inquiry accepted.");
    } catch (error) {
      console.error("Failed to accept inquiry:", error);

      showToast.error(error.message || "Failed to accept inquiry.");

      throw error;
    }
  }

  // --------------------------------------------------
  // Filter conversations
  // --------------------------------------------------

  const filteredConversations = useMemo(() => {
    if (!search.trim()) {
      return conversations;
    }

    const keyword = search.toLowerCase();

    return conversations.filter(
      ({ otherUser }) =>
        otherUser.fullname?.toLowerCase().includes(keyword) ||
        otherUser.username?.toLowerCase().includes(keyword),
    );
  }, [conversations, search]);

  // --------------------------------------------------
  // Return
  // --------------------------------------------------

  return {
    loading,

    searching,

    conversations,
    users,

    filteredConversations,
    userResults,

    activeConversation,
    activeUser,

    messages,

    inquiryProduct,
    inquiryProducts,

    sendInquiry: handleSendInquiry,
    acceptInquiry: handleAcceptInquiry,

    search,
    setSearch,

    message,
    setMessage,

    selectConversation,
    selectUser,

    sendMessage: handleSend,
  };
}
