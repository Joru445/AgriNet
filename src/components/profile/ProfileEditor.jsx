import useProfile from "../../hooks/useProfile";
import { useLanguage } from "../../context/LanguageContext";
import ProfileForm from "../me/ProfileForm";
import FarmerSection from "../me/FarmerSection";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Loading from "../ui/Loading";

/** Owner-only editor. It is mounted only after the owner opens Edit Profile. */
export default function ProfileEditor({ open, profile, role, onClose, onSaved }) {
  const { t } = useLanguage();
  const editor = useProfile(profile);

  async function saveProfile() {
    const updated = await editor.handleSave();
    if (updated?.uid) onSaved(updated);
  }

  async function closeEditor() {
    await editor.handleCancel();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={closeEditor}
      title={t("profile.editTitle")}
      description={t("profile.editDescription")}
      maxWidth="max-w-3xl"
      placement="center"
      bodyClassName="p-4 sm:p-6"
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="cancel" onClick={closeEditor} disabled={editor.saving}>{t("common.cancel")}</Button>
          <Button variant="save" onClick={saveProfile} disabled={editor.saving || editor.uploadingAvatar}>
            {editor.saving ? t("profile.saving") : t("profile.saveChanges")}
          </Button>
        </div>
      )}
    >
      {editor.loading ? <Loading /> : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-(--agri-border-subtle) pb-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#2D6A4F] dark:text-(--agri-brand)">
              <i className={editor.uploadingAvatar ? "ri-loader-4-line animate-spin" : "ri-camera-line"} />
              {t("profile.changePic")}
              <input type="file" accept="image/*" className="sr-only" onChange={editor.handleAvatar} disabled={editor.uploadingAvatar} />
            </label>
          </div>
          <ProfileForm form={editor.form} editing onChange={editor.handleChange} onVisibilityChange={editor.handleVisibilityChange} />
          {role === "farmer" && (
            <FarmerSection
              form={editor.form}
              stats={editor.stats}
              editing
              onChange={editor.handleChange}
              onVisibilityChange={editor.handleVisibilityChange}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
