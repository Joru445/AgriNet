export default function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  sortBy = "default",
  onSortByChange,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4.5 shadow-md shadow-black/5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--agri-text-muted)] text-base" />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer"
        >
          <option value="default">Sort: Default</option>
          <option value="name-asc">Alphabetical (A - Z)</option>
          <option value="name-desc">Alphabetical (Z - A)</option>
        </select>

        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="consumer">Consumers</option>
          <option value="farmer">Farmers</option>
          <option value="admin">Admins</option>
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>
  );
}
