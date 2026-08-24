import { useMemo, useState, useEffect, useRef } from "react";

import UserTableRow from "./UserTableRow";

export default function UserTable({
  users = [],
  farmers = [],
  currentUserId,
  onView,
  onEdit,
}) {
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
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-lg shadow-black/5">
      {/* Top Green Sliding/Scroll Bar for Mobile */}
      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="overflow-x-auto border-b border-gray-100 bg-gray-50/50 block md:hidden"
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
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                User
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Email
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Role
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Actions
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 text-gray-400 mb-3">
            <i className="ri-user-search-line text-2xl" />
          </div>

          <p className="text-base font-bold text-gray-800">
            No users found
          </p>

          <p className="mt-1 text-xs text-gray-500 font-medium">
            Try adjusting your search query or role/status filters.
          </p>
        </div>
      )}

      {/* Pagination in Bottom Left Side */}
      {users.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-3.5 bg-gray-50/70">
          <div className="flex items-center gap-1.5">
            {/* Previous Page Arrow */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              title="Previous Page"
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
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 shadow-2xs"
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
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              title="Next Page"
            >
              <i className="ri-arrow-right-s-line text-base font-bold" />
            </button>
          </div>

          <div className="text-xs font-semibold text-gray-600">
            Showing{" "}
            <span className="text-gray-900 font-bold">
              {paginatedUsers.length}
            </span>{" "}
            out of{" "}
            <span className="text-gray-900 font-bold">{users.length}</span>{" "}
            total users
          </div>
        </div>
      )}
    </div>
  );
}
