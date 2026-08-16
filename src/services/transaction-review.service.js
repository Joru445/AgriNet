import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const inquiriesRef = "inquiries";
const farmerReviewsRef = "reviews";
const productReviewsRef = "product-reviews";

export async function submitTransactionReview({
  inquiryId,
  reviewerId,
  farmerRating,
  farmerComment,
  productRating,
  productComment,
}) {
  if (!inquiryId || !reviewerId) {
    throw new Error("Missing transaction information.");
  }

  const inquiryRef = doc(db, inquiriesRef, inquiryId);

  const inquirySnapshot = await getDoc(inquiryRef);

  if (!inquirySnapshot.exists()) {
    throw new Error("Inquiry not found.");
  }

  const inquiry = inquirySnapshot.data();

  if (inquiry.status !== "completed") {
    throw new Error("Only completed transactions can be reviewed.");
  }

  if (inquiry.consumerId !== reviewerId) {
    throw new Error("Only the consumer can review this transaction.");
  }

  if (inquiry.reviewed === true) {
    throw new Error("This transaction has already been reviewed.");
  }

  const farmerReviewRef = doc(db, farmerReviewsRef, inquiryId);

  const productReviewRef = doc(db, productReviewsRef, inquiryId);

  const batch = writeBatch(db);

  batch.set(farmerReviewRef, {
    inquiryId,
    farmerId: inquiry.farmerId,
    reviewerId,

    rating: Number(farmerRating),
    comment: farmerComment?.trim() || "",

    createdAt: serverTimestamp(),
  });

  batch.set(productReviewRef, {
    inquiryId,
    productId: inquiry.productId,
    reviewerId,

    rating: Number(productRating),
    comment: productComment?.trim() || "",

    createdAt: serverTimestamp(),
  });

  batch.update(inquiryRef, {
    reviewed: true,
    farmerReviewId: inquiryId,
    productReviewId: inquiryId,
    reviewedAt: serverTimestamp(),
  });

  await batch.commit();

  return {
    inquiryId,
    farmerReviewId: inquiryId,
    productReviewId: inquiryId,
  };
}
