import ReportTableRow from "./ReportTableRow";

export default function ReportTable({ reports, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--agri-border)] bg-[var(--agri-hover)]/90">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                Report
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                Reported By
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                Type
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                Date & Time
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
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
          <i className="ri-file-warning-line text-4xl text-[var(--agri-text-muted)]" />

          <p className="mt-3 text-sm font-medium text-[var(--agri-text-secondary)]">
            No reports found
          </p>

          <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
