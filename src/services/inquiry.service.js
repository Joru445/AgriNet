import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const inquiriesRef = collection(db, "inquiries");
const INQUIRY_PAGE_SIZE = 50;

export function subscribeUserInquiries(uid, role, callback) {
  if (!uid || !callback) return () => {};

  const field = role === "farmer" ? "farmerId" : "consumerId";

  const inquiriesQuery = query(
    inquiriesRef,
    where(field, "==", uid),
    orderBy("createdAt", "desc"),
    limit(INQUIRY_PAGE_SIZE),
  );

  return onSnapshot(
    inquiriesQuery,
    (snapshot) =>
      callback(
        snapshot.docs.map((inquiryDoc) => ({
          id: inquiryDoc.id,
          ...inquiryDoc.data(),
        })),
      ),
    (error) => console.error("Failed to subscribe to inquiries:", error),
  );
}

/**
 * Accepts a pending product-inquiry message and creates its
 * corresponding inquiry lifecycle record atomically.
 *
 * The inquiry does NOT exist while the message is pending.
 *
 * Flow:
 *   message.inquiryStatus = "pending"
 *        ↓
 *   farmer accepts
 *        ↓
 *   create inquiries/{messageId}
 *   update message → "accepted"
 *
 * The message ID is used as the inquiry ID so the two records
 * can be directly associated.
 */
export async function acceptProductInquiry({ inquiryMessage, farmer }) {
  if (!inquiryMessage?.id || !farmer?.uid) {
    throw new Error("Invalid inquiry.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryMessage.id);
  const messageRef = doc(db, "messages", inquiryMessage.id);
  const productRef = doc(db, "products", inquiryMessage.productId);
  const consumerRef = doc(db, "users", inquiryMessage.senderId);
  const farmerRef = doc(db, "farmers", farmer.uid);
  const conversationRef = doc(
    db,
    "conversations",
    inquiryMessage.conversationId,
  );

  return runTransaction(db, async (transaction) => {
    const [message, product, consumer, farmerProfile, conversation] =
      await Promise.all([
        transaction.get(messageRef),
        transaction.get(productRef),
        transaction.get(consumerRef),
        transaction.get(farmerRef),
        transaction.get(conversationRef),
      ]);

    if (!message.exists()) {
      throw new Error("The inquiry message no longer exists.");
    }

    if (!product.exists()) {
      throw new Error("The product is no longer available.");
    }

    const messageData = message.data();
    const productData = product.data();

    /*
     * The message is the source of truth before an inquiry exists.
     *
     * A pending product-inquiry message can be accepted.
     * Once it becomes accepted, the transaction must not create
     * another inquiry.
     */
    if (messageData.type !== "product_inquiry") {
      throw new Error("This message is not a product inquiry.");
    }

    if (messageData.inquiryStatus !== "pending") {
      throw new Error("This inquiry has already been processed.");
    }

    /*
     * Make sure the authenticated farmer actually owns
     * the product associated with the inquiry.
     */
    if (productData.farmerId !== farmer.uid) {
      throw new Error("Only this product's farmer can accept the inquiry.");
    }

    /*
     * Make sure the inquiry message belongs to the expected
     * conversation and that both users are participants.
     */
    if (
      !conversation.exists() ||
      !conversation.data().participants?.includes(farmer.uid) ||
      !conversation.data().participants?.includes(messageData.senderId)
    ) {
      throw new Error("The inquiry conversation is invalid.");
    }

    const consumerData = consumer.exists() ? consumer.data() : {};
    const farmerData = farmerProfile.exists() ? farmerProfile.data() : farmer;

    /*
     * Create the inquiry only now, when the farmer accepts
     * the product-inquiry message.
     */
    transaction.set(inquiryRef, {
      conversationId: messageData.conversationId,
      inquiryMessageId: message.id,
      consumerId: messageData.senderId,
      farmerId: farmer.uid,
      productId: product.id,

      status: "accepted",

      productSnapshot: {
        name: productData.name ?? "Product",
        price: Number(productData.price ?? 0),
        unit: productData.unit ?? "",
        imageUrl: getImageUrl(productData.images),
      },

      consumerSnapshot: getPersonSnapshot(consumerData, messageData.senderId),

      farmerSnapshot: getPersonSnapshot(farmerData, farmer.uid),

      createdAt: serverTimestamp(),
      acceptedAt: serverTimestamp(),
      statusUpdatedAt: serverTimestamp(),
    });

    /*
     * The message is updated as part of the same transaction.
     *
     * If another request tries to accept the same message,
     * the transaction will re-check the message and see that
     * inquiryStatus is no longer "pending".
     */
    transaction.update(messageRef, {
      inquiryStatus: "accepted",
      inquiryId: inquiryRef.id,
      acceptedAt: serverTimestamp(),
    });

    return inquiryRef.id;
  });
}

export async function updateInquiryStatus({ inquiryId, status, actor }) {
  if (!inquiryId || !actor?.uid || !actor?.role) {
    throw new Error("Missing inquiry update information.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(inquiryRef);

    if (!snapshot.exists()) {
      throw new Error("Inquiry not found.");
    }

    const inquiry = snapshot.data();
    const currentStatus = normalizeStatus(inquiry.status);

    assertTransition({
      inquiry,
      currentStatus,
      status,
      actor,
    });

    const update = {
      status,
      statusUpdatedAt: serverTimestamp(),
    };

    if (status === "ongoing") {
      update.ongoingAt = serverTimestamp();
    }

    if (status === "completed") {
      update.completedAt = serverTimestamp();
    }

    if (status === "cancelled") {
      update.cancelledAt = serverTimestamp();
      update.cancelledBy = actor.uid;
    }

    transaction.update(inquiryRef, update);
  });
}

function assertTransition({ inquiry, currentStatus, status, actor }) {
  const isFarmer = actor.role === "farmer" && inquiry.farmerId === actor.uid;

  const isConsumer =
    actor.role === "consumer" && inquiry.consumerId === actor.uid;

  if (!isFarmer && !isConsumer) {
    throw new Error("You cannot update this inquiry.");
  }

  const isAllowed =
    (isFarmer && currentStatus === "accepted" && status === "ongoing") ||
    (isFarmer &&
      ["accepted", "ongoing"].includes(currentStatus) &&
      status === "cancelled") ||
    (isConsumer && currentStatus === "ongoing" && status === "completed") ||
    (isConsumer &&
      ["accepted", "ongoing"].includes(currentStatus) &&
      status === "cancelled");

  if (!isAllowed) {
    throw new Error("This inquiry cannot make that status change.");
  }
}

function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status;
}

function getPersonSnapshot(data, uid) {
  return {
    uid,
    fullname: data.fullname ?? "",
    username: data.username ?? "",
    farmName: data.farmName ?? "",
  };
}

function getImageUrl(images) {
  const image = images?.[0];

  return typeof image === "string" ? image : (image?.url ?? "");
}
