import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getFavorites } from "../../services/favorite.service";
import ProductCard from "../../components/products/ProductCard";
import ProductGridSkeleton from "../../components/products/ProductGridSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import LoginRequired from "../../components/ui/LoginRequired";
import Loading from "../../components/ui/Loading";
import { getProfilePath } from "../../utils/routes";
import { accountCacheKey, accountCacheRequest, getAccountCache, setAccountCache, invalidateAccountCache } from "../../utils/accountQueryCache";
import { applyTransform, PRODUCT_THUMB_TF, isCloudinaryUrl } from "../../utils/cloudinaryTransform";

const PAGE_SIZE = 12;

export default function Favorites() {
  const { user, authInitializing } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("product");
  const [state, setState] = useState({ product: null, farmer: null });
  const stateRef = useRef(state);
  const requestVersionRef = useRef(0);
  stateRef.current = state;

  const load = useCallback(async (type, append = false, force = false) => {
    if (!user?.uid) return;
    const listenerUid = user.uid;
    const requestVersion = ++requestVersionRef.current;
    const key = accountCacheKey(listenerUid, "favorites", type);
    const cached = !append && !force && getAccountCache(key, 2 * 60 * 1000);
    if (cached) { setState((previous) => ({ ...previous, [type]: cached })); return; }
    if (append && stateRef.current[type]?.loading) return;
    setState((previous) => ({ ...previous, [type]: { ...(previous[type] || {}), loading: true, error: null } }));
    const current = stateRef.current[type] || {};
    try {
      const page = await accountCacheRequest(`${key}:${append ? (current.cursor || "next") : "first"}`, () => getFavorites({ type, limit: PAGE_SIZE, cursor: append ? current.cursor : undefined, includeTotal: !append }));
      if (requestVersion !== requestVersionRef.current || user?.uid !== listenerUid) return;
      const mergedItems = append
        ? Array.from(new Map([...(current.items || []), ...(page.items || [])].map((item) => [item.id, item])).values())
        : (page.items || []);
      const next = { ...page, total: page.total ?? current.total ?? 0, items: mergedItems, loading: false, error: null };
      setAccountCache(key, next);
      setState((previous) => ({ ...previous, [type]: next }));
    } catch (error) {
      if (requestVersion === requestVersionRef.current) setState((previous) => ({ ...previous, [type]: { ...(previous[type] || {}), loading: false, error } }));
    }
  }, [user]);

  useEffect(() => {
    requestVersionRef.current += 1;
    setState({ product: null, farmer: null });
  }, [user?.uid]);
  useEffect(() => { if (user?.uid) load(tab); }, [user?.uid, tab, load]);
  useEffect(() => {
    const onMutation = (event) => {
      const detail = event.detail;
      if (!detail || detail.uid !== user?.uid || detail.type !== tab) return;
      invalidateAccountCache(accountCacheKey(user.uid, "favorites", tab));
      if (detail.favorited) {
        load(tab, false, true);
        return;
      }
      setState((previous) => {
        const next = previous[tab];
        if (!next) return previous;
        const items = (next.items || []).filter((item) => item.targetId !== detail.targetId);
        const updated = { ...next, items, total: Math.max(0, (next.total || 0) - 1) };
        setAccountCache(accountCacheKey(user.uid, "favorites", tab), updated);
        return { ...previous, [tab]: updated };
      });
    };
    window.addEventListener("agrinet:favorite-mutated", onMutation);
    return () => window.removeEventListener("agrinet:favorite-mutated", onMutation);
  }, [user?.uid, tab, load]);
  if (authInitializing) return <Loading />;
  if (!user) return <LoginRequired title={t("favorites.title")} />;

  const current = state[tab] || {};
  const items = (current.items || []).filter((item) => item.entity);
  const retry = () => load(tab, false);
  const emptyCopy = tab === "product"
    ? { title: t("favorites.noProducts"), description: t("favorites.noProductsDesc") }
    : { title: t("favorites.noFarmers"), description: t("favorites.noFarmersDesc") };
  return (
    <main className="px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-(--agri-text)">{t("favorites.title")}</h1>
      <div className="mb-6 flex gap-2 border-b border-(--agri-border-subtle)">
        {[["product", "ri-shopping-bag-3-line", "products"], ["farmer", "ri-store-2-line", "farmers"]].map(([type, icon, label]) => (
          <button key={type} type="button" onClick={() => setTab(type)} className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === type ? "border-[#2D6A4F] text-[#2D6A4F]" : "border-transparent text-(--agri-text-muted)"}`}>
            <i className={`${icon} mr-1`} />{label === "products" ? t("favorites.products") : t("favorites.farmers")} ({state[type]?.total ?? 0})
          </button>
        ))}
      </div>
      {current.loading && !current.items ? <ProductGridSkeleton count={4} gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" /> : current.error ? (
        <EmptyState icon="ri-error-warning-line" title={t("common.error")} description={t("favorites.loadError")} action={t("common.retry")} onAction={retry} />
      ) : items.length === 0 ? (
        <EmptyState icon="ri-heart-line" title={emptyCopy.title} description={emptyCopy.description} />
      ) : tab === "product" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{items.map((item) => <ProductCard key={item.id} product={item.entity} />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <FarmerCard key={item.id} farmer={item.entity} />)}</div>
      )}
      {!current.loading && current.hasMore && <div className="mt-6 flex justify-center"><button type="button" onClick={() => load(tab, true)} className="rounded-xl border border-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-[#2D6A4F] dark:text-(--agri-brand)">{t("favorites.loadMore")}</button></div>}
    </main>
  );
}

function FarmerCard({ farmer }) {
  const name = farmer.storeName || farmer.fullname || farmer.username || "Farmer";
  const location = [farmer.barangay, farmer.municipality].filter(Boolean).join(", ");
  const profilePath = getProfilePath(farmer?.username);
  const content = <>
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2D6A4F]/10">{farmer.profilePicture ? <img src={isCloudinaryUrl(farmer.profilePicture) ? applyTransform(farmer.profilePicture, PRODUCT_THUMB_TF) : farmer.profilePicture} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <span className="text-lg font-bold text-[#2D6A4F]">{name.charAt(0).toUpperCase()}</span>}</div>
    <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-(--agri-text)">{name}</h3>{location && <p className="mt-0.5 flex truncate items-center gap-1 text-xs text-(--agri-text-muted)"><i className="ri-map-pin-line text-[#2D6A4F]" />{location}</p>}</div><i className="ri-arrow-right-s-line shrink-0 text-(--agri-text-muted)" />
  </>;
  return profilePath ? <Link to={profilePath} className="flex items-center gap-4 rounded-xl border border-(--agri-border) bg-(--agri-card) p-4 shadow-sm transition hover:border-[#2D6A4F]/40">{content}</Link> : <div className="flex items-center gap-4 rounded-xl border border-(--agri-border) bg-(--agri-card) p-4">{content}</div>;
}
