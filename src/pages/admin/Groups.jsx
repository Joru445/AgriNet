import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ResponsiveModal from "../../components/ui/ResponsiveModal";

import { useLanguage } from "../../context/LanguageContext";
import { getGroups, createGroup } from "../../services/group.service";
import { uploadProfilePicture } from "../../services/cloudinary.service";
import * as pageCache from "../../utils/pageCache";
import { showToast } from "../../utils/toast";

function CreateGroupModal({ open, onClose, onCreated }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
    } else {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    }
  }, [open]);

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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      let imageUrl = null;
      if (imageFile) {
        const uploaded = await uploadProfilePicture(imageFile);
        imageUrl = uploaded?.url || null;
      }
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        ...(imageUrl ? { imageUrl } : {}),
      });
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
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Group Profile Image (Optional) */}
        <div>
          <label className="mb-1.5 block text-xs lg:text-sm font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("adminGroups.image")}
          </label>
          <div className="flex items-center gap-3.5 sm:gap-4 p-3 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-hover)/40">
            {/* The icon container */}
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
          <label className="mb-1.5 block text-xs lg:text-sm font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("adminGroups.name")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("adminGroups.namePlaceholder")}
            className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-4 py-3 text-sm lg:text-base text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 shadow-2xs"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs lg:text-sm font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("adminGroups.description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("adminGroups.descriptionPlaceholder")}
            rows={3}
            className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-4 py-3 text-sm lg:text-base text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 resize-none shadow-2xs"
          />
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-(--agri-border-subtle)">
          <Button type="button" variant="cancel" size="md" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={!name.trim() || loading} loading={loading}>
            {t("adminGroups.createGroup")}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

export default function AdminGroups() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState(() => pageCache.get("all_groups") || []);
  const [loading, setLoading] = useState(() => !pageCache.get("all_groups"));
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      if (!pageCache.get("all_groups")) {
        setLoading(true);
      }
      setError(null);
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error("Failed to load groups:", err);
      if (groups.length === 0) {
        setError(err?.message || "Failed to load groups.");
      }
    } finally {
      setLoading(false);
    }
  }, [groups.length]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="min-h-full p-3.5 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-(--agri-text)">
              {t("adminGroups.title")}
            </h1>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base text-(--agri-text-muted)">
              {t("adminGroups.subtitle")}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon="ri-add-line"
            onClick={() => setShowCreate(true)}
            className="shadow-sm font-bold shrink-0 text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) shadow-md shadow-black/5"
              >
                <SkeletonBox className="aspect-[16/10] w-full" />
                <div className="p-4 sm:p-5 space-y-3">
                  <SkeletonBox className="h-5 w-3/4" />
                  <SkeletonBox className="h-3.5 w-full" />
                  <SkeletonBox className="h-3.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon="ri-team-line"
            title={t("adminGroups.noGroups")}
            description={t("adminGroups.noGroupsDesc")}
            action={
              <Button
                variant="primary"
                size="md"
                icon="ri-add-line"
                onClick={() => setShowCreate(true)}
                className="shadow-sm font-bold text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
              >
                {t("adminGroups.createGroup")}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/admin/groups/${group.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) shadow-md shadow-black/5 dark:shadow-black/25 hover:shadow-xl hover:shadow-[#2D6A4F]/10 dark:hover:shadow-black/40 hover:-translate-y-1 hover:border-[#2D6A4F]/50 dark:hover:border-emerald-500/50 transition-all duration-300"
              >
                {/* Top Image / Icon Area */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F0F5F2] dark:bg-(--agri-hover)">
                  {group.imageUrl ? (
                    <img
                      src={group.imageUrl}
                      alt={group.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D6A4F]/10 via-[#2D6A4F]/5 to-transparent">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-2xl font-bold text-[#2D6A4F] dark:text-(--agri-brand) shadow-sm ring-1 ring-[#2D6A4F]/20">
                        {(group.name || "?")[0].toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Gradient shadow overlay only when there is no image inserted */}
                  {!group.imageUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none transition-opacity duration-300 group-hover:from-black/70" />
                  )}

                  {/* Active/Inactive badge */}
                  <div className="absolute right-2.5 top-2.5 z-10">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md border ${
                      group.active
                        ? "bg-emerald-600/90 text-white border-emerald-300/40"
                        : "bg-black/65 text-white border-white/20"
                    }`}>
                      {group.active ? t("adminGroups.active") : t("adminGroups.inactive")}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <h3 className="text-base font-bold text-(--agri-text) group-hover:text-[#2D6A4F] dark:group-hover:text-(--agri-brand) transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-(--agri-text-muted) line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {group.description || "—"}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-(--agri-border-subtle)">
                    <span className="text-xs font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
                      {t("adminGroups.manage")}
                    </span>
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-(--agri-hover) group-hover:bg-[#2D6A4F] group-hover:text-white transition-all shadow-2xs">
                      <i className="ri-arrow-right-line text-xs transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadGroups}
      />
    </div>
  );
}
