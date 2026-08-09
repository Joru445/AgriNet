import { useAuth } from "../../context/AuthContext";

import useInquiries from "../../hooks/useInquiries";

import InquiryTabs from "../../components/inquiries/InquiryTabs";
import InquiryTable from "../../components/inquiries/InquiryTable";

export default function Inquiries() {
  const { profile } = useAuth();
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
    <main className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1B4332]">Inquiry Records</h2>

        <p className="text-sm text-gray-500">
          Manage and track your product inquiries
        </p>
      </div>

      <InquiryTabs activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Loading inquiries...</p>
        </div>
      ) : (
        <InquiryTable
          inquiries={filteredInquiries}
          inquiryData={inquiryData}
          userRole={profile?.role}
          updatingId={updatingId}
          onStatusChange={changeStatus}
        />
      )}
    </main>
  );
}
