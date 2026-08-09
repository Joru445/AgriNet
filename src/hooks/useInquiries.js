import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  subscribeUserInquiries,
  updateInquiryStatus,
} from "../services/inquiry.service";

import { getProductById } from "../services/product.service";
import { getUserProfile } from "../services/user.service";

import { showToast } from "../utils/toast";

export default function useInquiries() {
  const { profile } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [inquiryData, setInquiryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  /*
   * Subscribe to user's inquiries
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
    );

    return unsubscribe;
  }, [profile?.uid, profile?.role]);

  /*
   * Load related products and consumers
   */
  useEffect(() => {
    if (!inquiries.length) {
      setInquiryData({});
      return;
    }

    let cancelled = false;

    async function loadRelatedData() {
      const results = await Promise.all(
        inquiries.map(async (inquiry) => {
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

      if (cancelled) return;

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
   * Filter inquiries
   */
  const filteredInquiries = useMemo(() => {
    if (activeTab === "all") {
      return inquiries;
    }

    return inquiries.filter(
      (inquiry) => getDisplayStatus(inquiry.status) === activeTab,
    );
  }, [inquiries, activeTab]);

  /*
   * Update inquiry status
   */
  async function changeStatus(inquiryId, status) {
    if (updatingId) return;

    try {
      setUpdatingId(inquiryId);

      await updateInquiryStatus(inquiryId, status);

      if (status === "ongoing") {
        showToast.success("Inquiry marked as ongoing.");
      }

      if (status === "resolved") {
        showToast.success("Inquiry marked as resolved.");
      }
    } catch (error) {
      console.error(error);

      showToast.error(error.message || "Failed to update inquiry.");
    } finally {
      setUpdatingId(null);
    }
  }

  return {
    inquiries,
    filteredInquiries,
    inquiryData,

    loading,
    updatingId,

    activeTab,
    setActiveTab,

    changeStatus,
  };
}

function getDisplayStatus(status) {
  if (status === "accepted") {
    return "pending";
  }

  return status;
}
