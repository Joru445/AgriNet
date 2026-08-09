import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const inquiriesRef = collection(db, "inquiries");

/*
 * Create an inquiry after the farmer accepts
 * a product inquiry message.
 */
export async function createInquiry({
  conversationId,
  inquiryMessageId,
  consumerId,
  farmerId,
  productId,
}) {
  const docRef = await addDoc(inquiriesRef, {
    conversationId,
    inquiryMessageId,
    consumerId,
    farmerId,
    productId,

    status: "accepted",

    createdAt: serverTimestamp(),
    acceptedAt: serverTimestamp(),
  });

  return docRef.id;
}

/*
 * Subscribe to inquiries belonging to the
 * currently authenticated user.
 */
export function subscribeUserInquiries(uid, role, callback) {
  if (!uid || !callback) {
    return () => {};
  }

  const field = role === "farmer" ? "farmerId" : "consumerId";

  const q = query(
    inquiriesRef,
    where(field, "==", uid),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const inquiries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback(inquiries);
    },
    (error) => {
      console.error("Failed to subscribe to inquiries:", error);
    },
  );
}

/*
 * Update the status of an inquiry.
 *
 * accepted -> ongoing
 * ongoing  -> resolved
 */
export async function updateInquiryStatus(inquiryId, status) {
  const allowedStatuses = ["accepted", "ongoing", "resolved"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid inquiry status.");
  }

  const inquiryRef = doc(db, "inquiries", inquiryId);

  const data = {
    status,
  };

  if (status === "ongoing") {
    data.ongoingAt = serverTimestamp();
  }

  if (status === "resolved") {
    data.resolvedAt = serverTimestamp();
  }

  await updateDoc(inquiryRef, data);
}
