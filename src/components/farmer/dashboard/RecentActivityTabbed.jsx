import { useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";
import { useInquiriesContext } from "../../../context/InquiriesContext";
import DashboardSection from "../../common/DashboardSection";
import SkeletonBox from "../../common/SkeletonBox";

const MAX_ITEMS = 4;

const STATUS_COLORS = {
  pending: "bg-amber-400",
  accepted: "bg-blue-400",
  reserved: "bg-violet-400",
  ongoing: "bg-[#2D6A4F] dark:bg-[var(--agri-brand)]",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

function TabButton({ active, onClick, label, mobileLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`cursor-pointer w-full sm:w-auto flex items-center justify-center rounded-lg py-1.5 px-2 sm:px-3 text-xs font-bold transition-all text-center ${
        active
          ? "bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)] shadow-2xs border border-[var(--agri-border-subtle)]"
          : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] hover:bg-[var(--agri-card)]/40 border border-transparent"
      }`}
    >
      <span className="hidden sm:inline truncate">{label}</span>
      <span className="sm:hidden truncate">{mobileLabel || label}</span>
    </button>
  );
}

export default function RecentActivityTabbed({ products = [], reviews = [], loading = false }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("products");

  const tabTitle = tab === "products"
    ? t("farmer.recentProducts")
    : tab === "reviews"
      ? t("farmer.latestReviews")
      : t("farmer.recentInquiries");

  const tabIcon = tab === "products"
    ? "ri-store-2-line"
    : tab === "reviews"
      ? "ri-star-line"
      : "ri-file-list-3-line";

  return (
    <DashboardSection
      title={tabTitle}
      icon={tabIcon}
      compact
      fill
      headerClassName="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4"
      headerAction={
        <div className="grid grid-cols-3 w-full sm:w-auto sm:flex items-center rounded-xl bg-[var(--agri-hover)] p-1 gap-1 border border-[var(--agri-border-subtle)]/70 shadow-2xs">
          <TabButton
            active={tab === "products"}
            onClick={() => setTab("products")}
            label={t("farmer.recentProducts")}
            mobileLabel={t("farmer.statProducts")}
          />
          <TabButton
            active={tab === "inquiries"}
            onClick={() => setTab("inquiries")}
            label={t("farmer.recentInquiries")}
            mobileLabel={t("farmer.statInquiries")}
          />
          <TabButton
            active={tab === "reviews"}
            onClick={() => setTab("reviews")}
            label={t("farmer.latestReviews")}
            mobileLabel={t("farmer.reviewsTitle")}
          />
        </div>
      }
    >
      {loading ? (
        <div className="space-y-1.5 p-3">
          {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-8" />)}
        </div>
      ) : tab === "products" ? (
        <RecentProductsList products={products} />
      ) : tab === "inquiries" ? (
        <RecentInquiriesList />
      ) : (
        <RecentReviewsList reviews={reviews} />
      )}
    </DashboardSection>
  );
}

function RecentProductsList({ products }) {
  const { t } = useLanguage();
  const displayed = products.slice(0, MAX_ITEMS);

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
        <i className="ri-store-2-line text-3xl text-[var(--agri-text-muted)]" />
        <p className="mt-2 text-sm font-medium text-[var(--agri-text-muted)]">{t("farmer.noProductsYet")}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--agri-border-subtle)]">
      {displayed.map((product) => (
        <li key={product.id}>
          <Link
            to="/farmer/products"
            className="group flex items-center justify-between gap-3 px-3.5 py-3 transition hover:bg-[var(--agri-hover)]/60"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {product.images?.[0]?.url || product.images?.[0] ? (
                <img
                  src={product.images[0].url || product.images[0]}
                  alt={product.name || "Product"}
                  className="h-11 w-11 shrink-0 rounded-xl object-cover border border-[var(--agri-border-subtle)] shadow-2xs"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                  <i className="ri-shopping-basket-line text-lg" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--agri-text)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors">
                  {product.name || t("admin.unnamedProduct")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      product.available
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200/60"
                    }`}
                  >
                    {product.available ? t("admin.available") : t("admin.unavailable")}
                  </span>
                  {product.category && (
                    <span className="text-[11px] text-[var(--agri-text-muted)] truncate">
                      • {product.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-base font-black text-[#1B4332] dark:text-[var(--agri-brand-light)]">
                ₱{Number(product.price || 0).toLocaleString()}
              </span>
              <i className="ri-arrow-right-s-line text-base text-[var(--agri-text-muted)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RecentInquiriesList() {
  const { t } = useLanguage();
  const { inquiries, loading: contextLoading } = useInquiriesContext();
  const displayed = inquiries.slice(0, MAX_ITEMS);

  if (contextLoading) {
    return (
      <div className="space-y-1.5 p-3">
        {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-8" />)}
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
        <i className="ri-file-list-3-line text-3xl text-[var(--agri-text-muted)]" />
        <p className="mt-2 text-sm font-medium text-[var(--agri-text-muted)]">{t("farmer.noTransactionsYet")}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--agri-border-subtle)]">
      {displayed.map((inquiry) => (
        <li key={inquiry.id}>
          <Link
            to="/farmer/transactions"
            className="group flex items-center justify-between gap-3 px-3.5 py-3 transition hover:bg-[var(--agri-hover)]/60"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                <i className="ri-file-list-3-line text-lg" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--agri-text)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors">
                  {inquiry.productName || inquiry.product?.name || t("admin.unnamedProduct")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--agri-text-muted)]">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[inquiry.status] || "bg-gray-400"}`} />
                    {t(`transactions.status.${inquiry.status}`)}
                  </span>
                  {inquiry.createdAt && (
                    <span className="text-[11px] text-[var(--agri-text-muted)]">
                      • {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <i className="ri-arrow-right-s-line text-base text-[var(--agri-text-muted)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RecentReviewsList({ reviews }) {
  const { t } = useLanguage();
  const displayed = reviews.slice(0, MAX_ITEMS);

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
        <i className="ri-star-line text-3xl text-[var(--agri-text-muted)]" />
        <p className="mt-2 text-sm font-medium text-[var(--agri-text-muted)]">{t("farmer.noReviewsYet")}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--agri-border-subtle)]">
      {displayed.map((review) => (
        <li key={review.id}>
          <Link
            to="/farmer/reviews"
            className="group flex items-center justify-between gap-3 px-3.5 py-3 transition hover:bg-[var(--agri-hover)]/60"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {review.reviewer?.profilePicture ? (
                <img
                  src={review.reviewer.profilePicture}
                  alt={review.reviewer.fullname || "Reviewer"}
                  className="h-11 w-11 shrink-0 rounded-full object-cover border border-[var(--agri-border-subtle)]"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                  {(review.reviewer?.fullname || "?")[0]}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--agri-text)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors">
                  {review.reviewer?.fullname || review.reviewer?.username || t("reviews.anonymous")}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`text-xs ${star <= (review.rating || 0) ? "ri-star-fill text-amber-400" : "ri-star-line text-[var(--agri-text-muted)]"}`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <span className="truncate text-xs text-[var(--agri-text-muted)]">
                      — {review.comment}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <i className="ri-arrow-right-s-line text-base text-[var(--agri-text-muted)] group-hover:text-[#2D6A4F] dark:group-hover:text-[var(--agri-brand)] transition-colors" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
