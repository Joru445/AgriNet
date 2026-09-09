import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGetAuditLogs } from "../services/admin.service";

export default function useAdminActivity() {
  const [serverLogs, setServerLogs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiGetAuditLogs({
        page,
        limit: 20,
        action: action || undefined,
        targetType: targetType || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
      });

      setServerLogs(result.logs);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err?.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [page, action, targetType, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [action, targetType, dateFrom, dateTo]);

  // Search is applied client-side to the fetched page, so typing does not
  // trigger a server refetch per keystroke.
  const logs = useMemo(() => {
    if (!search || !search.trim()) {
      return serverLogs;
    }

    const keyword = search.trim().toLowerCase();
    return serverLogs.filter((log) => {
      const targetId = (log.targetId || "").toLowerCase();
      const adminId = (log.adminId || "").toLowerCase();
      const action = (log.action || "").toLowerCase();
      return targetId.includes(keyword) || adminId.includes(keyword) || action.includes(keyword);
    });
  }, [serverLogs, search]);

  return {
    logs,
    pagination,
    loading,
    error,

    search,
    setSearch,
    action,
    setAction,
    targetType,
    setTargetType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,

    fetchLogs,
  };
}
