import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSection from "../../ui/DashboardSection";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";

import { useLanguage } from "../../../context/LanguageContext";
import { updateGroup, deleteGroup } from "../../../services/group.service";
import { uploadProfilePicture } from "../../../services/cloudinary.service";
import { showToast } from "../../../utils/toast";

export default function GroupSettings({ group, onUpdated }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setActive(group.active !== false);
      setImagePreview(group.imageUrl || null);
      setImageFile(null);
      setImageRemoved(false);
      setIsEditing(false);
    }
  }, [group]);

  function handleCancel() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setName(group?.name || "");
    setDescription(group?.description || "");
    setActive(group?.active !== false);
    setImagePreview(group?.imageUrl || null);
    setImageFile(null);
    setImageRemoved(false);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size must be less than 5MB.");
      return;
    }
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  }

  function handleRemoveImage() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const hasChanges =
    name.trim() !== (group?.name || "") ||
    description.trim() !== (group?.description || "") ||
    active !== (group?.active !== false) ||
    Boolean(imageFile) ||
    imageRemoved;

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const updates = {
        name: name.trim(),
        description: description.trim(),
        active,
      };

      if (imageFile) {
        const uploaded = await uploadProfilePicture(imageFile);
        updates.imageUrl = uploaded?.url || null;
      } else if (imageRemoved) {
        updates.imageUrl = null;
      }

      await updateGroup(group.id, updates);
      showToast.success(t("adminGroups.settings.savedSuccess") || "Settings saved.");
      setIsEditing(false);
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
        {!isEditing ? (
          /* View Mode */
          <div className="p-4 sm:p-5 space-y-4">
            {/* Group Image & Identity */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-2xl sm:text-3xl font-bold text-[#2D6A4F] dark:text-(--agri-brand) shadow-sm ring-1 ring-[#2D6A4F]/20">
                {group?.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (group?.name || "?")[0].toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-(--agri-text) truncate">
                  {group?.name}
                </h3>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                      group?.active !== false
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-(--agri-hover) text-(--agri-text-muted) border border-(--agri-border-subtle)"
                    }`}
                  >
                    {group?.active !== false ? t("adminGroups.active") : t("adminGroups.inactive")}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminGroups.description")}
              </label>
              <p className="text-sm text-(--agri-text) leading-relaxed">
                {group?.description || (
                  <span className="italic text-(--agri-text-muted)">
                    {t("adminGroups.overview.noDescription") || "No description provided."}
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-(--agri-border-subtle)">
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon="ri-edit-line"
                onClick={() => setIsEditing(true)}
                className="font-bold text-xs sm:text-sm h-8 sm:h-9 px-3.5"
              >
                {t("common.edit")}
              </Button>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
            {/* Group Image Picker */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminGroups.image")}
              </label>
              <div className="flex items-center gap-3.5 sm:gap-4 p-3 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-hover)/40">
                <div className="relative group shrink-0">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl overflow-hidden bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-xl sm:text-2xl font-bold text-[#2D6A4F] dark:text-(--agri-brand) shadow-xs ring-1 ring-[#2D6A4F]/20">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : name.trim() ? (
                      name.trim()[0].toUpperCase()
                    ) : (
                      <i className="ri-team-line text-2xl text-[#2D6A4F] dark:text-(--agri-brand)" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-(--agri-text) truncate">
                    {imageFile ? imageFile.name : t("adminGroups.imageHelp")}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="text-xs h-7 px-2.5"
                    >
                      <i className="ri-upload-2-line mr-1 text-xs" />
                      {imagePreview ? t("adminGroups.changeImage") : t("adminGroups.uploadImage")}
                    </Button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={loading}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      >
                        {t("common.remove")}
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminGroups.name")} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
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

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-(--agri-border-subtle)">
              <Button
                type="button"
                variant="cancel"
                size="sm"
                onClick={handleCancel}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!name.trim() || !hasChanges || loading}
                loading={loading}
              >
                {t("adminGroups.settings.saveChanges")}
              </Button>
            </div>
          </form>
        )}
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
