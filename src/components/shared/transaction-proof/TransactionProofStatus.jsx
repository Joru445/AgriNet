import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionProofStatus({ type, inquiry }) {
  const { t } = useLanguage();

  const config = {
    waiting: {
      icon: "ri-time-line",
      title: t("transaction.waitingTitle"),
      description: t("transaction.waitingBody"),
    },

    completed: {
      icon: "ri-checkbox-circle-fill",
      title: t("transaction.completedTitle"),
      description: t("transaction.completedBody"),
    },

    rejected: {
      icon: "ri-error-warning-line",
      title: t("transaction.resubmitTitle"),
      description: t("transaction.resubmitBody"),
    },

    viewOnly: {
      icon: "ri-eye-line",
      title: t("transaction.viewOnlyTitle"),
      description: t("transaction.viewOnlyBody"),
    },
  };

  const current = config[type] ?? config.viewOnly;

  return (
    <section className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          <i className={`${current.icon} text-xl`} />
        </div>

        <div>
          <h2 className="font-semibold text-[var(--agri-text)]">{current.title}</h2>

          <p className="mt-1 text-sm leading-6 text-[var(--agri-text-muted)]">
            {current.description}
          </p>
        </div>
      </div>

      {inquiry?.proof?.url && (
        <div className="mt-5 overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-hover)]">
          <img
            src={inquiry.proof.url}
            alt={t("transaction.proofAlt")}
            className="max-h-[600px] w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
