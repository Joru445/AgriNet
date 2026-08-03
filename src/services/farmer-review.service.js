import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

import { getUserProfile } from "./user.service";

const reviewsRef = collection(db, "reviews");

export async function getReviews() {
  const q = query(reviewsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getReviewById(id) {
  const snapshot = await getDoc(doc(db, "reviews", id));

  if (!snapshot.exists()) {
    throw new Error("Review not found.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getFarmerReviews(farmerId) {
  const q = query(
    reviewsRef,
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const review = {
        id: doc.id,
        ...doc.data(),
      };

      const reviewer = await getUserProfile(review.reviewerId);

      return {
        ...review,
        reviewer,
      };
    }),
  );
}

export async function getAverageFarmerRating(farmerId) {
  const reviews = await getFarmerReviews(farmerId);

  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);

  return Number((total / reviews.length).toFixed(1));
}

export async function getFarmerReviewCount(farmerId) {
  const reviews = await getFarmerReviews(farmerId);

  return reviews.length;
}

export async function createReview(data) {
  const reviewId = `${data.farmerId}_${data.reviewerId}`;

  const reviewRef = doc(db, "reviews", reviewId);

  await setDoc(reviewRef, {
    farmerId: data.farmerId,
    reviewerId: data.reviewerId,

    rating: Number(data.rating),
    comment: data.comment,

    createdAt: serverTimestamp(),
  });
}

export async function deleteReview(id) {
  await deleteDoc(doc(db, "reviews", id));
}
