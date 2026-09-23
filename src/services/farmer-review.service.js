import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";
import { getUserProfile } from "./user.service";
import { getCachedUserProfile } from "../utils/userProfileCache";

const MAX_CONCURRENCY = 4;

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

export async function getFarmerReviews(farmerId) {
  if (!farmerId) return [];

  try {
    const result = await apiRequest(`/v1/reviews/farmers/${encodeURIComponent(farmerId)}`);
    const reviews = result?.data || [];

    return reviews.map((r) => ({
      ...r,
      reviewer: {
        fullname: r.reviewerName || "Anonymous",
        profilePicture: r.reviewerAvatar || "",
      },
    }));
  } catch (err) {
    console.warn("[Reviews] Backend API failed, loading from Firestore fallback:", err?.message);
    try {
      const revRef = collection(db, "reviews");
      const q = query(
        revRef,
        where("farmerId", "==", farmerId),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        reviewer: {
          fullname: docSnap.data().reviewerName || "Anonymous",
          profilePicture: docSnap.data().reviewerAvatar || "",
        },
      }));
    } catch (firestoreErr) {
      console.warn("[Reviews] Firestore ordered query failed, trying un-ordered query:", firestoreErr?.message);
      try {
        const revRef = collection(db, "reviews");
        const q = query(revRef, where("farmerId", "==", farmerId));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          reviewer: {
            fullname: docSnap.data().reviewerName || "Anonymous",
            profilePicture: docSnap.data().reviewerAvatar || "",
          },
        }));
        return docs.sort((a, b) => {
          const tA = a.createdAt?.seconds || (typeof a.createdAt === "number" ? a.createdAt / 1000 : 0);
          const tB = b.createdAt?.seconds || (typeof b.createdAt === "number" ? b.createdAt / 1000 : 0);
          return tB - tA;
        });
      } catch (fallbackErr) {
        console.error("[Reviews] Both API and Firestore failed:", fallbackErr);
        return [];
      }
    }
  }
}

export async function getRecentFarmerReviews(farmerId, maxLimit = 3) {
  if (!farmerId) return [];

  try {
    const result = await apiRequest(
      `/v1/reviews/farmers/${encodeURIComponent(farmerId)}?limit=${maxLimit}`,
    );
    const reviews = result?.data || [];

    return enrichFarmerReviews(
      reviews.map((r) => ({
        ...r,
        reviewer: {
          fullname: r.reviewerName || "Anonymous",
          profilePicture: r.reviewerAvatar || "",
        },
      })),
    );
  } catch (err) {
    console.warn("[Reviews] getRecentFarmerReviews falling back to getFarmerReviews:", err?.message);
    const all = await getFarmerReviews(farmerId);
    return enrichFarmerReviews(all.slice(0, maxLimit));
  }
}

export async function getAverageFarmerRating(farmerId) {
  if (!farmerId) return 0;
  try {
    const result = await apiRequest(`/v1/reviews/farmers/${encodeURIComponent(farmerId)}/summary`);
    return result.data?.average ?? 0;
  } catch {
    const all = await getFarmerReviews(farmerId);
    if (!all.length) return 0;
    const total = all.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    return Number((total / all.length).toFixed(1));
  }
}

export async function getFarmerReviewCount(farmerId) {
  if (!farmerId) return 0;
  try {
    const result = await apiRequest(`/v1/reviews/farmers/${encodeURIComponent(farmerId)}/summary`);
    return result.data?.count ?? 0;
  } catch {
    const all = await getFarmerReviews(farmerId);
    return all.length;
  }
}

export async function getInquiryFarmerReview(inquiryId) {
  try {
    const result = await apiRequest(`/v1/reviews/inquiries/${inquiryId}/farmer`);
    return result.data ?? null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
