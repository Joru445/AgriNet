import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";
import { useInquiriesContext } from "../../../context/InquiriesContext";

import DashboardSection from "../../common/DashboardSection";
import InquiryStatusBadge from "../../shared/inquiries/InquiryStatusBadge";
import EmptyState from "../../ui/EmptyState";

const BREAKDOWN = [
  "pending",
  "accepted",
  "reserved",
  "ongoing",
  "completed",
  "cancelled",
];

const RECENT_LIMIT = 4;

function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status || "pending";
}

export default function InquiryOverview({ loading = false }) {
  const { t } = useLanguage();
  const { inquiries, loading: contextLoading, error } = useInquiriesContext();

  const isLoading = loading || contextLoading;

  const counts = useMemo(() => {
    const result = Object.fromEntries(BREAKDOWN.map((key) => [key, 0]));
    inquiries.forEach((inquiry) => {
      const status = normalizeStatus(inquiry.status);
      if (result[status] != null) {
        result[status] += 1;
      }
    });
    return result;
  }, [inquiries]);

  const recentInquiries = useMemo(
    () => inquiries.slice(0, RECENT_LIMIT),
    [inquiries],
  );

  const headerAction = (
    <Link
      to="/farmer/transactions"
      className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] dark:text-[var(--agri-brand)] transition hover:underline"
    >
      {t("farmer.viewAll")}
      <i className="ri-arrow-right-line text-xs" />
    </Link>
  );

  if (isLoading) {
    return (
      <DashboardSection
        title={t("farmer.transactionOverview")}
        subtitle={t("farmer.transactionOverviewSubtitle")}
        icon="ri-file-list-3-line"
        compact
        headerAction={headerAction}
      >
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 border-b border-[var(--agri-border-subtle)] animate-pulse">
          {BREAKDOWN.map((key) => (
            <div key={key} className="space-y-2">
              <div className="h-7 w-10 mx-auto bg-[var(--agri-hover)] rounded-lg" />
              <div className="h-2.5 w-14 mx-auto bg-[var(--agri-hover)] rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-2 p-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[var(--agri-hover)]/60 rounded-xl" />
          ))}
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title={t("farmer.transactionOverview")}
      subtitle={t("farmer.transactionOverviewSubtitle")}
      icon="ri-file-list-3-line"
      compact
      headerAction={headerAction}
    >
      {/* Status breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 border-b border-[var(--agri-border-subtle)]">
        {BREAKDOWN.map((key) => (
          <div key={key} className="flex flex-col items-center text-center">
            <span className="text-xl font-bold text-[var(--agri-text)]">
              {counts[key]}
            </span>
            <span className="mt-1 text-[11px] font-semibold text-[var(--agri-text-muted)]">
              {t(`transactions.status.${key}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      {error ? (
        <div className="p-6 text-center text-sm font-medium text-red-600 dark:text-red-400">
          <i className="ri-error-warning-line mr-1.5" />
          {t("ui.errorTitle")}
        </div>
      ) : inquiries.length === 0 ? (
        <EmptyState
          className="py-8"
          icon="ri-file-list-3-line"
          title={t("farmer.noTransactionsYet")}
          description={t("farmer.noTransactionsDesc")}
        />
      ) : (
        <ul className="divide-y divide-[var(--agri-border-subtle)]">
          {recentInquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <InquiryOverviewRow inquiry={inquiry} />
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}

function InquiryOverviewRow({ inquiry }) {
  const { t } = useLanguage();

  const product = inquiry.productSnapshot ?? {};
  const name = product.name || t("admin.unnamedProduct");

  const image = product.images?.[0]?.url || product.images?.[0] || "";

  const price = Number(product.price) || 0;
  const quantity = Number(inquiry.quantity) || 0;
  const total = price * quantity;

  return (
    <Link
      to="/farmer/transactions"
      className="flex items-center gap-3 p-3 transition hover:bg-[var(--agri-hover)]/60"
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-10 w-10 shrink-0 rounded-lg object-cover bg-[var(--agri-hover)] border border-[var(--agri-border-subtle)]"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          <i className="ri-shopping-basket-line text-base" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
          {name}
        </p>

        <p className="mt-0.5 truncate text-xs text-[var(--agri-text-muted)]">
          {quantity > 0 && product.unit
            ? `${quantity} ${product.unit}`
            : t("farmer.totalTransactions")}
          {total > 0 && (
            <span className="font-semibold text-[var(--agri-text-secondary)]">
              {" "}
              · ₱{total.toLocaleString()}
            </span>
          )}
        </p>
      </div>

      <InquiryStatusBadge status={normalizeStatus(inquiry.status)} />
    </Link>
  );
}