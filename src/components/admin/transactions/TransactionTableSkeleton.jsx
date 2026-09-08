export default function TransactionTableSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--agri-hover)]" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-[var(--agri-border-subtle)] last:border-0">
                {Array.from({ length: 7 }).map((_, colIdx) => (
                  <td key={colIdx} className="px-5 py-4">
                    <div className="h-4 animate-pulse rounded bg-[var(--agri-hover)]" style={{ width: colIdx === 0 ? "120px" : "80px" }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
