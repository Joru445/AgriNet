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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Product
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Consumer
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Date
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
