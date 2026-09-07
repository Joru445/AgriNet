import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const productReviewsRef = collection(db, "product-reviews");

export async function getProductReviews() {
  const q = query(productReviewsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((reviewDoc) => ({
    id: reviewDoc.id,
    ...reviewDoc.data(),
  }));
}

export async function getProductReviewById(id) {
  const snapshot = await getDoc(doc(productReviewsRef, id));

  if (!snapshot.exists()) {
    throw new Error("Product review not found.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getReviewsByProduct(productId, { maxReviews = 20 } = {}) {
  try {
    const q = query(
      productReviewsRef,
      where("productId", "==", productId),
      orderBy("createdAt", "desc"),
      limit(maxReviews),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((reviewDoc) => ({
      id: reviewDoc.id,
      ...reviewDoc.data(),
    }));
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    return [];
  }
}

export async function getProductReviewSummaries(productIds) {
  const summaries = new Map();

  for (let index = 0; index < productIds.length; index += 30) {
    const ids = productIds.slice(index, index + 30);

    if (!ids.length) continue;

    const snapshot = await getDocs(
      query(productReviewsRef, where("productId", "in", ids)),
    );

    snapshot.docs.forEach((reviewDoc) => {
      const review = reviewDoc.data();

      const summary = summaries.get(review.productId) ?? {
        total: 0,
        count: 0,
      };

      summary.total += Number(review.rating);
      summary.count += 1;

      summaries.set(review.productId, summary);
    });
  }

  return new Map(
    [...summaries].map(([productId, summary]) => [
      productId,
      {
        average: Number((summary.total / summary.count).toFixed(1)),
        count: summary.count,
      },
    ]),
  );
}

export async function getAverageProductRating(productId) {
  const reviews = await getReviewsByProduct(productId);

  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);

  return Number((total / reviews.length).toFixed(1));
}

export async function getProductReviewCount(productId) {
  const reviews = await getReviewsByProduct(productId);

  return reviews.length;
}

export async function getUserProductReview(productId, reviewerId) {
  const q = query(
    productReviewsRef,
    where("productId", "==", productId),
    where("reviewerId", "==", reviewerId),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  };
}

export async function getInquiryProductReview(inquiryId) {
  const snapshot = await getDoc(doc(productReviewsRef, inquiryId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
