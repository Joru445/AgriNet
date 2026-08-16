import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  subscribeUserInquiries,
  updateInquiryStatus,
  requestTransactionCompletion,
  submitTransactionProof,
  confirmTransactionProof,
  rejectTransactionProof,
  cancelInquiry,
} from "../services/inquiry.service";

import { getProductById } from "../services/product.service";
import { getUserProfile } from "../services/user.service";

import { showToast } from "../utils/toast";

export default function useInquiries() {
  const { profile, loading: authLoading } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [inquiryData, setInquiryData] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  /*
   * --------------------------------------------------
   * Subscribe to user's inquiries
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!profile?.uid || !profile?.role) {
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeUserInquiries(
      profile.uid,
      profile.role,
      (data) => {
        setInquiries(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load inquiries:", error);

        setInquiries([]);
        setLoading(false);

        showToast.error(error.message || "Failed to load inquiries.");
      },
    );

    return unsubscribe;
  }, [profile?.uid, profile?.role]);

  /*
   * --------------------------------------------------
   * Load legacy inquiry data
   * --------------------------------------------------
   */

  useEffect(() => {
    const legacyInquiries = inquiries.filter(
      (inquiry) =>
        !inquiry.productSnapshot ||
        !inquiry.consumerSnapshot ||
        !inquiry.farmerSnapshot,
    );

    if (!legacyInquiries.length) {
      setInquiryData({});
      return;
    }

    let cancelled = false;

    async function loadRelatedData() {
      const results = await Promise.all(
        legacyInquiries.map(async (inquiry) => {
          try {
            const [product, consumer] = await Promise.all([
              getProductById(inquiry.productId),
              getUserProfile(inquiry.consumerId),
            ]);

            return {
              id: inquiry.id,
              product,
              consumer,
            };
          } catch (error) {
            console.error("Failed to load inquiry data:", error);

            return {
              id: inquiry.id,
              product: null,
              consumer: null,
            };
          }
        }),
      );

      if (cancelled) {
        return;
      }

      const mapped = {};

      results.forEach((item) => {
        mapped[item.id] = item;
      });

      setInquiryData(mapped);
    }

    loadRelatedData();

    return () => {
      cancelled = true;
    };
  }, [inquiries]);

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

      await updateInquiryStatus({
        inquiryId,
        status,
        actor: profile,
      });

      if (status === "ongoing") {
        showToast.success("Inquiry marked as ongoing.");
      }

      if (status === "cancelled") {
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

      await requestTransactionCompletion({
        inquiryId,
        consumerId: profile.uid,
      });

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

      await submitTransactionProof({
        inquiryId,
        consumerId: profile.uid,
        proof,
      });

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

      await confirmTransactionProof({
        inquiryId,
        farmerId: profile.uid,
      });

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

      await rejectTransactionProof({
        inquiryId,
        farmerId: profile.uid,
      });

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

      await cancelInquiry({
        inquiryId,
        actor: profile,
      });

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
