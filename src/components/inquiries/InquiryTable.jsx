import InquiryRow from "./InquiryRow";

export default function InquiryTable({
  inquiries,
  inquiryData,
  userRole,
  updatingId,
  onStatusChange,
}) {
  if (!inquiries.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center">
        <p className="text-sm font-medium text-gray-600">No inquiries found</p>

        <p className="mt-1 text-xs text-gray-400">
          There are no inquiries in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inquiry) => {
        const data = inquiryData[inquiry.id];

        return (
          <InquiryRow
            key={inquiry.id}
            inquiry={inquiry}
            product={data?.product}
            consumer={data?.consumer}
            userRole={userRole}
            updating={updatingId === inquiry.id}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
}
