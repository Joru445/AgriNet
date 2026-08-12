import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const productReviewsRef = collection(db, "product-reviews");

export async function getProductReviews() {
  const q = query(
    productReviewsRef,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
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
      const summary = summaries.get(review.productId) ?? { total: 0, count: 0 };

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

export async function getProductReviewById(id) {
  const snapshot = await getDoc(doc(db, "product-reviews", id));

  if (!snapshot.exists()) {
    throw new Error("Product review not found.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getReviewsByProduct(productId) {
  const q = query(
    productReviewsRef,
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createProductReview(data) {
  const reviewRef = doc(productReviewsRef);
  const productRef = doc(db, "products", data.productId);

  await runTransaction(db, async (transaction) => {
    const product = await transaction.get(productRef);
    if (!product.exists()) throw new Error("Product not found.");

    const summary = product.data().ratingSummary ?? { average: 0, count: 0 };
    const count = Number(summary.count ?? 0) + 1;
    const total = Number(summary.average ?? 0) * Number(summary.count ?? 0) + Number(data.rating);

    transaction.set(reviewRef, {
      productId: data.productId,
      reviewerId: data.reviewerId,
      rating: Number(data.rating),
      comment: data.comment,
      createdAt: serverTimestamp(),
    });
    transaction.update(productRef, {
      ratingSummary: {
        average: Number((total / count).toFixed(1)),
        count,
      },
    });
  });

  return reviewRef.id;
}

export async function deleteProductReview(id) {
  const reviewRef = doc(db, "product-reviews", id);

  await runTransaction(db, async (transaction) => {
    const review = await transaction.get(reviewRef);
    if (!review.exists()) return;

    const productRef = doc(db, "products", review.data().productId);
    const product = await transaction.get(productRef);

    transaction.delete(reviewRef);
    if (!product.exists()) return;

    const summary = product.data().ratingSummary ?? { average: 0, count: 0 };
    const previousCount = Number(summary.count ?? 0);
    const count = Math.max(0, previousCount - 1);
    const total = Number(summary.average ?? 0) * previousCount - Number(review.data().rating);

    transaction.update(productRef, {
      ratingSummary: {
        average: count ? Number((total / count).toFixed(1)) : 0,
        count,
      },
    });
  });
}

export async function getAverageProductRating(productId) {
  const reviews = await getReviewsByProduct(productId);

  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating),
    0
  );

  return Number((total / reviews.length).toFixed(1));
}

export async function getProductReviewCount(productId) {
  const q = query(
    productReviewsRef,
    where("productId", "==", productId)
  );

  const snapshot = await getCountFromServer(q);

  return snapshot.data().count;
}

export async function getUserProductReview(productId, reviewerId) {
  const q = query(
    productReviewsRef,
    where("productId", "==", productId),
    where("reviewerId", "==", reviewerId)
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
