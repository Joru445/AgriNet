import useTransactionProof from "../../hooks/useTransactionProof";
import { useLanguage } from "../../context/LanguageContext";

import TransactionProduct from "../../components/transactions/TransactionProduct";
import TransactionProofReview from "../../components/transactions/TransactionProofReview";
import TransactionProofStatus from "../../components/transactions/TransactionProofStatus";
import TransactionProofUpload from "../../components/transactions/TransactionProofUpload";
import TransactionProofSkeleton from "../../components/transactions/TransactionProofSkeleton";
import PageWrapper from "../../components/ui/PageWrapper";
import { InlineError } from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";

export default function TransactionProof() {
  const { t } = useLanguage();
  const {
    inquiry,
    status,

    loading,
    processing,
    error,

    isConsumer,
    isFarmer,

    selectedFile,
    previewUrl,

    selectFile,
    removeFile,

    requestCompletion,
    uploadProof,
    confirmProof,
    rejectProof,
  } = useTransactionProof();

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl pb-18 sm:pb-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mt-4 text-2xl font-bold text-(--agri-text)">{t("transaction.title")}</h1>
          {loading ? (
            <div className="mt-1 h-4 w-64 bg-(--agri-hover) rounded animate-pulse" />
          ) : status !== "completed" ? (
            <p className="mt-1 text-sm text-(--agri-text-muted)">
              {t("transaction.heading.reviewComplete")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-(--agri-text-muted)">
              {t("transaction.heading.completed")}
            </p>
          )}
        </div>

        {loading ? (
          <TransactionProofSkeleton />
        ) : !inquiry ? (
          <div className="rounded-2xl border border-red-100 bg-(--agri-card) p-6">
            <p className="text-sm font-medium text-red-600">
              {error || t("transaction.notFound")}
            </p>
          </div>
        ) : (
          <>
            {/* Product */}
            <TransactionProduct inquiry={inquiry} />

            {/* Error */}
            {error && <InlineError message={error} className="mt-5" />}

            {/* Consumer: transaction is ongoing */}
            {isConsumer && status === "ongoing" && (
              <section className="mt-5 rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[#2D6A4F] dark:text-(--agri-brand)">
                    <i className="ri-checkbox-circle-line text-xl" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-(--agri-text)">
                      {t("transaction.receivedQuestion")}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-(--agri-text-muted)">
                      {t("transaction.receivedBody")}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={processing}
                  loading={processing}
                  onClick={requestCompletion}
                  fullWidth
                >
                  {processing
                    ? t("transaction.processing")
                    : t("transaction.yesReceived")}
                </Button>
              </section>
            )}

            {/* Consumer: upload proof */}
            {isConsumer && status === "awaiting_proof" && (
              <div className="mt-5">
                <TransactionProofUpload
                  selectedFile={selectedFile}
                  previewUrl={previewUrl}
                  processing={processing}
                  rejected={
                    status === "awaiting_proof" && Boolean(inquiry.proofRejectedAt)
                  }
                  onSelectFile={selectFile}
                  onRemoveFile={removeFile}
                  onSubmit={uploadProof}
                />
              </div>
            )}

            {/* Consumer: waiting for farmer */}
            {isConsumer && status === "proof_submitted" && (
              <div className="mt-5">
                <TransactionProofStatus type="waiting" inquiry={inquiry} />
              </div>
            )}

            {/* Farmer: review proof */}
            {isFarmer && status === "proof_submitted" && (
              <div className="mt-5">
                <TransactionProofReview
                  inquiry={inquiry}
                  processing={processing}
                  onConfirm={confirmProof}
                  onReject={rejectProof}
                />
              </div>
            )}

            {/* Completed */}
            {status === "completed" && (
              <div className="mt-5">
                <TransactionProofStatus type="completed" inquiry={inquiry} />
              </div>
            )}

            {/* Admin / unauthorized role */}
            {!isConsumer && !isFarmer && status !== "completed" && (
              <div className="mt-5">
                <TransactionProofStatus type="viewOnly" inquiry={inquiry} />
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
