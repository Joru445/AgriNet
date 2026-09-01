import useTransactionProof from "../../hooks/useTransactionProof";

import TransactionProduct from "../../components/shared/transaction-proof/TransactionProduct";
import TransactionProofReview from "../../components/shared/transaction-proof/TransactionProofReview";
import TransactionProofStatus from "../../components/shared/transaction-proof/TransactionProofStatus";
import TransactionProofUpload from "../../components/shared/transaction-proof/TransactionProofUpload";
import TransactionProofSkeleton from "../../components/shared/transaction-proof/TransactionProofSkeleton";
import PageWrapper from "../../components/ui/PageWrapper";
import { InlineError } from "../../components/ui/ErrorState";

export default function TransactionProof() {
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Transaction</h1>
          {loading ? (
            <div className="mt-1 h-4 w-64 bg-gray-200 rounded animate-pulse" />
          ) : status !== "completed" ? (
            <p className="mt-1 text-sm text-gray-500">
              Review and complete the transaction.
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              This transaction is completed.
            </p>
          )}
        </div>

        {loading ? (
          <TransactionProofSkeleton />
        ) : !inquiry ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6">
            <p className="text-sm font-medium text-red-600">
              {error || "Transaction not found."}
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
              <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#2D6A4F]">
                    <i className="ri-checkbox-circle-line text-xl" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Have you received the product?
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Confirm that you received the product. You'll then be asked to
                      upload a photo as transaction proof.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={requestCompletion}
                  className="
                    mt-5 w-full rounded-xl
                    bg-[#2D6A4F]
                    px-4 py-3
                    text-sm font-semibold text-white
                    transition hover:bg-[#24583F]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {processing ? "Processing..." : "Yes, I received the product"}
                </button>
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
