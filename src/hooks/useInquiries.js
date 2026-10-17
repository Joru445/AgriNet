import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  apiGetInquiries,
  apiStartTransaction,
  apiRequestCompletion,
  apiSubmitProof,
  apiConfirmProof,
  apiRejectProof,
  apiCancelInquiry,
  apiAdvancePreorder,
  apiAcceptPreorderAgreement,
} from "../services/inquiry.service";
import { accountCacheKey, getAccountCache, setAccountCache, accountCacheRequest, invalidateAccountCache } from "../utils/accountQueryCache";

import { getProductById } from "../services/product.service";
import { getUserProfile } from "../services/user.service";
import { getFarmerById } from "../services/farmer.service";

import { showToast } from "../utils/toast";

const INQUIRY_GROUP_IDS = new Set(["requests", "confirmed", "preparation", "in-progress", "completed", "cancelled"]);

export default function useInquiries() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGroup = searchParams.get("group");
  const activeTab = INQUIRY_GROUP_IDS.has(requestedGroup) ? requestedGroup : "requests";
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  const [inquiryData, setInquiryData] = useState({});

  const [updatingId, setUpdatingId] = useState(null);
  const farmerCacheRef = useRef(new Map());

  const profileRef = useRef(profile);

  const loadGroup = useCallback(async ({ append = false, force = false, initial = false } = {}) => {
    if (!profile?.uid || !profile?.role) return;
    const key = accountCacheKey(profile.uid, "inquiries", activeTab);
    const cached = !force && getAccountCache(key, 2 * 60 * 1000);
    if (!append && cached) {
      setInquiries(cached.items || []); setCursor(cached.cursor || null); setHasMore(Boolean(cached.hasMore)); setLoading(false); return;
    }
    // Revalidation keeps the current group visible; only an empty initial
    // group needs row skeletons.
    setLoading(!append && (initial || inquiries.length === 0)); setError(null);
    try {
      const result = await accountCacheRequest(`${key}:${append ? (cursor || "first") : "first"}`, () => apiGetInquiries({ group: activeTab, cursor: append ? cursor : null, limit: 12 }));
      const nextItems = append ? [...inquiries, ...(result.items || [])] : (result.items || []);
      const value = { items: nextItems, cursor: result.cursor, hasMore: result.hasMore };
      setAccountCache(key, value); setInquiries(nextItems); setCursor(result.cursor); setHasMore(result.hasMore);
    } catch (loadError) { setError(loadError); }
    finally { setLoading(false); }
  }, [profile?.uid, profile?.role, activeTab, cursor, inquiries]);

  useEffect(() => {
    setInquiries([]); setCursor(null); setHasMore(false);
    loadGroup({ force: false, initial: true });
  // loadGroup intentionally tracks the selected group and UID.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, profile?.role, activeTab]);

  const setActiveTab = useCallback((group) => {
    setSearchParams(group === "requests" ? {} : { group }, { replace: false });
  }, [setSearchParams]);

  const refresh = useCallback(() => {
    if (!profile?.uid) return Promise.resolve();
    invalidateAccountCache(accountCacheKey(profile.uid, "inquiries", activeTab));
    invalidateAccountCache(accountCacheKey(profile.uid, "inquiry-group-counts"));
    window.dispatchEvent(new CustomEvent("agrinet:inquiry-counts-invalidated", { detail: { uid: profile.uid } }));
    return loadGroup({ force: true });
  }, [profile?.uid, activeTab, loadGroup]);

  const loadMore = useCallback(() => loadGroup({ append: true }), [loadGroup]);

  useEffect(() => {
    profileRef.current = profile;
  });

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

      const reservedPreorders = inquiries.filter(
        (inquiry) =>
          inquiry.type === "preorder" &&
          normalizeStatus(inquiry.status) === "reserved" &&
          inquiry.productId,
      );

      try {
        const [farmerProfiles, legacyResults, liveProducts] = await Promise.all([
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
          Promise.all(
            reservedPreorders.map(async (inquiry) => {
              try {
                const product = await getProductById(inquiry.productId);
                return { id: inquiry.id, product, consumer: null };
              } catch {
                return { id: inquiry.id, product: null, consumer: null };
              }
            }),
          ),
        ]);

        if (cancelled) return;

        const farmerMap = new Map(farmerProfiles.filter(([, f]) => f != null));
        const legacyMap = new Map(legacyResults.map((r) => [r.id, r]));
        const liveProductMap = new Map(liveProducts.map((r) => [r.id, r]));

        const mapped = {};
        inquiries.forEach((inquiry) => {
          const legacy = legacyMap.get(inquiry.id);
          const live = liveProductMap.get(inquiry.id);
          const farmer = farmerMap.get(inquiry.farmerId);

          mapped[inquiry.id] = {
            product: live?.product ?? legacy?.product ?? null,
            consumer: legacy?.consumer ?? null,
            farmer: farmer
              ? {
                  uid: farmer.uid,
                  fullname: farmer.fullname,
                  username: farmer.username,
                  profilePicture: farmer.profilePicture,
                  verificationStatus: farmer.verificationStatus || (farmer.verified === true ? "approved" : "not_applied"),
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
    return inquiries;
  }, [inquiries]);

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
      } else if (status === "preparing" || status === "ready") {
        await apiAdvancePreorder(inquiryId, status);
        showToast.success(status === "ready" ? "Your customer's order is ready." : "Order marked as preparing.");
      } else if (status === "confirmed") {
        await apiAcceptPreorderAgreement(inquiryId);
        showToast.success("Pre-order terms accepted. The seller can begin preparation.");
      } else if (status === "cancelled") {
        await apiCancelInquiry(inquiryId);
        showToast.success("Inquiry cancelled.");
      }
      await refresh();
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
      await refresh();

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
      await refresh();

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
      await refresh();

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
      await refresh();

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
      await refresh();

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
    hasMore,
    loadMore,
    refresh,

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
