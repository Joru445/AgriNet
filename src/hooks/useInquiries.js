import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useInquiriesContext } from "../context/InquiriesContext";

import {
  apiStartTransaction,
  apiRequestCompletion,
  apiSubmitProof,
  apiConfirmProof,
  apiRejectProof,
  apiCancelInquiry,
} from "../services/inquiry.service";

import { getProductById } from "../services/product.service";
import { getUserProfile, updateUser } from "../services/user.service";
import { getFarmerById } from "../services/farmer.service";

import { showToast } from "../utils/toast";

export default function useInquiries() {
  const { profile } = useAuth();
  const { inquiries, loading, error } = useInquiriesContext();

  const [inquiryData, setInquiryData] = useState({});

  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const farmerCacheRef = useRef(new Map());

  const profileRef = useRef(profile);

  useEffect(() => {
    profileRef.current = profile;
  });

  /*
   * --------------------------------------------------
   * Sync consumer deal counts when inquiries change
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!inquiries.length) return;

    const p = profileRef.current;
    if (p.role === "consumer" && Array.isArray(inquiries)) {
      const completedCount = inquiries.filter(
        (item) => item.status === "completed" || item.status === "resolved",
      ).length;
      const cancelledCount = inquiries.filter(
        (item) => item.status === "cancelled",
      ).length;
      const totalCount = inquiries.length;

      if (
        p.completedDeals !== completedCount ||
        p.totalDeals !== totalCount ||
        p.cancelledDeals !== cancelledCount
      ) {
        updateUser(p.uid, {
          completedDeals: completedCount,
          totalDeals: totalCount,
          cancelledDeals: cancelledCount,
        }).catch(() => {});
      }
    }
  }, [inquiries]);

  /*
   * --------------------------------------------------
   * Load related & legacy inquiry data
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!inquiries.length) {
      setInquiryData({});
      return;
    }

    let cancelled = false;

    async function loadRelatedData() {
      const isConsumer = profile?.role === "consumer";
      const farmerIds = isConsumer
        ? [...new Set(inquiries.map((i) => i.farmerId).filter(Boolean))]
        : [];

      const legacyInquiries = inquiries.filter(
        (inquiry) => !inquiry.productSnapshot || !inquiry.consumerSnapshot,
      );

      try {
        const [farmerProfiles, legacyResults] = await Promise.all([
          Promise.all(
            farmerIds.map(async (fId) => {
              if (farmerCacheRef.current.has(fId)) {
                return [fId, farmerCacheRef.current.get(fId)];
              }
              try {
                const farmer = await getFarmerById(fId);
                if (farmer) farmerCacheRef.current.set(fId, farmer);
                return [fId, farmer];
              } catch {
                return [fId, null];
              }
            }),
          ),
          Promise.all(
            legacyInquiries.map(async (inquiry) => {
              try {
                const [product, consumer] = await Promise.all([
                  !inquiry.productSnapshot
                    ? getProductById(inquiry.productId)
                    : null,
                  !inquiry.consumerSnapshot
                    ? getUserProfile(inquiry.consumerId)
                    : null,
                ]);
                return { id: inquiry.id, product, consumer };
              } catch {
                return { id: inquiry.id, product: null, consumer: null };
              }
            }),
          ),
        ]);

        if (cancelled) return;

        const farmerMap = new Map(farmerProfiles.filter(([, f]) => f != null));
        const legacyMap = new Map(legacyResults.map((r) => [r.id, r]));

        const mapped = {};
        inquiries.forEach((inquiry) => {
          const legacy = legacyMap.get(inquiry.id);
          const farmer = farmerMap.get(inquiry.farmerId);

          mapped[inquiry.id] = {
            product: legacy?.product ?? null,
            consumer: legacy?.consumer ?? null,
            farmer: farmer
              ? {
                  uid: farmer.uid,
                  fullname: farmer.fullname,
                  username: farmer.username,
                  profilePicture: farmer.profilePicture,
                  verified: farmer.verified === true,
                }
              : null,
          };
        });

        setInquiryData(mapped);
      } catch (error) {
        console.error("Failed to load inquiry related data:", error);
      }
    }

    loadRelatedData();

    return () => {
      cancelled = true;
    };
  }, [inquiries, profile?.role]);

  /*
   * --------------------------------------------------
   * Filter inquiries
   * --------------------------------------------------
   */

  const filteredInquiries = useMemo(() => {
    if (activeTab === "all") {
      return inquiries;
    }

    return inquiries.filter(
      (inquiry) => normalizeStatus(inquiry.status) === activeTab,
    );
  }, [inquiries, activeTab]);

  /*
   * --------------------------------------------------
   * Generic status change
   * --------------------------------------------------
   */

  async function changeStatus(inquiryId, status) {
    if (updatingId) {
      return;
    }

    try {
      setUpdatingId(inquiryId);

      if (status === "ongoing") {
        await apiStartTransaction(inquiryId);
        showToast.success("Inquiry marked as ongoing.");
      } else if (status === "cancelled") {
        await apiCancelInquiry(inquiryId);
        showToast.success("Inquiry cancelled.");
      }
    } catch (error) {
      console.error(error);
      showToast.error(error.message || "Failed to update inquiry.");
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * Consumer requests transaction completion
   * --------------------------------------------------
   */

  async function requestCompletion(inquiryId) {
    if (updatingId) {
      return false;
    }

    try {
      setUpdatingId(inquiryId);

      await apiRequestCompletion(inquiryId);

      showToast.success("Transaction completion requested.");

      return true;
    } catch (error) {
      console.error(error);

      showToast.error(
        error.message || "Failed to request transaction completion.",
      );

      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * Consumer submits transaction proof
   * --------------------------------------------------
   */

  async function submitProof(inquiryId, proof) {
    if (updatingId) {
      return false;
    }

    try {
      setUpdatingId(inquiryId);

      await apiSubmitProof(inquiryId, proof);

      showToast.success("Proof submitted. Waiting for farmer confirmation.");

      return true;
    } catch (error) {
      console.error(error);

      showToast.error(error.message || "Failed to submit transaction proof.");

      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * Farmer confirms transaction
   * --------------------------------------------------
   */

  async function confirmProof(inquiryId) {
    if (updatingId) {
      return false;
    }

    try {
      setUpdatingId(inquiryId);

      await apiConfirmProof(inquiryId);

      showToast.success("Transaction completed successfully.");

      return true;
    } catch (error) {
      console.error(error);

      showToast.error(error.message || "Failed to confirm transaction.");

      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * Farmer rejects transaction proof
   * --------------------------------------------------
   */

  async function rejectProof(inquiryId) {
    if (updatingId) {
      return false;
    }

    try {
      setUpdatingId(inquiryId);

      await apiRejectProof(inquiryId);

      showToast.success(
        "Proof rejected. The consumer can upload another photo.",
      );

      return true;
    } catch (error) {
      console.error(error);

      showToast.error(error.message || "Failed to reject transaction proof.");

      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * Cancel inquiry
   * --------------------------------------------------
   */

  async function handleCancel(inquiryId) {
    if (updatingId) {
      return false;
    }

    try {
      setUpdatingId(inquiryId);

      await apiCancelInquiry(inquiryId);

      showToast.success("Inquiry cancelled.");

      return true;
    } catch (error) {
      console.error(error);

      showToast.error(error.message || "Failed to cancel inquiry.");

      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  return {
    inquiries,
    filteredInquiries,
    inquiryData,

    loading,
    error,
    updatingId,

    activeTab,
    setActiveTab,

    changeStatus,

    requestCompletion,
    submitProof,
    confirmProof,
    rejectProof,
    cancelInquiry: handleCancel,
  };
}

function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status;
}
