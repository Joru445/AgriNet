import { useState, useCallback } from "react";

import useAdminTransactions from "../../hooks/useAdminTransactions";

import TransactionHeader from "../../components/admin/transactions/TransactionHeader";
import TransactionStats from "../../components/admin/transactions/TransactionStats";
import TransactionFilters from "../../components/admin/transactions/TransactionFilters";
import TransactionTable from "../../components/admin/transactions/TransactionTable";
import TransactionTableSkeleton from "../../components/admin/transactions/TransactionTableSkeleton";
import TransactionDetailModal from "../../components/admin/transactions/TransactionDetailModal";
import Alert from "../../components/ui/Alert";

export default function Transactions() {
  const {
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
    setPage,
  } = useAdminTransactions();

  const [selectedInquiryId, setSelectedInquiryId] = useState(null);

  const handleView = useCallback((inquiry) => {
    setSelectedInquiryId(inquiry.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedInquiryId(null);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, [setPage]);

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <TransactionHeader />

        <TransactionStats summary={summary} />

        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          type={type}
          onTypeChange={setType}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        {error && (
          <Alert variant="error" message={error} className="mb-6" />
        )}

        {loading ? (
          <TransactionTableSkeleton />
        ) : (
          <TransactionTable
            inquiries={inquiries}
            onView={handleView}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {selectedInquiryId && (
        <TransactionDetailModal
          inquiryId={selectedInquiryId}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
