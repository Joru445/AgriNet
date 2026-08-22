import {
  collection,
  doc,
  getDoc,
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

/**
 * Subscribe to inquiries belonging to the current user.
 */
export function subscribeUserInquiries(uid, role, callback, onError) {
  if (!uid || !role || !callback) {
    return () => {};
  }

  const field = role === "farmer" ? "farmerId" : "consumerId";

  const inquiriesQuery = query(
    inquiriesRef,
    where(field, "==", uid),
    orderBy("createdAt", "desc"),
    limit(INQUIRY_PAGE_SIZE),
  );

  return onSnapshot(
    inquiriesQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((inquiryDoc) => ({
          id: inquiryDoc.id,
          ...inquiryDoc.data(),
        })),
      );
    },
    (error) => {
      console.error("Failed to subscribe to inquiries:", error);

      onError?.(error);
    },
  );
}

export async function getInquiry(inquiryId) {
  if (typeof inquiryId !== "string" || !inquiryId.trim()) {
    throw new Error("Invalid inquiry ID.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryId);

  const snapshot = await getDoc(inquiryRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/**
 * Accept a pending product inquiry.
 *
 * The inquiry does not exist until the farmer
 * accepts the inquiry message.
 *
 * Flow:
 *
 * message.pending
 *      ↓
 * farmer accepts
 *      ↓
 * inquiries/{messageId} created
 *      ↓
 * message.accepted
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
     * Make sure this is actually a
     * product inquiry.
     */
    if (messageData.type !== "product_inquiry") {
      throw new Error("This message is not a product inquiry.");
    }

    /*
     * Prevent the same inquiry from
     * being accepted twice.
     */
    if (messageData.inquiryStatus !== "pending") {
      throw new Error("This inquiry has already been processed.");
    }

    /*
     * Make sure the farmer owns
     * the product.
     */
    if (productData.farmerId !== farmer.uid) {
      throw new Error("Only this product's farmer can accept the inquiry.");
    }

    /*
     * Validate conversation participants.
     */
    if (
      !conversation.exists() ||
      !conversation.data().participants?.includes(farmer.uid) ||
      !conversation.data().participants?.includes(messageData.senderId)
    ) {
      throw new Error("The inquiry conversation is invalid.");
    }

    /*
     * Quantity is captured when the
     * consumer sends the inquiry.
     *
     * We normalize it here so the
     * inquiry always contains a number.
     */
    const quantity = normalizeQuantity(messageData.quantity);

    if (quantity <= 0) {
      throw new Error("The inquiry quantity must be greater than zero.");
    }

    if (
      productData.available !== true ||
      !Number.isInteger(productData.stock) ||
      quantity > productData.stock
    ) {
      throw new Error("The requested quantity is no longer available.");
    }

    const consumerData = consumer.exists() ? consumer.data() : {};

    const farmerData = farmerProfile.exists() ? farmerProfile.data() : farmer;

    /*
     * Create the inquiry.
     */
    transaction.set(inquiryRef, {
      conversationId: messageData.conversationId,

      inquiryMessageId: message.id,

      consumerId: messageData.senderId,

      farmerId: farmer.uid,

      productId: product.id,

      /*
       * IMPORTANT:
       * Quantity belongs directly to
       * the inquiry.
       */
      quantity,

      /*
       * New transaction lifecycle.
       */
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

      /*
       * Transaction proof fields.
       */
      proof: null,

      proofSubmittedAt: null,

      proofRejectedAt: null,

      proofRejectedBy: null,

      completedAt: null,
    });

    /*
     * Update the original inquiry message
     * in the same transaction.
     */
    transaction.update(messageRef, {
      inquiryStatus: "accepted",

      inquiryId: inquiryRef.id,

      acceptedAt: serverTimestamp(),
    });

    return inquiryRef.id;
  });
}

/**
 * Update an inquiry's lifecycle status.
 *
 * Allowed lifecycle:
 *
 * accepted
 *    ↓
 * ongoing
 *    ↓
 * awaiting_proof
 *    ↓
 * proof_submitted
 *    ↓
 * completed
 *
 * Cancellation is allowed from accepted
 * and ongoing.
 */
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

    /*
     * Consumer requesting completion
     * does NOT mean the transaction is
     * completed.
     *
     * It means proof is now required.
     */
    if (status === "awaiting_proof") {
      update.completionRequestedAt = serverTimestamp();
      update.completionRequestedBy = actor.uid;
    }

    if (status === "cancelled") {
      update.cancelledAt = serverTimestamp();

      update.cancelledBy = actor.uid;
    }

    /*
     * `completed` should normally only be
     * reached through confirmTransactionProof().
     *
     * This guard prevents somebody from
     * directly calling updateInquiryStatus()
     * with completed.
     */
    if (status === "completed") {
      throw new Error(
        "A transaction can only be completed after the farmer confirms the proof.",
      );
    }

    transaction.update(inquiryRef, update);
  });
}

/**
 * Consumer requests transaction completion.
 *
 * This changes:
 *
 * ongoing → awaiting_proof
 *
 * It does NOT complete the transaction.
 */
export async function requestTransactionCompletion({ inquiryId, consumerId }) {
  if (!inquiryId || !consumerId) {
    throw new Error("Missing transaction completion information.");
  }

  await updateInquiryStatus({
    inquiryId,
    status: "awaiting_proof",
    actor: {
      uid: consumerId,
      role: "consumer",
    },
  });
}

/**
 * Submit transaction proof.
 *
 * This changes:
 *
 * awaiting_proof → proof_submitted
 */
export async function submitTransactionProof({ inquiryId, consumerId, proof }) {
  if (!inquiryId || !consumerId) {
    throw new Error("Missing transaction proof information.");
  }

  if (!proof?.url) {
    throw new Error("A proof image is required.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(inquiryRef);

    if (!snapshot.exists()) {
      throw new Error("Inquiry not found.");
    }

    const inquiry = snapshot.data();

    if (inquiry.consumerId !== consumerId) {
      throw new Error("Only the consumer can submit transaction proof.");
    }

    if (normalizeStatus(inquiry.status) !== "awaiting_proof") {
      throw new Error("This inquiry is not waiting for transaction proof.");
    }

    transaction.update(inquiryRef, {
      status: "proof_submitted",

      proof: {
        url: proof.url,
        publicId: proof.publicId ?? "",
        uploadedBy: consumerId,
        uploadedAt: serverTimestamp(),
      },

      proofSubmittedAt: serverTimestamp(),

      proofRejectedAt: null,

      proofRejectedBy: null,

      statusUpdatedAt: serverTimestamp(),
    });
  });
}

/**
 * Farmer confirms transaction proof.
 *
 * This is the ONLY operation that can
 * transition:
 *
 * proof_submitted → completed
 */
export async function confirmTransactionProof({ inquiryId, farmerId }) {
  if (!inquiryId || !farmerId) {
    throw new Error("Missing transaction confirmation information.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(inquiryRef);

    if (!snapshot.exists()) {
      throw new Error("Inquiry not found.");
    }

    const inquiry = snapshot.data();

    if (inquiry.farmerId !== farmerId) {
      throw new Error("Only the farmer can confirm the transaction.");
    }

    if (normalizeStatus(inquiry.status) !== "proof_submitted") {
      throw new Error("There is no submitted proof to confirm.");
    }

    if (!inquiry.proof?.url) {
      throw new Error("Transaction proof is missing.");
    }

    transaction.update(inquiryRef, {
      status: "completed",

      completedAt: serverTimestamp(),

      completedBy: farmerId,

      statusUpdatedAt: serverTimestamp(),
    });
  });
}

/**
 * Farmer rejects the submitted proof.
 *
 * This changes:
 *
 * proof_submitted → awaiting_proof
 */
export async function rejectTransactionProof({ inquiryId, farmerId }) {
  if (!inquiryId || !farmerId) {
    throw new Error("Missing transaction proof information.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(inquiryRef);

    if (!snapshot.exists()) {
      throw new Error("Inquiry not found.");
    }

    const inquiry = snapshot.data();

    if (inquiry.farmerId !== farmerId) {
      throw new Error("Only the farmer can reject transaction proof.");
    }

    if (normalizeStatus(inquiry.status) !== "proof_submitted") {
      throw new Error("There is no submitted proof to reject.");
    }

    transaction.update(inquiryRef, {
      status: "awaiting_proof",

      proofRejectedAt: serverTimestamp(),

      proofRejectedBy: farmerId,

      statusUpdatedAt: serverTimestamp(),
    });
  });
}

/**
 * Cancel an inquiry.
 */
export async function cancelInquiry({ inquiryId, actor }) {
  return updateInquiryStatus({
    inquiryId,
    status: "cancelled",
    actor,
  });
}

/**
 * Validate an inquiry status transition.
 */
function assertTransition({ inquiry, currentStatus, status, actor }) {
  const isFarmer = actor.role === "farmer" && inquiry.farmerId === actor.uid;

  const isConsumer =
    actor.role === "consumer" && inquiry.consumerId === actor.uid;

  if (!isFarmer && !isConsumer) {
    throw new Error("You cannot update this inquiry.");
  }

  const isAllowed =
    /*
     * Farmer starts the transaction.
     */
    (isFarmer && currentStatus === "accepted" && status === "ongoing") ||
    /*
     * Consumer requests completion.
     */
    (isConsumer &&
      currentStatus === "ongoing" &&
      status === "awaiting_proof") ||
    /*
     * Cancellation.
     */
    (isFarmer &&
      ["accepted", "ongoing"].includes(currentStatus) &&
      status === "cancelled") ||
    (isConsumer &&
      ["accepted", "ongoing"].includes(currentStatus) &&
      status === "cancelled");

  if (!isAllowed) {
    throw new Error("This inquiry cannot make that status change.");
  }
}

/**
 * Normalize legacy status values.
 */
function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status;
}

/**
 * Normalize inquiry quantity.
 */
function normalizeQuantity(quantity) {
  const parsed = Number(quantity);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

/**
 * Create a stable user snapshot.
 */
function getPersonSnapshot(data, uid) {
  return {
    uid,

    fullname: data.fullname ?? "",

    username: data.username ?? "",

    profilePicture: data.profilePicture ?? "",

    verified: data.verified === true,
  };
}

/**
 * Get the first product image.
 */
function getImageUrl(images) {
  const image = images?.[0];

  return typeof image === "string" ? image : (image?.url ?? "");
}
