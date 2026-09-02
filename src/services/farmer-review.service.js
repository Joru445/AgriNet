import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { getUserProfile } from "./user.service";
import { getCachedUserProfile } from "../utils/userProfileCache";
import * as pageCache from "../utils/pageCache";

const reviewsRef = collection(db, "reviews");
const inquiriesRef = collection(db, "inquiries");

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

export async function getReviewById(id) {
  const snapshot = await getDoc(doc(reviewsRef, id));

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

/**
 * Create a farmer review using the inquiry ID
 * as the review document ID.
 */
export async function createReview(data) {
  const { inquiryId, farmerId, reviewerId, rating, comment } = data;

  if (!inquiryId || !farmerId || !reviewerId) {
    throw new Error("Missing review information.");
  }

  const inquiryRef = doc(inquiriesRef, inquiryId);
  const inquirySnapshot = await getDoc(inquiryRef);

  if (!inquirySnapshot.exists()) {
    throw new Error("Inquiry not found.");
  }

  const inquiry = inquirySnapshot.data();

  if (inquiry.status !== "completed") {
    throw new Error("Only completed transactions can be reviewed.");
  }

  if (inquiry.consumerId !== reviewerId) {
    throw new Error("Only the consumer can submit this review.");
  }

  if (inquiry.farmerId !== farmerId) {
    throw new Error("The farmer does not belong to this inquiry.");
  }

  const reviewRef = doc(reviewsRef, inquiryId);

  const existingReview = await getDoc(reviewRef);

  if (existingReview.exists()) {
    throw new Error("You have already reviewed this transaction.");
  }

  await setDoc(reviewRef, {
    inquiryId,
    farmerId,
    reviewerId,

    rating: Number(rating),
    comment: comment?.trim() || "",

    createdAt: serverTimestamp(),
  });

  // Persist aggregated rating & reviewCount on farmer and user documents
  try {
    const q = query(reviewsRef, where("farmerId", "==", farmerId));
    const allReviewsSnap = await getDocs(q);
    const totalRating =
      allReviewsSnap.docs.reduce((sum, r) => sum + Number(r.data().rating || 0), 0);
    const newCount = allReviewsSnap.size;
    const newAverage = newCount > 0 ? Number((totalRating / newCount).toFixed(1)) : 0;

    await Promise.all([
      updateDoc(doc(db, "farmers", farmerId), {
        rating: newAverage,
        reviewCount: newCount,
      }).catch(() => {}),
      updateDoc(doc(db, "users", farmerId), {
        rating: newAverage,
        reviewCount: newCount,
      }).catch(() => {}),
    ]);
  } catch (err) {
    console.warn("Could not update farmer aggregate rating:", err);
  }

  // Invalidate related caches
  pageCache.invalidatePrefix(`storeProfile:${farmerId}`);
  pageCache.invalidatePrefix(`farmerDashboard:${farmerId}`);

  return reviewRef.id;
}

export async function deleteReview(id) {
  await deleteDoc(doc(reviewsRef, id));
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
