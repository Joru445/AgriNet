import { useMemo, useState, useEffect, useRef } from "react";
import { useLanguage } from "../../../context/LanguageContext";

import UserTableRow from "./UserTableRow";

export default function UserTable({
  users = [],
  farmers = [],
  currentUserId,
  onView,
  onEdit,
}) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const tableScrollRef = useRef(null);
  const topScrollRef = useRef(null);
  const isSyncingTop = useRef(false);
  const isSyncingTable = useRef(false);

  const handleTopScroll = () => {
    if (isSyncingTop.current) {
      isSyncingTop.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTable.current = true;
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (isSyncingTable.current) {
      isSyncingTable.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTop.current = true;
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const totalPages = Math.ceil(users.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [users.length, totalPages, currentPage]);

  const maxVisiblePages = 5;
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages, currentPage]);

  const farmerMap = useMemo(() => {
    return Object.fromEntries(farmers.map((farmer) => [farmer.uid, farmer]));
  }, [farmers]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return users.slice(startIndex, startIndex + pageSize);
  }, [users, currentPage, pageSize]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-lg shadow-black/5">
      {/* Top Green Sliding/Scroll Bar for Mobile */}
      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="overflow-x-auto border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 block md:hidden"
      >
        <div className="h-1.5 min-w-200" />
      </div>

      <div
        ref={tableScrollRef}
        onScroll={handleTableScroll}
        className="overflow-x-auto max-md:scrollbar-none"
      >
        <table className="w-full min-w-200">
          <thead>
            <tr className="border-b border-[var(--agri-border)] bg-[var(--agri-hover)]/80">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                {t("adminUser.user")}
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                {t("adminUser.email")}
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                {t("adminUser.role")}
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                {t("adminUser.status")}
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                {t("adminUser.actions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedUsers.map((user) => (
              <UserTableRow
                key={user.uid}
                user={user}
                currentUserId={currentUserId}
                farmer={farmerMap[user.uid]}
                onView={onView}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--agri-hover)] border border-[var(--agri-border)] text-[var(--agri-text-muted)] mb-3">
            <i className="ri-user-search-line text-2xl" />
          </div>

          <p className="text-base font-bold text-[var(--agri-text)]">
            {t("adminUser.noUsersFound")}
          </p>

          <p className="mt-1 text-xs text-[var(--agri-text-muted)] font-medium">
            {t("adminUser.noUsersHint")}
          </p>
        </div>
      )}

      {/* Pagination in Bottom Left Side */}
      {users.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--agri-border)] px-5 py-3.5 bg-[var(--agri-hover)]/70">
          <div className="flex items-center gap-1.5">
            {/* Previous Page Arrow */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] disabled:opacity-40 disabled:hover:bg-[var(--agri-card)] transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              title={t("adminUser.previousPage")}
            >
              <i className="ri-arrow-left-s-line text-base font-bold" />
            </button>

            {/* Max 5 Numbered Buttons */}
            {visiblePages.map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#2D6A4F] text-white shadow-xs"
                    : "border border-[var(--agri-border)] bg-[var(--agri-card)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] shadow-2xs"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Arrow */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] disabled:opacity-40 disabled:hover:bg-[var(--agri-card)] transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              title={t("adminUser.nextPage")}
            >
              <i className="ri-arrow-right-s-line text-base font-bold" />
            </button>
          </div>

          <div className="text-xs font-semibold text-[var(--agri-text-secondary)]">
            {t("adminUser.showingCount", { count: paginatedUsers.length, total: users.length })}
          </div>
        </div>
      )}
    </div>
  );
}
