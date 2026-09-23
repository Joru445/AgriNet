import { useEffect, useState } from "react";

import DashboardSection from "../../ui/DashboardSection";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";

import { useLanguage } from "../../../context/LanguageContext";
import { updateGroup, deleteGroup } from "../../../services/group.service";
import { showToast } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";

export default function GroupSettings({ group, onUpdated }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setActive(group.active !== false);
    }
  }, [group]);

  const hasChanges =
    name !== (group?.name || "") ||
    description !== (group?.description || "") ||
    active !== (group?.active !== false);

  async function handleSave(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await updateGroup(group.id, { name: name.trim(), description: description.trim(), active });
      showToast.success(t("adminGroups.settings.savedSuccess"));
      onUpdated();
    } catch (err) {
      showToast.error(err?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleteLoading(true);
      await deleteGroup(group.id);
      showToast.success(t("adminGroups.deletedSuccess"));
      navigate("/admin/groups");
    } catch (err) {
      showToast.error(err?.message || "Failed to delete group.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <DashboardSection
        title={t("adminGroups.settings.title")}
        icon="ri-settings-3-line"
        compact
      >
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminGroups.name")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminGroups.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 resize-none"
            />
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-(--agri-border-subtle) text-[#2D6A4F] focus:ring-[#2D6A4F]/20"
              />
              <span className="text-sm font-medium text-(--agri-text)">
                {t("adminGroups.active")}
              </span>
            </label>
          </div>
          <div className="flex justify-end pt-2 border-t border-(--agri-border-subtle)">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!hasChanges || loading}
              loading={loading}
            >
              {t("adminGroups.settings.saveChanges")}
            </Button>
          </div>
        </form>
      </DashboardSection>

      {/* Danger Zone */}
      <DashboardSection
        title={t("adminGroups.dangerZone")}
        icon="ri-error-warning-line"
        compact
      >
        <div className="p-4">
          <p className="text-sm text-(--agri-text-muted)">
            {t("adminGroups.dangerZoneDesc")}
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={() => setShowDelete(true)}
          >
            {t("adminGroups.deleteConfirm")}
          </Button>
        </div>
      </DashboardSection>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={t("adminGroups.deleteConfirm")}
        description={t("adminGroups.deleteConfirmDesc")}
        confirmLabel={t("common.delete")}
        danger
        loading={deleteLoading}
      />
    </div>
  );
}
