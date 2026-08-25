import ReportTableRow from "./ReportTableRow";

export default function ReportTable({ reports, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/90">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Report
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Reported By
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Type
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Date & Time
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <ReportTableRow key={report.id} report={report} onView={onView} />
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && (
        <div className="px-6 py-12 text-center">
          <i className="ri-file-warning-line text-4xl text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            No reports found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
