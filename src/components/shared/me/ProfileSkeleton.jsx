export default function ProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 md:px-6 pb-18 md:pb-8 animate-pulse">
      <div className="space-y-6">
        {/* Hero card */}
        <div className="overflow-hidden rounded-3xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-md">
          {/* Cover */}
          <div className="h-44 bg-[var(--agri-hover)] sm:h-60 md:h-72 lg:h-80" />

          {/* Avatar + identity */}
          <div className="px-4 pb-6 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative -mt-14 sm:-mt-16 self-start">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-[var(--agri-card)] bg-[var(--agri-hover)] shadow-lg" />
              </div>

              <div className="min-w-0 flex-1 pt-2">
                <div className="h-7 w-44 rounded bg-[var(--agri-hover)] sm:h-8 sm:w-56" />
                <div className="mt-2.5 h-4 w-24 rounded bg-[var(--agri-hover)]/60" />
                <div className="mt-3 h-10 w-3/4 max-w-sm rounded bg-[var(--agri-hover)]/60" />
              </div>

              <div className="shrink-0 self-end">
                <div className="h-10 w-28 rounded-xl bg-[var(--agri-hover)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal info card */}
            <div className="overflow-hidden rounded-3xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
              <div className="border-b border-[var(--agri-border-subtle)] px-5 py-4">
                <div className="h-5 w-40 rounded bg-[var(--agri-hover)]" />
              </div>
              <div className="divide-y divide-[var(--agri-border-subtle)]">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 px-5 py-4">
                    <div className="h-9 w-9 rounded-xl bg-[var(--agri-hover)]" />
                    <div className="flex-1">
                      <div className="h-3 w-20 rounded bg-[var(--agri-hover)]/60" />
                      <div className="mt-1.5 h-4 w-40 rounded bg-[var(--agri-hover)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farmer card */}
            <div className="overflow-hidden rounded-3xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
              <div className="border-b border-[var(--agri-border-subtle)] px-5 py-4">
                <div className="h-5 w-44 rounded bg-[var(--agri-hover)]" />
              </div>
              <div className="space-y-6 p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 rounded-2xl bg-[var(--agri-hover)]" />
                  <div className="h-16 rounded-2xl bg-[var(--agri-hover)]" />
                </div>

                <div className="h-20 w-full rounded-2xl bg-[var(--agri-hover)]" />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-4"
                    >
                      <div className="mx-auto h-5 w-5 rounded-full bg-[var(--agri-hover)]" />
                      <div className="mx-auto mt-2 h-7 w-12 rounded bg-[var(--agri-hover)]" />
                      <div className="mx-auto mt-2 h-3 w-16 rounded bg-[var(--agri-hover)]/60" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
              <div className="border-b border-[var(--agri-border-subtle)] px-5 py-4">
                <div className="h-5 w-32 rounded bg-[var(--agri-hover)]" />
              </div>
              <div className="divide-y divide-[var(--agri-border-subtle)]">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 px-5 py-4">
                    <div className="h-10 w-10 rounded-xl bg-[var(--agri-hover)]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-[var(--agri-hover)]" />
                      <div className="mt-1.5 h-3 w-40 rounded bg-[var(--agri-hover)]/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}