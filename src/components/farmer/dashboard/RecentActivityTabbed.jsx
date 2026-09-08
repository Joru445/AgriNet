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

function TabButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
        active
          ? "bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)] shadow-2xs"
          : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]"
      }`}
    >
      {label}
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
      headerAction={
        <div className="flex shrink-0 items-center rounded-lg bg-[var(--agri-hover)] p-0.5">
          <TabButton active={tab === "products"} onClick={() => setTab("products")} label={t("farmer.recentProducts")} />
          <TabButton active={tab === "inquiries"} onClick={() => setTab("inquiries")} label={t("farmer.recentInquiries")} />
          <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")} label={t("farmer.latestReviews")} />
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
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <i className="ri-store-2-line text-2xl text-[var(--agri-text-muted)]" />
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
            className="flex items-center gap-3 px-3 py-2 transition hover:bg-[var(--agri-hover)]/60"
          >
            {product.images?.[0]?.url || product.images?.[0] ? (
              <img
                src={product.images[0].url || product.images[0]}
                alt={product.name || "Product"}
                className="h-8 w-8 shrink-0 rounded-lg object-cover border border-[var(--agri-border-subtle)]"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                <i className="ri-shopping-basket-line text-sm" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                {product.name || t("admin.unnamedProduct")}
              </p>
              <p className={`mt-0.5 text-[11px] font-bold ${product.available ? "text-[#2D6A4F] dark:text-[var(--agri-brand)]" : "text-[var(--agri-text-muted)]"}`}>
                {product.available ? t("admin.available") : t("admin.unavailable")}
              </p>
            </div>

            <p className="shrink-0 text-sm font-black text-[#1B4332] dark:text-[var(--agri-brand-light)]">
              ₱{Number(product.price || 0).toLocaleString()}
            </p>
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
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <i className="ri-file-list-3-line text-2xl text-[var(--agri-text-muted)]" />
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
            className="flex items-center gap-3 px-3 py-2 transition hover:bg-[var(--agri-hover)]/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              <i className="ri-file-list-3-line text-sm" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                {inquiry.productName || inquiry.product?.name || t("admin.unnamedProduct")}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[inquiry.status] || "bg-gray-400"}`} />
                <span className="text-[11px] font-medium text-[var(--agri-text-muted)]">
                  {t(`transactions.status.${inquiry.status}`)}
                </span>
              </div>
            </div>

            {inquiry.createdAt && (
              <span className="shrink-0 text-[11px] font-medium text-[var(--agri-text-muted)]">
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </span>
            )}
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
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <i className="ri-star-line text-2xl text-[var(--agri-text-muted)]" />
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
            className="flex items-center gap-3 px-3 py-2 transition hover:bg-[var(--agri-hover)]/60"
          >
            {review.reviewer?.profilePicture ? (
              <img
                src={review.reviewer.profilePicture}
                alt={review.reviewer.fullname || "Reviewer"}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-xs font-semibold text-[var(--agri-text-muted)]">
                {(review.reviewer?.fullname || "?")[0]}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                {review.reviewer?.fullname || review.reviewer?.username || t("reviews.anonymous")}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`text-[11px] ${star <= (review.rating || 0) ? "ri-star-fill text-amber-400" : "ri-star-line text-[var(--agri-text-muted)]"}`}
                  />
                ))}
                {review.comment && (
                  <span className="ml-1 truncate text-[11px] text-[var(--agri-text-muted)]">
                    — {review.comment}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
