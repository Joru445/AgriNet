import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getUserProfile,
  searchUsers,
  subscribeUsers,
} from "../services/user.service";

import { setUserSuspension } from "../services/admin.service";

import {
  getFarmerById,
  getFarmers,
  verifyFarmer,
  unverifyFarmer,
} from "../services/farmer.service";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  /*
   * ============================================================
   * SUBSCRIBE USERS
   * ============================================================
   */

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeUsers(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load users:", err);

        setError(err?.message || "Failed to load users.");

        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  /*
   * ============================================================
   * LOAD FARMERS
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadFarmers() {
      try {
        const data = await getFarmers();

        if (mounted) {
          setFarmers(data);
        }
      } catch (err) {
        console.error("Failed to load farmers:", err);

        if (mounted) {
          setError((current) => current || "Failed to load farmers.");
        }
      }
    }

    loadFarmers();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * GET USER
   * ============================================================
   */

  const getUser = useCallback(async (uid) => {
    if (!uid) {
      throw new Error("User UID is required.");
    }

    return getUserProfile(uid);
  }, []);

  /*
   * ============================================================
   * SEARCH USERS
   * ============================================================
   */

  const findUsers = useCallback(async (search, currentUserId) => {
    if (!search?.trim()) {
      return [];
    }

    return searchUsers(search, currentUserId);
  }, []);

  /*
   * ============================================================
   * GET FARMER PROFILE
   * ============================================================
   */

  const getFarmer = useCallback(async (uid) => {
    if (!uid) {
      throw new Error("Farmer UID is required.");
    }

    return getFarmerById(uid);
  }, []);

  /*
   * ============================================================
   * SUSPEND / ACTIVATE USER
   * ============================================================
   *
   * Account suspension is handled through Firebase Auth
   * using the Cloud Function.
   *
   * This does NOT affect farmer verification.
   */

  const changeStatus = useCallback(async (uid, status) => {
    if (!uid) {
      throw new Error("User UID is required.");
    }

    if (status !== "active" && status !== "suspended") {
      throw new Error("Invalid account status.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const result = await setUserSuspension(uid, status);

      /*
       * Update the local user immediately.
       * The Firestore listener should eventually
       * provide the authoritative value as well.
       */
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.uid === uid
            ? {
                ...user,
                status,
              }
            : user,
        ),
      );

      return result;
    } catch (err) {
      console.error("Failed to change account status:", err);

      setActionError(err?.message || "Failed to change account status.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * VERIFY FARMER
   * ============================================================
   */

  const verifyUserFarmer = useCallback(async (farmerUid, adminUid) => {
    if (!farmerUid) {
      throw new Error("Farmer UID is required.");
    }

    if (!adminUid) {
      throw new Error("Admin UID is required.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const result = await verifyFarmer(farmerUid, adminUid);

      /*
       * Immediately update the local farmer state.
       */
      setFarmers((currentFarmers) =>
        currentFarmers.map((farmer) =>
          farmer.uid === farmerUid
            ? {
                ...farmer,
                verified: true,
              }
            : farmer,
        ),
      );

      return result;
    } catch (err) {
      console.error("Failed to verify farmer:", err);

      setActionError(err?.message || "Failed to verify farmer.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * UNVERIFY FARMER
   * ============================================================
   */

  const unverifyUserFarmer = useCallback(async (farmerUid, adminUid) => {
    if (!farmerUid) {
      throw new Error("Farmer UID is required.");
    }

    if (!adminUid) {
      throw new Error("Admin UID is required.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const result = await unverifyFarmer(farmerUid, adminUid);

      /*
       * Immediately update the local farmer state.
       */
      setFarmers((currentFarmers) =>
        currentFarmers.map((farmer) =>
          farmer.uid === farmerUid
            ? {
                ...farmer,
                verified: false,
              }
            : farmer,
        ),
      );

      return result;
    } catch (err) {
      console.error("Failed to revoke farmer verification:", err);

      setActionError(err?.message || "Failed to revoke farmer verification.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * USER STATISTICS
   * ============================================================
   */

  const stats = useMemo(() => {
    const consumers = users.filter((user) => user.role === "consumer").length;

    const farmersCount = users.filter((user) => user.role === "farmer").length;

    const admins = users.filter((user) => user.role === "admin").length;

    const suspended = users.filter(
      (user) => user.status === "suspended",
    ).length;

    const active = users.length - suspended;

    const verifiedFarmers = farmers.filter(
      (farmer) => farmer.verified === true,
    ).length;

    const unverifiedFarmers = farmers.filter(
      (farmer) => farmer.verified !== true,
    ).length;

    return {
      total: users.length,

      consumers,

      farmers: farmersCount,

      admins,

      active,

      suspended,

      verifiedFarmers,

      unverifiedFarmers,
    };
  }, [users, farmers]);

  /*
   * ============================================================
   * CLEAR ACTION ERROR
   * ============================================================
   */

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  /*
   * ============================================================
   * RETURN
   * ============================================================
   */

  return {
    users,
    farmers,

    loading,
    error,

    actionLoading,
    actionError,

    stats,

    getUser,
    findUsers,
    getFarmer,

    changeStatus,

    verifyUserFarmer,
    unverifyUserFarmer,

    clearActionError,
  };
}
