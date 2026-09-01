export default function ProfileSkeleton() {
  return (
    <main className="flex-1 mx-auto max-w-6xl animate-pulse bg-[var(--agri-card)]">
      {/* Cover */}
      <div>
        <div
          className="
            h-56
            bg-[var(--agri-hover)]
            sm:h-72
            md:h-80
            lg:h-95
            sm:rounded-b-2xl
          "
        />
      </div>

      {/* Profile Information */}
      <div
        className="
          relative
          -mt-8
          rounded-t-3xl
          bg-[var(--agri-card)]
          px-4
          sm:mt-0
          sm:rounded-none
          sm:px-6
        "
      >
        <div>
          {/* Avatar + Information */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="relative -mt-8 shrink-0 sm:-mt-20">
              <div
                className="
                  h-32 w-32
                  rounded-full
                  border-4 border-[var(--agri-card)]
                  bg-[var(--agri-hover)]
                  shadow-sm
                  sm:h-40 sm:w-40
                "
              />
            </div>

            {/* Profile Details */}
            <div className="min-w-0 pb-4 pt-3 sm:pb-5">
              <div className="h-7 w-40 rounded bg-[var(--agri-hover)] sm:h-9 sm:w-56" />

              <div className="mt-2 h-4 w-20 rounded bg-[var(--agri-hover)]/60" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 py-4 sm:justify-end">
            <div className="h-10 w-24 rounded-lg bg-[var(--agri-hover)]" />
            <div className="h-10 w-24 rounded-lg bg-[var(--agri-hover)]/60" />
          </div>

          {/* Form */}
          <div className="border-t border-[var(--agri-border-subtle)] pt-6 pb-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <div className="mb-2 h-4 w-24 rounded bg-[var(--agri-hover)]" />
                  <div className="h-11 w-full rounded-xl bg-[var(--agri-hover)]" />
                </div>
              ))}
            </div>

            {/* About */}
            <div className="mt-6">
              <div className="mb-2 h-4 w-20 rounded bg-[var(--agri-hover)]" />
              <div className="h-20 w-full rounded-xl bg-[var(--agri-hover)]" />
            </div>

            {/* Address */}
            <div className="mt-6">
              <div className="mb-2 h-4 w-20 rounded bg-[var(--agri-hover)]" />
              <div className="h-32 w-full rounded-xl bg-[var(--agri-hover)]" />
            </div>
          </div>

          {/* Farmer Section */}
          <div className="border-t border-[var(--agri-border)] py-8">
            <div className="mb-6 h-6 w-44 rounded bg-[var(--agri-hover)]" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Farm Name */}
              <div>
                <div className="mb-2 h-4 w-24 rounded bg-[var(--agri-hover)]" />
                <div className="h-11 w-full rounded-xl bg-[var(--agri-hover)]" />
              </div>

              {/* Rating */}
              <div>
                <div className="mb-2 h-4 w-20 rounded bg-[var(--agri-hover)]" />
                <div className="h-6 w-32 rounded bg-[var(--agri-hover)]" />
              </div>
            </div>

            {/* Location */}
            <div className="mt-6">
              <div className="mb-2 h-4 w-36 rounded bg-[var(--agri-hover)]" />
              <div className="h-28 w-full rounded-xl bg-[var(--agri-hover)]" />
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-5 text-center"
                >
                  <div className="mx-auto h-8 w-12 rounded bg-[var(--agri-hover)]" />
                  <div className="mx-auto mt-3 h-4 w-20 rounded bg-[var(--agri-hover)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
