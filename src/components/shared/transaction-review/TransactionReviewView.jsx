import RatingStars from "./RatingStars";
import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionReviewView({
  farmerReview,
  productReview,
  productProof,
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Review Summary Card */}
      <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
            <i className="ri-star-smile-fill text-xl text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--agri-text)]">
              {t("transactionReview.ratingsTitle")}
            </h2>

            <p className="mt-0.5 text-xs font-semibold text-[var(--agri-text-secondary)]">
              {t("transactionReview.ratingsSubtitle")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <RatingSummary
            label={t("transactionReview.farmerRating")}
            icon="ri-user-star-line"
            review={farmerReview}
          />

          <RatingSummary
            label={t("transactionReview.productRating")}
            icon="ri-shopping-bag-3-line"
            review={productReview}
          />
        </div>
      </div>

      {/* Farmer Review Card */}
      <ReviewCard
        title={t("transactionReview.farmerReview")}
        icon="ri-user-star-line"
        subtitle={t("transactionReview.farmerFeedback")}
        review={farmerReview}
        emptyMessage={t("transactionReview.noFarmerReview")}
      />

      {/* Product Review Card */}
      <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
            <i className="ri-shopping-bag-3-line text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--agri-text)]">
              {t("transactionReview.productReview")}
            </h2>

            <p className="text-xs font-semibold text-[var(--agri-text-secondary)]">
              {t("transactionReview.productFeedback")}
            </p>
          </div>
        </div>

        {productReview ? (
          <div className="mt-4">
            {/* Rating Box */}
            <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/80 p-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars value={productReview.rating} size="text-lg" />

                <span className="text-base font-bold text-[var(--agri-text)]">
                  {productReview.rating}.0
                </span>

                <span className="text-xs font-semibold text-[var(--agri-text-muted)]">{t("transactionReview.outOfStars")}</span>
              </div>

              {productReview.comment ? (
                <div className="mt-3.5 border-l-4 border-[#2D6A4F] bg-[var(--agri-card)] p-3.5 rounded-r-xl border-t border-r border-b border-[var(--agri-border-subtle)]/70 shadow-2xs">
                  <p className="text-sm font-medium leading-relaxed text-[var(--agri-text-secondary)] italic">
                    "{productReview.comment}"
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs font-medium text-[var(--agri-text-muted)] italic">
                  {t("transactionReview.noComment")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyReview message={t("transactionReview.noProductReview")} />
        )}

        {/* Transaction Proof */}
        {productProof && (
          <div className="mt-6 border-t border-[var(--agri-border-subtle)] pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--agri-text-secondary)]">
                  {t("transactionReview.transactionProof")}
                </p>

                <p className="text-xs font-medium text-[var(--agri-text-muted)]">
                  {t("transactionReview.proofPhotoDesc")}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <i className="ri-checkbox-circle-fill text-emerald-600" />
                {t("transactionReview.verified")}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)] shadow-2xs">
              <img
                src={productProof}
                alt="Transaction proof"
                className="max-h-[28rem] w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RatingSummary({ label, icon, review }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/90 p-4 shadow-2xs">
      <div className="flex items-center gap-2">
        <i className={`${icon} text-[#2D6A4F] dark:text-[var(--agri-brand)] text-base`} />

        <span className="text-xs font-bold text-[var(--agri-text-secondary)]">{label}</span>
      </div>

      {review ? (
        <div className="mt-3 flex items-center gap-2.5">
          <RatingStars value={review.rating} size="text-base" />

          <span className="text-sm font-bold text-[var(--agri-text)]">
            {review.rating}.0 / 5
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-[var(--agri-text-muted)]">{t("transactionReview.notReviewed")}</p>
      )}
    </div>
  );
}

function ReviewCard({ title, icon, subtitle, review, emptyMessage }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5 sm:p-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
          <i className={`${icon} text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]`} />
        </div>

        <div>
          <h2 className="text-base font-bold text-[var(--agri-text)]">{title}</h2>

          <p className="text-xs font-semibold text-[var(--agri-text-secondary)]">{subtitle}</p>
        </div>
      </div>

      {review ? (
        <div className="mt-4 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/80 p-4 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            <RatingStars value={review.rating} size="text-lg" />

            <span className="text-base font-bold text-[var(--agri-text)]">
              {review.rating}.0
            </span>

            <span className="text-xs font-semibold text-[var(--agri-text-muted)]">{t("transactionReview.outOfStars")}</span>
          </div>

          {review.comment ? (
            <div className="mt-3.5 border-l-4 border-[#2D6A4F] bg-[var(--agri-card)] p-3.5 rounded-r-xl border-t border-r border-b border-[var(--agri-border-subtle)]/70 shadow-2xs">
              <p className="text-sm font-medium leading-relaxed text-[var(--agri-text-secondary)] italic">
                "{review.comment}"
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs font-medium text-[var(--agri-text-muted)] italic">
              {t("transactionReview.noComment")}
            </p>
          )}
        </div>
      ) : (
        <EmptyReview message={emptyMessage} />
      )}
    </div>
  );
}

function EmptyReview({ message }) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/60 px-4 py-6 text-center">
      <i className="ri-star-line text-2xl text-[var(--agri-border)]" />

      <p className="mt-1.5 text-xs font-semibold text-[var(--agri-text-muted)]">{message}</p>
    </div>
  );
}
