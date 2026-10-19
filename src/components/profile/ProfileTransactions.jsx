import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { apiGetInquiryGroupCounts } from "../../services/inquiry.service";
import {
  accountCacheKey,
  accountCacheRequest,
  getAccountCache,
  setAccountCache,
  invalidateAccountCache,
} from "../../utils/accountQueryCache";

const GROUPS = [
  ["requests", "ri-inbox-line"],
  ["confirmed", "ri-checkbox-circle-line"],
  ["preparation", "ri-loader-2-line"],
  ["in-progress", "ri-exchange-line"],
  ["completed", "ri-check-double-line"],
  ["cancelled", "ri-close-circle-line"],
];

export default function ProfileTransactions() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);
  const lastReloadRef = useRef(0);
  const labels = {
    requests: t("profile.transactions.requests"),
    confirmed: t("profile.transactions.confirmed"),
    preparation: t("profile.transactions.preparation"),
    "in-progress": t("profile.transactions.inProgress"),
    completed: t("profile.transactions.completed"),
    cancelled: t("profile.transactions.cancelled"),
  };
  useEffect(() => {
    if (!user?.uid) return undefined;
    const key = accountCacheKey(user.uid, "inquiry-group-counts");
    let cancelled = false;
    const load = (force = false) => {
      if (force) lastReloadRef.current = Date.now();
      const cached = !force && getAccountCache(key, 60 * 1000);
      if (cached) {
        setCounts(cached);
        return;
      }
      accountCacheRequest(key, apiGetInquiryGroupCounts)
        .then((value) => {
          if (!cancelled) {
            setAccountCache(key, value);
            setCounts(value);
          }
        })
        .catch(() => {
          if (!cancelled) setCounts(null);
        });
    };
    const handleInvalidation = (event) => {
      if (event.detail?.uid !== user.uid) return;
      if (Date.now() - lastReloadRef.current < 3000) return;
      lastReloadRef.current = Date.now();
      invalidateAccountCache(key);
      setCounts(null);
      load(true);
    };
    load();
    lastReloadRef.current = Date.now();
    window.addEventListener(
      "agrinet:inquiry-counts-invalidated",
      handleInvalidation,
    );
    return () => {
      cancelled = true;
      window.removeEventListener(
        "agrinet:inquiry-counts-invalidated",
        handleInvalidation,
      );
    };
  }, [user?.uid]);
  return (
    <section
      aria-labelledby="profile-transactions"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="profile-transactions"
          className="text-sm font-bold text-(--agri-text)"
        >
          {t("profile.transactions.title")}
        </h2>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-[#2D6A4F] hover:underline dark:text-(--agri-brand)"
        >
          {t("profile.transactions.open")}
        </Link>
      </div>
      <nav
        aria-label={t("profile.transactions.title")}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {GROUPS.map(([group, icon]) => (
          <Link
            key={group}
            to={`/transactions?group=${encodeURIComponent(group)}`}
            className="flex min-h-16 items-center gap-2 rounded-xl border border-(--agri-border) bg-(--agri-card) px-3 py-2 text-xs font-semibold text-(--agri-text-secondary) transition hover:border-[#2D6A4F]/50 hover:text-[#2D6A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:hover:text-(--agri-brand)"
          >
            <i
              aria-hidden="true"
              className={`${icon} text-lg text-[#2D6A4F] dark:text-(--agri-brand)`}
            />
            <span>{labels[group]}</span>
            {counts && Number(counts[group] || 0) > 0 && (
              <span
                className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold tabular-nums text-white"
                aria-label={`${counts[group]} ${t("profile.transactions.countLabel")}`}
              >
                {counts[group] > 99 ? "99+" : counts[group]}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </section>
  );
}
