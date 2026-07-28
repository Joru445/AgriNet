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
  const docRef = await addDoc(productReviewsRef, {
    productId: data.productId,
    reviewerId: data.reviewerId,

    rating: Number(data.rating),
    comment: data.comment,

    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteProductReview(id) {
  await deleteDoc(doc(db, "product-reviews", id));
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