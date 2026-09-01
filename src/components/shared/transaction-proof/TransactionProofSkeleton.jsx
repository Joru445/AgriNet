export default function TransactionProofSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-5">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-xl bg-[var(--agri-hover)]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-[var(--agri-hover)] rounded" />
            <div className="h-4 w-32 bg-[var(--agri-hover)] rounded" />
            <div className="h-4 w-24 bg-[var(--agri-hover)] rounded" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-5">
        <div className="h-10 w-full bg-[var(--agri-hover)] rounded-xl" />
      </div>
    </div>
  );
}
