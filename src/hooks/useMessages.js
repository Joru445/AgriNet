import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  markConversationRead,
  createConversation,
  findConversation,
  getConversation,
  subscribeUserConversations,
} from "../services/conversation.service";

import { subscribeMessages, sendMessage } from "../services/message.service";

import { uploadMessageImage } from "../services/cloudinary.service";

import { getUserProfile, searchUsers } from "../services/user.service";

import { getProductById } from "../services/product.service";

import { acceptProductInquiry } from "../services/inquiry.service";

import { showToast } from "../utils/toast";

export default function useMessages() {
  const { profile } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState([]);

  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] = useState(null);

  const [activeUser, setActiveUser] = useState(null);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_message_drafts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [failedMessages, setFailedMessages] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [userResults, setUserResults] = useState([]);

  const [inquiryProduct, setInquiryProduct] = useState(
    () => location.state?.inquiryProduct || null,
  );

  const [inquiryProducts, setInquiryProducts] = useState({});

  const productCache = useRef(new Map());

  const searching = search.trim().length > 0;

  const currentTargetKey = useMemo(() => {
    if (activeConversation?.id) return activeConversation.id;
    if (activeUser?.uid) return `user_${activeUser.uid}`;
    return null;
  }, [activeConversation?.id, activeUser?.uid]);

  // Persist drafts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("agri_message_drafts", JSON.stringify(drafts));
    } catch (e) {
      console.error("Failed to save drafts to localStorage", e);
    }
  }, [drafts]);

  // Sync draft text when active conversation/user changes
  useEffect(() => {
    if (currentTargetKey) {
      const savedDraft = drafts[currentTargetKey] || "";
      setMessage(savedDraft);
    } else {
      setMessage("");
    }
  }, [currentTargetKey]);

  // Listen to network status
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
      showToast.error("No internet connection.");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function handleMessageChange(val) {
    setMessage(val);
    if (!currentTargetKey) return;
    setDrafts((prev) => {
      if (!val || !val.trim()) {
        if (!prev[currentTargetKey]) return prev;
        const next = { ...prev };
        delete next[currentTargetKey];
        return next;
      }
      return { ...prev, [currentTargetKey]: val };
    });
  }

  /*
   * --------------------------------------------------
   * Inquiry product from navigation state
   * --------------------------------------------------
   */

  useEffect(() => {
    const product = location.state?.inquiryProduct;

    if (product) {
      setInquiryProduct(product);
    }
  }, [location.state]);

  /*
   * --------------------------------------------------
   * Product cache
   * --------------------------------------------------
   */

  async function getCachedProduct(productId) {
    if (!productId) {
      return null;
    }

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

  /*
   * --------------------------------------------------
   * Load products used by inquiry messages
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * Subscribe to conversations
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!profile?.uid) {
      setConversations([]);
      setLoading(false);

      return;
    }

    setLoading(true);

    const unsubscribe = subscribeUserConversations(profile.uid, async (data) => {
      const mapped = data.map((conversation) => {
        const otherUid = conversation.participants?.find(
          (uid) => uid !== profile.uid,
        );

        const otherInfo = conversation.participantInfo?.[otherUid] || {};

        return {
          ...conversation,

          otherUser: {
            uid: otherUid,
            ...otherInfo,
            verified: otherInfo.verified === true,
          },

          unreadCount: conversation.unreadCount?.[profile.uid] ?? 0,
          rawUnreadCount: conversation.unreadCount || {},
        };
      });

      // Always enrich conversation otherUser with live user profile (verified status, name, picture)
      const allOtherUids = [
        ...new Set(mapped.map((c) => c.otherUser?.uid).filter(Boolean)),
      ];

      if (allOtherUids.length > 0) {
        try {
          const userProfiles = await Promise.all(
            allOtherUids.map(async (uId) => {
              const u = await getUserProfile(uId);
              return [uId, u];
            }),
          );
          const uMap = new Map(userProfiles.filter(([, u]) => u != null));
          mapped.forEach((c) => {
            const liveUser = uMap.get(c.otherUser?.uid);
            if (liveUser) {
              c.otherUser = {
                ...c.otherUser,
                ...liveUser,
                verified: liveUser.verified === true,
              };
            }
          });
        } catch (err) {
          console.error("Error enriching conversation users:", err);
        }
      }

      setConversations(mapped);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [profile?.uid]);

  /*
   * --------------------------------------------------
   * Search users
   * --------------------------------------------------
   */

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
          conversations
            .map((conversation) => conversation.otherUser?.uid)
            .filter(Boolean),
        );

        setUserResults(
          users.filter((user) => !conversationUserIds.has(user.uid)),
        );
      } catch (error) {
        console.error("Failed to search users:", error);

        setUserResults([]);
      }
    }

    loadSearch();
  }, [search, conversations, profile?.uid]);

  /*
   * --------------------------------------------------
   * Handle URL state
   *
   * /messages?conversation=id
   * /messages?user=uid
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const conversationId = searchParams.get("conversation");

    const userId = searchParams.get("user");

    let cancelled = false;

    async function loadConversation() {
      /*
       * ==============================================
       * Existing conversation
       * /messages?conversation=id
       * ==============================================
       */

      if (conversationId) {
        try {
          const conversation = await getConversation(conversationId);

          if (cancelled) {
            return;
          }

          if (!conversation) {
            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);

            return;
          }

          const otherUid = conversation.participants?.find(
            (uid) => uid !== profile.uid,
          );

          if (!otherUid) {
            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);

            return;
          }

          let otherUser = conversation.participantInfo?.[otherUid] || {};
          try {
            const userProfile = await getUserProfile(otherUid);
            if (userProfile) {
              otherUser = { ...otherUser, ...userProfile };
            }
          } catch (_) {}

          setActiveConversation({
            ...conversation,

            otherUser: {
              uid: otherUid,
              ...otherUser,
              verified: otherUser.verified === true,
            },
          });

          setActiveUser(null);

          return;
        } catch (error) {
          if (!cancelled) {
            console.error("Failed to load conversation:", error);

            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);
          }

          return;
        }
      }

      /*
       * ==============================================
       * User without a conversation
       * /messages?user=uid
       * ==============================================
       */

      if (userId) {
        try {
          /*
           * Check if a conversation already exists.
           */
          const existingConversation = await findConversation(
            profile.uid,
            userId,
          );

          if (cancelled) {
            return;
          }

          /*
           * Conversation already exists.
           *
           * Replace:
           *
           * ?user=uid
           *
           * with:
           *
           * ?conversation=id
           */
          if (existingConversation) {
            setSearchParams(
              {
                conversation: existingConversation.id,
              },
              {
                replace: true,
              },
            );

            return;
          }

          /*
           * No conversation exists yet.
           *
           * Load the target user's profile and
           * use it as the active chat target.
           */
          const user = await getUserProfile(userId);

          if (cancelled) {
            return;
          }

          if (!user) {
            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);

            return;
          }

          /*
           * IMPORTANT:
           *
           * activeConversation remains null.
           * activeUser represents the person we're
           * about to start a conversation with.
           */
          setActiveConversation(null);
          setActiveUser(user);
          setMessages([]);

          return;
        } catch (error) {
          if (!cancelled) {
            console.error("Failed to load user:", error);

            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);
          }

          return;
        }
      }

      /*
       * ==============================================
       * Nothing selected
       * ==============================================
       */

      setActiveConversation(null);
      setActiveUser(null);
      setMessages([]);
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, searchParams, setSearchParams]);

  /*
   * --------------------------------------------------
   * Subscribe to messages
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!profile?.uid || !activeConversation?.id) {
      setMessages([]);

      return;
    }

    setMessages([]);

    const unsubscribe = subscribeMessages(activeConversation.id, setMessages);

    /*
     * Conversation-level read tracking.
     *
     * This no longer scans every message.
     */
    markConversationRead(activeConversation.id, profile.uid).catch((error) => {
      console.error("Failed to mark conversation as read:", error);
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversation?.id, profile?.uid]);

  /*
   * --------------------------------------------------
   * Select existing conversation
   * --------------------------------------------------
   */

  function selectConversation(conversation) {
    setSearch("");

    setSearchParams({
      conversation: conversation.id,
    });
  }

  /*
   * --------------------------------------------------
   * Select user
   * --------------------------------------------------
   */

  function selectUser(user) {
    setSearch("");

    setSearchParams({
      user: user.uid,
    });
  }

  /*
   * --------------------------------------------------
   * Send message
   * --------------------------------------------------
   */

  async function handleSend(customImage = null) {
    const activeImg = customImage || selectedImage;
    const text = message.trim();

    if (!text && !activeImg) {
      return;
    }

    let conversationId = activeConversation?.id;

    if (!conversationId && !activeUser) {
      showToast.error("No user selected.");
      return;
    }

    const currentKey = currentTargetKey;

    // Check offline condition like Messenger
    if (!navigator.onLine) {
      const tempId = `failed_${Date.now()}`;
      const failedMsg = {
        id: tempId,
        conversationId: conversationId || "temp",
        senderId: profile.uid,
        text,
        type: activeImg ? "image" : "text",
        imageUrl: activeImg ? activeImg.previewUrl : null,
        status: "failed",
        error: "No internet connection",
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };

      setFailedMessages((prev) => [...prev, failedMsg]);
      setMessage("");
      setSelectedImage(null);
      if (currentKey) {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[currentKey];
          return next;
        });
      }

      showToast.error("Unable to send. No internet connection.");
      return;
    }

    try {
      if (activeImg) {
        setUploadingImage(true);
      }

      if (!conversationId) {
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

      let imageUrl = null;
      let imageId = null;

      if (activeImg?.file) {
        const uploaded = await uploadMessageImage(activeImg.file);
        imageUrl = uploaded.url;
        imageId = uploaded.publicId;
      }

      await sendMessage({
        conversationId,
        senderId: profile.uid,
        text,
        type: activeImg ? "image" : "text",
        imageUrl,
        imageId,
      });

      setMessage("");
      setSelectedImage(null);
      if (currentKey) {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[currentKey];
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      const tempId = `failed_${Date.now()}`;
      const failedMsg = {
        id: tempId,
        conversationId: conversationId || "temp",
        senderId: profile.uid,
        text,
        type: activeImg ? "image" : "text",
        imageUrl: activeImg ? activeImg.previewUrl : null,
        status: "failed",
        error: error.message || "Failed to send message",
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };

      setFailedMessages((prev) => [...prev, failedMsg]);
      setMessage("");
      setSelectedImage(null);
      if (currentKey) {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[currentKey];
          return next;
        });
      }

      showToast.error("Unable to send message.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function retryMessage(failedMsg) {
    setFailedMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));

    if (!navigator.onLine) {
      setFailedMessages((prev) => [...prev, failedMsg]);
      showToast.error("Unable to send. No internet connection.");
      return;
    }

    try {
      let conversationId = activeConversation?.id;
      if (!conversationId && activeUser) {
        conversationId = await createConversation(profile, activeUser);
        setSearchParams({ conversation: conversationId }, { replace: true });
      }

      if (!conversationId) {
        throw new Error("No conversation found");
      }

      await sendMessage({
        conversationId,
        senderId: profile.uid,
        text: failedMsg.text || "",
        type: failedMsg.type || "text",
        imageUrl: failedMsg.imageUrl || null,
        imageId: failedMsg.imageId || null,
      });
    } catch (err) {
      console.error("Failed to retry message:", err);
      setFailedMessages((prev) => [...prev, failedMsg]);
      showToast.error("Unable to send message.");
    }
  }

  function deleteFailedMessage(id) {
    setFailedMessages((prev) => prev.filter((m) => m.id !== id));
  }

  /*
   * --------------------------------------------------
   * Send product inquiry
   * --------------------------------------------------
   */

  async function handleSendInquiry(quantity) {
    if (!inquiryProduct) {
      showToast.error("No product selected for inquiry.");
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

      /*
       * Start a new conversation if this is
       * currently a /messages?user=uid chat.
       */
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
        quantity: parsedQuantity,
        inquiryStatus: "pending",
      });

      setInquiryProduct(null);

      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });

      showToast.success("Inquiry sent successfully.");
    } catch (error) {
      console.error("Failed to send inquiry:", error);

      showToast.error(error.message || "Failed to send inquiry.");
    }
  }

  /*
   * --------------------------------------------------
   * Accept inquiry
   * --------------------------------------------------
   */

  async function handleAcceptInquiry(inquiryMessage) {
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

      showToast.error(error.message || "Failed to accept inquiry.");

      throw error;
    }
  }

  /*
   * --------------------------------------------------
   * Filter conversations
   * --------------------------------------------------
   */

  const filteredConversations = useMemo(() => {
    if (!search.trim()) {
      return conversations;
    }

    const keyword = search.toLowerCase();

    return conversations.filter(
      ({ otherUser }) =>
        otherUser?.fullname?.toLowerCase().includes(keyword) ||
        otherUser?.username?.toLowerCase().includes(keyword),
    );
  }, [conversations, search]);

  const activeConversationLive = useMemo(() => {
    if (!activeConversation?.id) return activeConversation;
    const found = conversations.find((c) => c.id === activeConversation.id);
    if (!found) return activeConversation;
    return {
      ...activeConversation,
      ...found,
      otherUser: activeConversation.otherUser || found.otherUser,
    };
  }, [activeConversation, conversations]);

  const combinedMessages = useMemo(() => {
    const targetConversationId = activeConversation?.id;
    const currentFailed = failedMessages.filter(
      (m) =>
        (targetConversationId && m.conversationId === targetConversationId) ||
        (m.conversationId === "temp" && Boolean(activeUser)),
    );
    return [...messages, ...currentFailed];
  }, [messages, failedMessages, activeConversation?.id, activeUser]);

  /*
   * --------------------------------------------------
   * Return
   * --------------------------------------------------
   */

  return {
    loading,

    searching,

    conversations,
    filteredConversations,
    userResults,

    activeConversation: activeConversationLive,
    activeUser,

    messages: combinedMessages,

    inquiryProduct,
    inquiryProducts,

    sendInquiry: handleSendInquiry,

    acceptInquiry: handleAcceptInquiry,

    search,
    setSearch,

    message,
    setMessage: handleMessageChange,

    selectedImage,
    setSelectedImage,
    uploadingImage,

    drafts,
    isOnline,

    selectConversation,
    selectUser,

    sendMessage: handleSend,
    retryMessage,
    deleteFailedMessage,
  };
}
