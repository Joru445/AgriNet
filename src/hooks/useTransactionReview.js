import { useCallback, useEffect, useState } from "react";

import { getInquiry } from "../services/inquiry.service";

import { getInquiryFarmerReview } from "../services/farmer-review.service";

import { getInquiryProductReview } from "../services/product-review.service";

import { submitTransactionReview } from "../services/transaction-review.service";

import { useAuth } from "../context/AuthContext";

export default function useTransactionReview(inquiryId) {
  const { profile } = useAuth();

  const [inquiry, setInquiry] = useState(null);
  const [farmerReview, setFarmerReview] = useState(null);
  const [productReview, setProductReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadReview = useCallback(async () => {
    if (!inquiryId) {
      setError("Invalid inquiry.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const inquiryData = await getInquiry(inquiryId);

      if (!inquiryData) {
        throw new Error("Inquiry not found.");
      }

      if (inquiryData.status !== "completed") {
        throw new Error("This transaction is not completed yet.");
      }

      setInquiry(inquiryData);

      const [farmerReviewData, productReviewData] = await Promise.all([
        getInquiryFarmerReview(inquiryId),
        getInquiryProductReview(inquiryId),
      ]);

      setFarmerReview(farmerReviewData);
      setProductReview(productReviewData);
    } catch (err) {
      console.error("Failed to load transaction review:", err);

      setError(err.message || "Failed to load transaction review.");
    } finally {
      setLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const submitReview = useCallback(
    async ({ farmerRating, farmerComment, productRating, productComment }) => {
      if (!profile?.uid) {
        throw new Error("You must be signed in to submit a review.");
      }

      if (!inquiry) {
        throw new Error("Inquiry not found.");
      }

      if (inquiry.reviewed === true) {
        throw new Error("This transaction has already been reviewed.");
      }

      if (farmerReview || productReview) {
        throw new Error("This transaction has already been reviewed.");
      }

      try {
        setSubmitting(true);
        setError(null);

        await submitTransactionReview({
          inquiryId,
          reviewerId: profile.uid,

          farmerRating,
          farmerComment,

          productRating,
          productComment,
        });

        await loadReview();
      } catch (err) {
        console.error("Failed to submit transaction review:", err);

        setError(err.message || "Failed to submit transaction review.");

        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [inquiryId, profile?.uid, inquiry, farmerReview, productReview, loadReview],
  );

  return {
    inquiry,
    farmerReview,
    productReview,
    loading,
    submitting,
    error,
    submitReview,
    reload: loadReview,
  };
}
