export default function TransactionProofSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="h-10 w-full bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
