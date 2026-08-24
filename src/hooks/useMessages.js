import { useEffect, useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firestore";

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
  sendMessage as sendMessageService,
} from "../services/message.service";

import { uploadMessageImage } from "../services/cloudinary.service";

import {
  getUserProfile,
  searchUsers,
} from "../services/user.service";

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

  const [activeConversation, setActiveConversation] =
    useState(null);

  const [activeUser, setActiveUser] = useState(null);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "agri_message_drafts",
      );

      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true,
  );

  const [failedMessages, setFailedMessages] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [userResults, setUserResults] = useState([]);

  const [inquiryProduct, setInquiryProduct] = useState(
    () => location.state?.inquiryProduct || null,
  );

  const [inquiryProducts, setInquiryProducts] =
    useState({});

  const productCache = useRef(new Map());

  const searching = search.trim().length > 0;

  const currentTargetKey = useMemo(() => {
    if (activeConversation?.id) {
      return activeConversation.id;
    }

    if (activeUser?.uid) {
      return `user_${activeUser.uid}`;
    }

    return null;
  }, [
    activeConversation?.id,
    activeUser?.uid,
  ]);

  /*
   * ==================================================
   * PERSIST DRAFTS
   * ==================================================
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        "agri_message_drafts",
        JSON.stringify(drafts),
      );
    } catch (error) {
      console.error(
        "Failed to save drafts to localStorage:",
        error,
      );
    }
  }, [drafts]);

  /*
   * ==================================================
   * SYNC ACTIVE DRAFT
   * ==================================================
   */

  useEffect(() => {
    if (currentTargetKey) {
      setMessage(
        drafts[currentTargetKey] || "",
      );
    } else {
      setMessage("");
    }
  }, [currentTargetKey]);

  /*
   * ==================================================
   * NETWORK STATUS
   * ==================================================
   */

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);

      showToast.error(
        "No internet connection.",
      );
    }

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );
    };
  }, []);

  /*
   * ==================================================
   * HANDLE MESSAGE INPUT
   * ==================================================
   */

  function handleMessageChange(value) {
    setMessage(value);

    if (!currentTargetKey) {
      return;
    }

    setDrafts((previous) => {
      if (!value?.trim()) {
        const next = {
          ...previous,
        };

        delete next[currentTargetKey];

        return next;
      }

      return {
        ...previous,
        [currentTargetKey]: value,
      };
    });
  }

  /*
   * ==================================================
   * SYNC INQUIRY PRODUCT FROM NAVIGATION STATE
   * ==================================================
   */

  useEffect(() => {
    const product =
      location.state?.inquiryProduct;

    if (product) {
      setInquiryProduct(product);
    }
  }, [location.state]);

  /*
   * ==================================================
   * PRODUCT CACHE
   * ==================================================
   */

  async function getCachedProduct(productId) {
    if (!productId) {
      return null;
    }

    if (
      productCache.current.has(productId)
    ) {
      return productCache.current.get(
        productId,
      );
    }

    try {
      const product =
        await getProductById(productId);

      const cachedProduct =
        product || null;

      productCache.current.set(
        productId,
        cachedProduct,
      );

      setInquiryProducts((current) => ({
        ...current,
        [productId]: cachedProduct,
      }));

      return cachedProduct;
    } catch (error) {
      console.error(
        "Failed to load inquiry product:",
        error,
      );

      productCache.current.set(
        productId,
        null,
      );

      setInquiryProducts((current) => ({
        ...current,
        [productId]: null,
      }));

      return null;
    }
  }

  /*
   * ==================================================
   * LOAD PRODUCTS USED BY INQUIRY MESSAGES
   * ==================================================
   */

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    const productIds = [
      ...new Set(
        messages
          .filter(
            (messageItem) =>
              messageItem.type ===
                "product_inquiry" &&
              messageItem.productId,
          )
          .map(
            (messageItem) =>
              messageItem.productId,
          ),
      ),
    ];

    productIds.forEach((productId) => {
      getCachedProduct(productId);
    });
  }, [messages]);

  /*
   * ==================================================
   * SUBSCRIBE TO CONVERSATIONS
   *
   * participantInfo is the fallback.
   * getUserProfile provides the current user data.
   * ==================================================
   */

  useEffect(() => {
    if (!profile?.uid) {
      setConversations([]);
      setLoading(false);

      return;
    }

    setLoading(true);

    const unsubscribe =
      subscribeUserConversations(
        profile.uid,
        async (data) => {
          try {
            const mapped = data.map(
              (conversation) => {
                const otherUid =
                  conversation.participants?.find(
                    (uid) =>
                      uid !== profile.uid,
                  );

                const otherInfo =
                  conversation.participantInfo?.[
                    otherUid
                  ] || {};

                return {
                  ...conversation,

                  otherUser: {
                    uid: otherUid,
                    ...otherInfo,

                    verified:
                      otherInfo.verified ===
                      true,
                  },

                  unreadCount:
                    conversation.unreadCount?.[
                      profile.uid
                    ] ?? 0,

                  rawUnreadCount:
                    conversation.unreadCount ||
                    {},
                };
              },
            );

            /*
             * Enrich users with current profile data.
             *
             * This is necessary because older
             * conversations may not contain complete
             * participantInfo.
             */

            const otherUserIds = [
              ...new Set(
                mapped
                  .map(
                    (conversation) =>
                      conversation.otherUser
                        ?.uid,
                  )
                  .filter(Boolean),
              ),
            ];

            if (otherUserIds.length > 0) {
              const userProfiles =
                await Promise.all(
                  otherUserIds.map(
                    async (uid) => {
                      try {
                        const user =
                          await getUserProfile(
                            uid,
                          );

                        return [uid, user];
                      } catch (error) {
                        console.error(
                          `Failed to load user ${uid}:`,
                          error,
                        );

                        return [uid, null];
                      }
                    },
                  ),
                );

              const userMap = new Map(
                userProfiles.filter(
                  ([, user]) =>
                    user != null,
                ),
              );

              mapped.forEach(
                (conversation) => {
                  const liveUser =
                    userMap.get(
                      conversation.otherUser
                        ?.uid,
                    );

                  if (liveUser) {
                    conversation.otherUser = {
                      ...conversation.otherUser,
                      ...liveUser,

                      verified:
                        liveUser.verified ===
                        true,
                    };
                  }
                },
              );
            }

            setConversations(mapped);
          } catch (error) {
            console.error(
              "Failed to process conversations:",
              error,
            );

            setConversations([]);
          } finally {
            setLoading(false);
          }
        },
      );

    return () => {
      unsubscribe();
    };
  }, [profile?.uid]);

  /*
   * ==================================================
   * SEARCH USERS
   * ==================================================
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
        const users =
          await searchUsers(
            search,
            profile.uid,
          );

        const conversationUserIds =
          new Set(
            conversations
              .map(
                (conversation) =>
                  conversation.otherUser
                    ?.uid,
              )
              .filter(Boolean),
          );

        setUserResults(
          users.filter(
            (user) =>
              !conversationUserIds.has(
                user.uid,
              ),
          ),
        );
      } catch (error) {
        console.error(
          "Failed to search users:",
          error,
        );

        setUserResults([]);
      }
    }

    loadSearch();
  }, [
    search,
    conversations,
    profile?.uid,
  ]);

  /*
   * ==================================================
   * HANDLE URL STATE
   *
   * /messages?conversation=id
   * /messages?user=uid
   * ==================================================
   */

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const conversationId =
      searchParams.get("conversation");

    const userId =
      searchParams.get("user");

    let cancelled = false;

    async function loadConversation() {
      /*
       * Existing conversation.
       */

      if (conversationId) {
        try {
          /*
           * Prefer the already enriched conversation
           * from the conversation list.
           */

          const existing =
            conversations.find(
              (conversation) =>
                conversation.id ===
                conversationId,
            );

          if (existing) {
            if (!cancelled) {
              setActiveConversation(
                existing,
              );

              setActiveUser(null);
            }

            return;
          }

          /*
           * Fallback if the conversation list has not
           * loaded yet.
           */

          const conversation =
            await getConversation(
              conversationId,
            );

          if (cancelled) {
            return;
          }

          if (!conversation) {
            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);

            return;
          }

          const otherUid =
            conversation.participants?.find(
              (uid) =>
                uid !== profile.uid,
            );

          if (!otherUid) {
            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);

            return;
          }

          /*
           * Use participantInfo as the immediate
           * fallback.
           */

          const otherUser =
            conversation.participantInfo?.[
              otherUid
            ] || {};

          setActiveConversation({
            ...conversation,

            otherUser: {
              uid: otherUid,
              ...otherUser,

              verified:
                otherUser.verified === true,
            },
          });

          setActiveUser(null);

          return;
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Failed to load conversation:",
              error,
            );

            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);
          }

          return;
        }
      }

      /*
       * User without conversation.
       */

      if (userId) {
        try {
          const existingConversation =
            await findConversation(
              profile.uid,
              userId,
            );

          if (cancelled) {
            return;
          }

          if (existingConversation) {
            setSearchParams(
              {
                conversation:
                  existingConversation.id,
              },
              {
                replace: true,
              },
            );

            return;
          }

          const user =
            await getUserProfile(
              userId,
            );

          if (cancelled) {
            return;
          }

          if (!user) {
            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);

            return;
          }

          setActiveConversation(null);
          setActiveUser(user);
          setMessages([]);

          return;
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Failed to load user:",
              error,
            );

            setActiveConversation(null);
            setActiveUser(null);
            setMessages([]);
          }

          return;
        }
      }

      setActiveConversation(null);
      setActiveUser(null);
      setMessages([]);
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [
    profile?.uid,
    searchParams,
    setSearchParams,
    conversations,
  ]);

  /*
   * ==================================================
   * SUBSCRIBE TO MESSAGES
   * ==================================================
   */

  useEffect(() => {
    if (
      !profile?.uid ||
      !activeConversation?.id
    ) {
      setMessages([]);

      return;
    }

    setMessages([]);

    const convId = activeConversation.id;
    const currentUid = profile.uid;

    const unsubscribe =
      subscribeMessages(
        convId,
        (incomingMessages) => {
          setMessages(incomingMessages);

          // Mark incoming messages as read in real-time if active in conversation
          if (document.visibilityState === "visible") {
            markConversationRead(
              convId,
              currentUid,
            ).catch((error) => {
              console.error(
                "Failed to mark conversation as read:",
                error,
              );
            });
          }
        },
      );

    // Initial mark as read when entering
    markConversationRead(
      convId,
      currentUid,
    ).catch((error) => {
      console.error(
        "Failed to mark conversation as read:",
        error,
      );
    });

    function handleVisibilityOrFocus() {
      if (document.visibilityState === "visible") {
        markConversationRead(
          convId,
          currentUid,
        ).catch((error) => {
          console.error(
            "Failed to mark conversation as read on focus:",
            error,
          );
        });
      }
    }

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      markConversationRead(convId, currentUid).catch(() => {});
      unsubscribe();
    };
  }, [
    activeConversation?.id,
    profile?.uid,
  ]);

  /*
   * ==================================================
   * REAL-TIME ACTIVE CONVERSATION LISTENER
   *
   * Listens directly to the active conversation document
   * to get instantaneous lastRead and unreadCount changes.
   * ==================================================
   */

  const activeConvId = activeConversation?.id;

  useEffect(() => {
    if (!activeConvId) {
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "conversations", activeConvId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setActiveConversation((prev) => {
            if (!prev || prev.id !== snapshot.id) {
              return prev;
            }

            return {
              ...prev,
              ...data,
              id: snapshot.id,
              rawUnreadCount: data.unreadCount || {},
              lastRead: data.lastRead || {},
            };
          });
        }
      },
      (error) => {
        console.error(
          "Active conversation listener error:",
          error,
        );
      },
    );

    return () => {
      unsubscribe();
    };
  }, [activeConvId]);

  /*
   * ==================================================
   * SELECT CONVERSATION
   * ==================================================
   */

  function selectConversation(conversation) {
    setSearch("");

    setSearchParams({
      conversation:
        conversation.id,
    });
  }

  /*
   * ==================================================
   * SELECT USER
   * ==================================================
   */

  function selectUser(user) {
    setSearch("");

    setSearchParams({
      user: user.uid,
    });
  }

  /*
   * ==================================================
   * CREATE FAILED MESSAGE
   * ==================================================
   */

  function createFailedMessage({
    conversationId,
    text,
    image,
    error,
    stage,
  }) {
    return {
      id: `failed_${Date.now()}`,

      conversationId:
        conversationId || "temp",

      senderId:
        profile?.uid || null,

      text,

      type: image
        ? "image"
        : "text",

      imageUrl:
        image?.previewUrl || null,

      imageId: null,

      status: "failed",

      error:
        error ||
        "Failed to send message",

      stage,

      createdAt: {
        seconds: Math.floor(
          Date.now() / 1000,
        ),
      },
    };
  }

  /*
   * ==================================================
   * CLEAR CURRENT DRAFT
   * ==================================================
   */

  function clearCurrentDraft() {
    if (!currentTargetKey) {
      return;
    }

    setDrafts((previous) => {
      const next = {
        ...previous,
      };

      delete next[currentTargetKey];

      return next;
    });
  }

  /*
   * ==================================================
   * SEND MESSAGE
   * ==================================================
   */

  async function handleSend(
    customImage = null,
  ) {
    const activeImg =
      customImage || selectedImage;

    const text = message.trim();

    if (!text && !activeImg) {
      return;
    }

    if (!profile?.uid) {
      showToast.error(
        "You must be logged in to send a message.",
      );

      return;
    }

    let conversationId =
      activeConversation?.id;

    let stage = "prepare";

    if (
      !conversationId &&
      !activeUser?.uid
    ) {
      showToast.error(
        "No user selected.",
      );

      return;
    }

    if (!navigator.onLine) {
      const failedMessage =
        createFailedMessage({
          conversationId,
          text,
          image: activeImg,
          error:
            "No internet connection",
          stage: "offline",
        });

      setFailedMessages((previous) => [
        ...previous,
        failedMessage,
      ]);

      setMessage("");
      setSelectedImage(null);

      clearCurrentDraft();

      showToast.error(
        "Unable to send. No internet connection.",
      );

      return;
    }

    try {
      if (activeImg) {
        setUploadingImage(true);
      }

      /*
       * Create conversation if needed.
       */

      if (!conversationId) {
        stage =
          "create-conversation";

        conversationId =
          await createConversation(
            profile,
            activeUser,
          );
      }

      /*
       * Upload image if present.
       */

      let imageUrl = null;
      let imageId = null;

      if (activeImg?.file) {
        stage = "upload-image";

        const uploaded =
          await uploadMessageImage(
            activeImg.file,
          );

        imageUrl =
          uploaded?.url || null;

        imageId =
          uploaded?.publicId || null;
      }

      /*
       * Send Firestore message.
       */

      stage = "send-message";

      await sendMessageService({
        conversationId,

        senderId:
          profile.uid,

        text,

        type: activeImg
          ? "image"
          : "text",

        imageUrl,
        imageId,
      });

      /*
       * Only change URL after the message
       * was successfully sent.
       */

      if (!activeConversation?.id) {
        setSearchParams(
          {
            conversation:
              conversationId,
          },
          {
            replace: true,
          },
        );
      }

      setMessage("");
      setSelectedImage(null);

      clearCurrentDraft();
    } catch (error) {
      console.error(
        `[Messages] Failed during "${stage}":`,
        error,
      );

      console.error(
        "[Messages] Error code:",
        error.code,
      );

      console.error(
        "[Messages] Error message:",
        error.message,
      );

      const failedMessage =
        createFailedMessage({
          conversationId,
          text,
          image: activeImg,
          error:
            error.message,
          stage,
        });

      setFailedMessages((previous) => [
        ...previous,
        failedMessage,
      ]);

      setMessage("");
      setSelectedImage(null);

      clearCurrentDraft();

      if (
        error.code ===
        "permission-denied"
      ) {
        showToast.error(
          `Message blocked by Firestore permissions (${stage}).`,
        );
      } else {
        showToast.error(
          error.message ||
            "Unable to send message.",
        );
      }
    } finally {
      setUploadingImage(false);
    }
  }

  /*
   * ==================================================
   * RETRY FAILED MESSAGE
   * ==================================================
   */

  async function retryMessage(
    failedMessage,
  ) {
    setFailedMessages((previous) =>
      previous.filter(
        (messageItem) =>
          messageItem.id !==
          failedMessage.id,
      ),
    );

    if (!navigator.onLine) {
      setFailedMessages((previous) => [
        ...previous,
        failedMessage,
      ]);

      showToast.error(
        "Unable to send. No internet connection.",
      );

      return;
    }

    /*
     * A blob URL is only a local preview.
     * The original File is gone, so it cannot
     * be uploaded again.
     */

    if (
      failedMessage.type ===
        "image" &&
      (!failedMessage.imageUrl ||
        failedMessage.imageUrl.startsWith(
          "blob:",
        ))
    ) {
      setFailedMessages((previous) => [
        ...previous,
        failedMessage,
      ]);

      showToast.error(
        "Please select the image again before retrying.",
      );

      return;
    }

    let stage = "prepare";

    try {
      let conversationId =
        failedMessage.conversationId;

      if (
        !conversationId ||
        conversationId === "temp"
      ) {
        conversationId =
          activeConversation?.id;
      }

      if (
        !conversationId &&
        activeUser?.uid
      ) {
        stage =
          "create-conversation";

        conversationId =
          await createConversation(
            profile,
            activeUser,
          );
      }

      if (!conversationId) {
        throw new Error(
          "No conversation found.",
        );
      }

      stage = "send-message";

      await sendMessageService({
        conversationId,

        senderId:
          profile.uid,

        text:
          failedMessage.text || "",

        type:
          failedMessage.type ||
          "text",

        imageUrl:
          failedMessage.imageUrl?.startsWith(
            "blob:",
          )
            ? null
            : failedMessage.imageUrl ||
              null,

        imageId:
          failedMessage.imageId ||
          null,
      });

      if (!activeConversation?.id) {
        setSearchParams(
          {
            conversation:
              conversationId,
          },
          {
            replace: true,
          },
        );
      }
    } catch (error) {
      console.error(
        `[Messages] Retry failed during "${stage}":`,
        error,
      );

      setFailedMessages((previous) => [
        ...previous,
        {
          ...failedMessage,

          error:
            error.message ||
            "Failed to retry message",

          stage,
        },
      ]);

      if (
        error.code ===
        "permission-denied"
      ) {
        showToast.error(
          `Message blocked by Firestore permissions (${stage}).`,
        );
      } else {
        showToast.error(
          error.message ||
            "Unable to send message.",
        );
      }
    }
  }

  /*
   * ==================================================
   * DELETE FAILED MESSAGE
   * ==================================================
   */

  function deleteFailedMessage(id) {
    setFailedMessages((previous) =>
      previous.filter(
        (messageItem) =>
          messageItem.id !== id,
      ),
    );
  }

  /*
   * ==================================================
   * SEND PRODUCT INQUIRY
   * ==================================================
   */

  async function handleSendInquiry(
    quantity,
  ) {
    if (!inquiryProduct) {
      showToast.error(
        "No product selected for inquiry.",
      );

      return;
    }

    if (!profile?.uid) {
      showToast.error(
        "You must be logged in.",
      );

      return;
    }

    const parsedQuantity =
      Number(quantity);

    const stock = Number(
      inquiryProduct.stock,
    );

    if (
      !Number.isInteger(
        parsedQuantity,
      ) ||
      parsedQuantity < 1
    ) {
      showToast.error(
        "Please enter a valid quantity.",
      );

      return;
    }

    if (
      inquiryProduct.available !== true ||
      !Number.isInteger(stock) ||
      stock < 1
    ) {
      showToast.error(
        "This product is currently unavailable.",
      );

      return;
    }

    if (parsedQuantity > stock) {
      showToast.error(
        `Only ${stock} ${
          inquiryProduct.unit ||
          "units"
        } available.`,
      );

      return;
    }

    try {
      let conversationId =
        activeConversation?.id;

      if (!conversationId) {
        if (!activeUser?.uid) {
          showToast.error(
            "Unable to determine the farmer.",
          );

          return;
        }

        conversationId =
          await createConversation(
            profile,
            activeUser,
          );
      }

      await sendMessageService({
        conversationId,

        senderId:
          profile.uid,

        text:
          `I'm interested in ${inquiryProduct.name}.`,

        type:
          "product_inquiry",

        productId:
          inquiryProduct.id,

        quantity:
          parsedQuantity,

        inquiryStatus:
          "pending",
      });

      /*
       * Only navigate after the inquiry succeeds.
       */

      if (!activeConversation?.id) {
        setSearchParams(
          {
            conversation:
              conversationId,
          },
          {
            replace: true,
          },
        );
      }

      setInquiryProduct(null);

      navigate(
        `${location.pathname}${location.search}`,
        {
          replace: true,
          state: null,
        },
      );

      showToast.success(
        "Inquiry sent successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to send inquiry:",
        error,
      );

      showToast.error(
        error.message ||
          "Failed to send inquiry.",
      );
    }
  }

  /*
   * ==================================================
   * ACCEPT PRODUCT INQUIRY
   * ==================================================
   */

  async function handleAcceptInquiry(
    inquiryMessage,
  ) {
    if (!inquiryMessage?.id) {
      showToast.error(
        "Invalid inquiry message.",
      );

      return;
    }

    if (
      inquiryMessage.type !==
      "product_inquiry"
    ) {
      showToast.error(
        "This message is not an inquiry.",
      );

      return;
    }

    if (
      inquiryMessage.inquiryStatus !==
      "pending"
    ) {
      showToast.error(
        "This inquiry has already been processed.",
      );

      return;
    }

    if (!profile?.uid) {
      showToast.error(
        "You must be logged in.",
      );

      return;
    }

    try {
      await acceptProductInquiry({
        inquiryMessage,
        farmer: profile,
      });

      showToast.success(
        "Inquiry accepted.",
      );
    } catch (error) {
      console.error(
        "Failed to accept inquiry:",
        error,
      );

      showToast.error(
        error.message ||
          "Failed to accept inquiry.",
      );

      throw error;
    }
  }

  /*
   * ==================================================
   * FILTER CONVERSATIONS
   * ==================================================
   */

  const filteredConversations = useMemo(() => {
    if (!search.trim()) {
      return conversations;
    }

    const keyword =
      search.toLowerCase();

    return conversations.filter(
      ({ otherUser }) =>
        otherUser?.fullname
          ?.toLowerCase()
          .includes(keyword) ||
        otherUser?.username
          ?.toLowerCase()
          .includes(keyword),
    );
  }, [
    conversations,
    search,
  ]);

  /*
   * ==================================================
   * KEEP ACTIVE CONVERSATION IN SYNC WITH
   * ENRICHED CONVERSATION LIST
   * ==================================================
   */

  const activeConversationLive =
    useMemo(() => {
      if (!activeConversation?.id) {
        return activeConversation;
      }

      const found =
        conversations.find(
          (conversation) =>
            conversation.id ===
            activeConversation.id,
        );

      if (!found) {
        return activeConversation;
      }

      return {
        ...activeConversation,
        ...found,

        otherUser:
          found.otherUser ||
          activeConversation.otherUser,
      };
    }, [
      activeConversation,
      conversations,
    ]);

  /*
   * ==================================================
   * COMBINE REAL AND FAILED MESSAGES
   * ==================================================
   */

  const combinedMessages = useMemo(() => {
    const targetConversationId =
      activeConversation?.id;

    const currentFailed =
      failedMessages.filter(
        (messageItem) =>
          (
            targetConversationId &&
            messageItem.conversationId ===
              targetConversationId
          ) ||
          (
            messageItem.conversationId ===
              "temp" &&
            Boolean(activeUser)
          ),
      );

    return [
      ...messages,
      ...currentFailed,
    ];
  }, [
    messages,
    failedMessages,
    activeConversation?.id,
    activeUser,
  ]);

  /*
   * ==================================================
   * RETURN
   * ==================================================
   */

  return {
    loading,

    searching,

    conversations,
    filteredConversations,
    userResults,

    activeConversation:
      activeConversationLive,

    activeUser,

    messages:
      combinedMessages,

    inquiryProduct,
    inquiryProducts,

    sendInquiry:
      handleSendInquiry,

    acceptInquiry:
      handleAcceptInquiry,

    search,
    setSearch,

    message,

    setMessage:
      handleMessageChange,

    selectedImage,
    setSelectedImage,

    uploadingImage,

    drafts,
    isOnline,

    selectConversation,
    selectUser,

    sendMessage:
      handleSend,

    retryMessage,
    deleteFailedMessage,
  };
}