import { useCallback, useEffect, useMemo, useState } from "react";

import {
  apiGetAdminTransactions,
  apiGetAdminTransaction,
  apiGetTransactionSummary,
} from "../services/admin.service";

export default function useAdminTransactions() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiGetAdminTransactions({
        page,
        limit: 24,
        search,
        status,
        type,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      });

      setInquiries(result.inquiries);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load admin transactions:", err);
      setError(err?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setPage(1);
  }, [search, status, type, dateFrom, dateTo, sortBy, sortOrder]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await apiGetTransactionSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load transaction summary:", err);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const getTransaction = useCallback(async (inquiryId) => {
    try {
      const inquiry = await apiGetAdminTransaction(inquiryId);
      return inquiry;
    } catch (err) {
      console.error("Failed to load transaction:", err);
      throw err;
    }
  }, []);

  const stats = useMemo(() => {
    return {
      total: pagination.total,
      pending: inquiries.filter((i) => i.status === "pending").length,
      accepted: inquiries.filter((i) => i.status === "accepted").length,
      reserved: inquiries.filter((i) => i.status === "reserved").length,
      ongoing: inquiries.filter((i) => i.status === "ongoing").length,
      awaitingProof: inquiries.filter((i) => i.status === "awaiting_proof").length,
      proofSubmitted: inquiries.filter((i) => i.status === "proof_submitted").length,
      completed: inquiries.filter((i) => i.status === "completed").length,
      cancelled: inquiries.filter((i) => i.status === "cancelled").length,
      preorder: inquiries.filter((i) => i.type === "preorder").length,
      standard: inquiries.filter((i) => i.type !== "preorder").length,
    };
  }, [inquiries, pagination.total]);

  return {
    inquiries,
    pagination,
    loading,
    error,
    summary,

    search,
    setSearch,
    status,
    setStatus,
    type,
    setType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,

    stats,

    fetchTransactions,
    fetchSummary,
    getTransaction,
  };
}
