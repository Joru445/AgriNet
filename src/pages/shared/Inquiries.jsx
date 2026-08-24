import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import useInquiries from "../../hooks/useInquiries";

import InquirySkeleton from "../../components/shared/inquiries/InquirySkeleton";
import InquiryTabs from "../../components/shared/inquiries/InquiryTabs";
import InquiryTable from "../../components/shared/inquiries/InquiryTable";

export default function Inquiries() {
  const { profile } = useAuth();
  const [view, setView] = useState("grid");

  const {
    filteredInquiries,
    inquiryData,
    loading,
    updatingId,

    activeTab,
    setActiveTab,

    changeStatus,
  } = useInquiries();

  return (
    <main className="flex-1 p-4 md:p-6 pb-18 md:pb-4">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Inquiry Records</h2>

          <p className="text-sm text-gray-500">
            Manage and track your product inquiries
          </p>
        </div>

        {/* View toggle — hidden on mobile */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-2xl p-1.5 shrink-0 border border-gray-200 shadow-2xs gap-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer ${
              view === "grid"
                ? "bg-white shadow-xs text-[#2D6A4F] font-bold ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 font-semibold"
            }`}
            title="Grid view"
          >
            <i className="ri-grid-line text-lg" />
            <span>Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setView("vertical")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer ${
              view === "vertical"
                ? "bg-white shadow-xs text-[#2D6A4F] font-bold ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 font-semibold"
            }`}
            title="Vertical list view"
          >
            <i className="ri-list-check text-lg" />
            <span>List</span>
          </button>
        </div>
      </div>

      <InquiryTabs activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <InquirySkeleton />
      ) : (
        <InquiryTable
          inquiries={filteredInquiries}
          inquiryData={inquiryData}
          userRole={profile?.role}
          updatingId={updatingId}
          onStatusChange={changeStatus}
          view={view}
        />
      )}
    </main>
  );
}
