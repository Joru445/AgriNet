import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardSection from "../../components/ui/DashboardSection";
import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ResponsiveModal from "../../components/ui/ResponsiveModal";

import { useLanguage } from "../../context/LanguageContext";
import { getGroups, createGroup } from "../../services/group.service";
import { showToast } from "../../utils/toast";

function CreateGroupModal({ open, onClose, onCreated }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await createGroup({ name: name.trim(), description: description.trim() });
      showToast.success(t("adminGroups.createdSuccess"));
      onCreated();
      onClose();
    } catch (err) {
      showToast.error(err?.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={t("adminGroups.createGroupTitle")}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("adminGroups.name")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("adminGroups.namePlaceholder")}
            className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("adminGroups.description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("adminGroups.descriptionPlaceholder")}
            rows={3}
            className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-(--agri-border-subtle)">
          <Button type="button" variant="cancel" size="sm" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim() || loading} loading={loading}>
            {t("adminGroups.createGroup")}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

export default function AdminGroups() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError(err?.message || "Failed to load groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-(--agri-text)">
              {t("adminGroups.title")}
            </h1>
            <p className="mt-1 text-sm text-(--agri-text-muted)">
              {t("adminGroups.subtitle")}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon="ri-add-line"
            onClick={() => setShowCreate(true)}
          >
            {t("adminGroups.createGroup")}
          </Button>
        </div>

        {error && (
          <ErrorState
            className="mb-4"
            title={t("admin.failedToLoad")}
            message={error}
            onRetry={loadGroups}
          />
        )}

        <DashboardSection
          title={t("adminGroups.title")}
          icon="ri-team-line"
          compact
          fill
        >
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBox key={i} className="h-16" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              icon="ri-team-line"
              title={t("adminGroups.noGroups")}
              description={t("adminGroups.noGroupsDesc")}
              action={
                <Button variant="primary" size="sm" icon="ri-add-line" onClick={() => setShowCreate(true)}>
                  {t("adminGroups.createGroup")}
                </Button>
              }
            />
          ) : (
            <div>
              {groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/admin/groups/${group.id}`}
                  className="flex items-center gap-3 border-b border-(--agri-border-subtle) px-4 py-3 transition hover:bg-(--agri-hover)/60 last:border-b-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-sm font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
                    {(group.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-(--agri-text)">
                      {group.name}
                    </p>
                    <p className="text-xs text-(--agri-text-muted) truncate">
                      {group.description || "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      group.active
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-(--agri-hover) text-(--agri-text-muted) border border-(--agri-border-subtle)"
                    }`}>
                      {group.active ? t("adminGroups.active") : t("adminGroups.inactive")}
                    </span>
                  </div>
                  <i className="ri-arrow-right-line text-(--agri-text-muted)" />
                </Link>
              ))}
            </div>
          )}
        </DashboardSection>
      </div>

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadGroups}
      />
    </div>
  );
}
