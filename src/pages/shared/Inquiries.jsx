import { useAuth } from "../../context/AuthContext";

import useInquiries from "../../hooks/useInquiries";

import InquirySkeleton from "../../components/shared/inquiries/InquirySkeleton";
import InquiryTabs from "../../components/shared/inquiries/InquiryTabs";
import InquiryTable from "../../components/shared/inquiries/InquiryTable";

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
    <main className="flex-1 p-4 md:p-6 pb-18 md:pb-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1B4332]">Inquiry Records</h2>

        <p className="text-sm text-gray-500">
          Manage and track your product inquiries
        </p>
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
        />
      )}
    </main>
  );
}
