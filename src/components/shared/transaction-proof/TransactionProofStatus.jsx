export default function TransactionProofStatus({ type, inquiry }) {
  const config = {
    waiting: {
      icon: "ri-time-line",
      title: "Waiting for farmer confirmation",
      description:
        "Your proof has been submitted. The farmer will review the image and confirm the transaction.",
    },

    completed: {
      icon: "ri-checkbox-circle-fill",
      title: "Transaction completed",
      description:
        "This transaction has been successfully confirmed by the farmer.",
    },

    rejected: {
      icon: "ri-error-warning-line",
      title: "Proof needs to be resubmitted",
      description:
        "The farmer rejected your previous proof. Please upload another image.",
    },

    viewOnly: {
      icon: "ri-eye-line",
      title: "Transaction details",
      description:
        "You can view this transaction, but you cannot submit or approve transaction proof.",
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
            alt="Transaction proof"
            className="max-h-[600px] w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
