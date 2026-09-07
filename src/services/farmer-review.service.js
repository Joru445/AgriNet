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
  const result = await apiRequest(`/reviews/farmers/${farmerId}`);
  const reviews = result.data || [];

  return reviews.map((r) => ({
    ...r,
    reviewer: {
      fullname: r.reviewerName || "Anonymous",
      profilePicture: r.reviewerAvatar || "",
    },
  }));
}

export async function getRecentFarmerReviews(farmerId, maxLimit = 3) {
  const result = await apiRequest(
    `/reviews/farmers/${farmerId}?limit=${maxLimit}`,
  );
  const reviews = result.data || [];

  return enrichFarmerReviews(
    reviews.map((r) => ({
      ...r,
      reviewer: {
        fullname: r.reviewerName || "Anonymous",
        profilePicture: r.reviewerAvatar || "",
      },
    })),
  );
}

export async function getAverageFarmerRating(farmerId) {
  const result = await apiRequest(`/reviews/farmers/${farmerId}/summary`);
  return result.data?.average ?? 0;
}

export async function getFarmerReviewCount(farmerId) {
  const result = await apiRequest(`/reviews/farmers/${farmerId}/summary`);
  return result.data?.count ?? 0;
}

export async function getInquiryFarmerReview(inquiryId) {
  try {
    const result = await apiRequest(`/reviews/inquiries/${inquiryId}/farmer`);
    return result.data ?? null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
