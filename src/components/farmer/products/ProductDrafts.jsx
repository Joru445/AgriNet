import { useLanguage } from "../../../context/LanguageContext";
import { formatTimestamp } from "../../../utils/date";
import Button from "../../ui/Button";

export default function ProductDrafts({
  drafts,
  loading,
  onResume,
  onDelete,
  onClear,
}) {
  const { t } = useLanguage();

  if (!loading && !drafts.length) return null;

  return (
    <section className="mb-5 rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <i className="ri-draft-line text-lg" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-(--agri-text)">
              {t("products.draftsTitle")}
            </h2>
            <p className="text-[11px] text-(--agri-text-muted)">
              {t("products.draftsDeviceHint")}
            </p>
          </div>
        </div>

        {drafts.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {t("products.clearDrafts")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-(--agri-border) bg-(--agri-hover)"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {drafts.map((draft) => {
            const name = draft.form?.name?.trim() || t("products.untitledDraft");
            const creator = draft.createdByName || draft.createdByUid || "";
            const modeLabel = draft.mode === "edit"
              ? t("products.draftModeEdit")
              : t("products.draftModeCreate");

            return (
              <div
                key={draft.id}
                className="flex flex-col gap-2 rounded-xl border border-(--agri-border) bg-(--agri-hover)/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-(--agri-text)">
                      {name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-(--agri-text-muted)">
                      {modeLabel} &middot; {t("products.draftStep", { step: draft.step || 1 })}
                      {creator ? ` \u00b7 ${creator}` : ""}
                    </p>
                    <p className="text-[11px] text-(--agri-text-muted)">
                      {formatTimestamp(draft.updatedAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(draft)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--agri-text-muted) hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    title={t("products.deleteDraft")}
                    aria-label={t("products.deleteDraft")}
                  >
                    <i className="ri-delete-bin-6-line" />
                  </button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onResume(draft)}
                  className="mt-auto w-full"
                >
                  {t("products.resumeDraft")}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
