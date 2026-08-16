export default function TransactionProofSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-16 rounded bg-gray-200" />

        <div className="mt-4 h-7 w-40 rounded bg-gray-200" />

        <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex flex-col sm:flex-row">
          <div className="h-48 w-full bg-gray-200 sm:w-48" />

          <div className="flex-1 p-5">
            <div className="h-3 w-16 rounded bg-gray-200" />

            <div className="mt-2 h-6 w-40 rounded bg-gray-200" />

            <div className="mt-5 h-10 w-full rounded bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="mt-5 h-64 rounded-2xl bg-gray-200" />
    </div>
  );
}
