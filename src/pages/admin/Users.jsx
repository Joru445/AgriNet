import { useMemo, useState } from "react";

import useUsers from "../../hooks/useUsers";

import UserManagementHeader from "../../components/admin/users/UserManagementHeader";
import StatCard from "../../components/common/StatCard";
import UserFilters from "../../components/admin/users/UserFilters";
import UserTable from "../../components/admin/users/UserTable";
import UserDetailsModal from "../../components/admin/users/UserDetailsModal";
import UserEditModal from "../../components/admin/users/UserEditModal";

import { useAuth } from "../../context/AuthContext";

export default function Users() {
  const { user } = useAuth();

  const {
    users,
    farmers,

    loading,
    error,

    actionLoading,
    actionError,

    stats,

    changeStatus,
    getFarmer,
    verifyUserFarmer,
    unverifyUserFarmer,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingFarmer, setEditingFarmer] = useState(null);

  /*
   * ============================================================
   * FILTER & SORT USERS
   * ============================================================
   */

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.fullname?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword);

      const matchesRole = role === "all" || user.role === role;

      const userStatus = user.status || "active";

      const matchesStatus = status === "all" || userStatus === status;

      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortBy === "name-asc") {
      result.sort((a, b) =>
        (a.fullname || a.username || "").localeCompare(
          b.fullname || b.username || "",
        ),
      );
    } else if (sortBy === "name-desc") {
      result.sort((a, b) =>
        (b.fullname || b.username || "").localeCompare(
          a.fullname || a.username || "",
        ),
      );
    }

    return result;
  }, [users, search, role, status, sortBy]);

  /*
   * ============================================================
   * OPEN EDIT MODAL
   * ============================================================
   */

  async function handleEditUser(userToEdit) {
    setEditingUser(userToEdit);
    setEditingFarmer(null);

    if (userToEdit.role !== "farmer") {
      return;
    }

    try {
      const farmer = await getFarmer(userToEdit.uid);

      setEditingFarmer(farmer);
    } catch (error) {
      console.error("Failed to load farmer profile:", error);
    }
  }

  /*
   * ============================================================
   * SAVE USER
   * ============================================================
   */

  async function handleSaveUser(uid, data) {
    try {
      /*
       * Account status
       */
      if (data.status !== undefined) {
        await changeStatus(uid, data.status);
      }

      /*
       * Farmer verification
       *
       * Verification is stored in:
       *
       * farmers/{uid}.verified
       *
       * It is intentionally separate from
       * users/{uid}.status.
       */
      if (data.verified !== undefined) {
        if (editingUser?.role !== "farmer") {
          throw new Error("Only farmers can be verified.");
        }

        const adminUid = user?.uid;

        if (!adminUid) {
          throw new Error("Admin account not found.");
        }

        if (data.verified) {
          await verifyUserFarmer(uid, adminUid);
        } else {
          await unverifyUserFarmer(uid);
        }
      }

      setEditingUser(null);
      setEditingFarmer(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <UserManagementHeader />

        <div className="grid grid-cols-2 gap-4 pb-6">
          <StatCard
            title="Total Users"
            value={stats.total}
            description="Registered users"
          />

          <StatCard
            title="Farmers"
            value={stats.farmers}
            description="Registered farmers"
          />

          <StatCard
            title="Consumers"
            value={stats.consumers}
            description="Registered consumers"
          />

          <StatCard
            title="Suspended"
            value={stats.suspended}
            description="Suspended users"
          />
        </div>

        <UserFilters
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <i className="ri-error-warning-line text-lg" />

            <span>{error}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <i className="ri-error-warning-line text-lg" />

            <span>{actionError}</span>
          </div>
        )}

        {loading ? (
          <UserTableSkeleton />
        ) : (
          <UserTable
            users={filteredUsers}
            farmers={farmers}
            currentUserId={user?.uid}
            onView={setSelectedUser}
            onEdit={handleEditUser}
          />
        )}
      </div>

      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <UserEditModal
        user={editingUser}
        farmer={editingFarmer}
        loading={actionLoading}
        onClose={() => {
          setEditingUser(null);
          setEditingFarmer(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}

function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-gray-100 px-5 py-5"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-gray-200" />

              <div className="h-2 w-20 rounded bg-gray-100" />
            </div>

            <div className="h-3 w-32 rounded bg-gray-200" />

            <div className="h-6 w-20 rounded-full bg-gray-200" />

            <div className="h-6 w-16 rounded-full bg-gray-200" />

            <div className="h-8 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
