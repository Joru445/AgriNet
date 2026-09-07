import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { getUserProfile } from "./user.service";
import { getCachedUserProfile } from "../utils/userProfileCache";

const reviewsRef = collection(db, "reviews");

const MAX_CONCURRENCY = 4;

function attachReviewerFallback(reviewData) {
  return {
    ...reviewData,
    reviewer: {
      fullname: reviewData.reviewerName || "Anonymous",
      profilePicture: reviewData.reviewerAvatar || "",
    },
  };
}

/**
 * Fill in full reviewer profiles for farmer reviews.
 *
 * Uses the sync profile cache first and only fetches misses over the
 * network with bounded concurrency so a busy farmer's review list
 * never fans out into dozens of parallel document reads.
 */
export async function enrichFarmerReviews(reviews) {
  const uniqueReviewerIds = [
    ...new Set(reviews.map((r) => r.reviewerId).filter(Boolean)),
  ];

  const reviewerMap = new Map();
  const pendingReviewers = [];

  uniqueReviewerIds.forEach((uid) => {
    const cached = getCachedUserProfile(uid);
    if (cached) {
      reviewerMap.set(uid, cached);
    } else {
      pendingReviewers.push(uid);
    }
  });

  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < pendingReviewers.length) {
      const uid = pendingReviewers[nextIndex];
      nextIndex += 1;
      try {
        const profile = await getUserProfile(uid);
        if (profile) reviewerMap.set(uid, profile);
      } catch {
        /* noop */
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENCY, pendingReviewers.length) },
      () => runWorker(),
    ),
  );

  return reviews.map((review) => ({
    ...review,
    reviewer:
      reviewerMap.get(review.reviewerId) || {
        fullname: review.reviewerName || "Anonymous",
        profilePicture: review.reviewerAvatar || "",
      },
  }));
}

export async function getReviews() {
  const q = query(reviewsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((reviewDoc) => ({
    id: reviewDoc.id,
    ...reviewDoc.data(),
  }));
}

export async function getFarmerReviews(farmerId) {
  const q = query(
    reviewsRef,
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => attachReviewerFallback(doc.data()));
}

export async function getRecentFarmerReviews(farmerId, maxLimit = 3) {
  const q = query(
    reviewsRef,
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  const recentReviews = snapshot.docs
    .slice(0, maxLimit)
    .map((doc) => attachReviewerFallback(doc.data()));

  return enrichFarmerReviews(recentReviews);
}

export async function getAverageFarmerRating(farmerId) {
  const reviews = await getFarmerReviews(farmerId);

  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);

  return Number((total / reviews.length).toFixed(1));
}

export async function getFarmerReviewCount(farmerId) {
  const q = query(reviewsRef, where("farmerId", "==", farmerId));

  const snapshot = await getDocs(q);

  return snapshot.size;
}

export async function getInquiryFarmerReview(inquiryId) {
  const snapshot = await getDoc(doc(reviewsRef, inquiryId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
