import { useMemo, useState } from "react";

import useUsers from "../../hooks/useUsers";

import UserManagementHeader from "../../components/admin/users/UserManagementHeader";
import StatCard from "../../components/common/StatCard";
import UserFilters from "../../components/admin/users/UserFilters";
import UserTable from "../../components/admin/users/UserTable";
import UserTableSkeleton from "../../components/admin/users/UserTableSkeleton";
import UserDetailsModal from "../../components/admin/users/UserDetailsModal";
import UserEditModal from "../../components/admin/users/UserEditModal";
import { InlineError } from "../../components/ui/ErrorState";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function Users() {
  const { user } = useAuth();
  const { t } = useLanguage();

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
          await unverifyUserFarmer(uid, adminUid);
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
            title={t("admin.totalUsers")}
            value={stats.total}
            description={t("admin.registeredUsers")}
          />

          <StatCard
            title={t("admin.farmers")}
            value={stats.farmers}
            description={t("admin.registeredFarmers")}
          />

          <StatCard
            title={t("admin.consumers")}
            value={stats.consumers}
            description={t("admin.registeredConsumers")}
          />

          <StatCard
            title={t("adminUser.suspended")}
            value={stats.suspended}
            description={t("admin.suspended")}
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

        {error && <InlineError message={error} />}

        {actionError && <InlineError message={actionError} />}

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
