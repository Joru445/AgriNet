import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getFavorites } from "../../services/favorite.service";
import { getProducts } from "../../services/product.service";
import { getFarmers } from "../../services/farmer.service";

import ProductCard from "../../components/common/ProductCard";
import EmptyState from "../../components/ui/EmptyState";
import LoginRequired from "../../components/ui/LoginRequired";
import Loading from "../../components/Loading";

import {
  applyTransform,
  PRODUCT_THUMB_TF,
  isCloudinaryUrl,
} from "../../utils/cloudinaryTransform";

export default function Favorites() {
  const { user, authInitializing } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { items } = await getFavorites(1, 100);
        const productIds = items
          .filter((f) => f.type === "product")
          .map((f) => f.targetId);
        const farmerIds = items
          .filter((f) => f.type === "farmer")
          .map((f) => f.targetId);

        const [allProducts, allFarmers] = await Promise.all([
          getProducts(),
          getFarmers(),
        ]);

        if (!cancelled) {
          setProducts(
            allProducts.filter((p) => productIds.includes(p.id)),
          );
          setFarmers(
            allFarmers.filter((f) => farmerIds.includes(f.id || f.uid)),
          );
        }
      } catch {
        if (!cancelled) {
          setError(t("favorites.loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  if (authInitializing) {
    return <Loading />;
  }

  if (!user) {
    return <LoginRequired title={t("favorites.title")} />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-[var(--agri-text)] mb-4">
        {t("favorites.title")}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--agri-border-subtle)]">
        <button
          type="button"
          onClick={() => setTab("products")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer
            ${tab === "products"
              ? "border-[#2D6A4F] text-[#2D6A4F]"
              : "border-transparent text-[var(--agri-text-muted)] hover:text-[var(--agri-text)]"
            }
          `}
        >
          <i className="ri-shopping-bag-3-line mr-1" />
          {t("favorites.products")} ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("farmers")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer
            ${tab === "farmers"
              ? "border-[#2D6A4F] text-[#2D6A4F]"
              : "border-transparent text-[var(--agri-text-muted)] hover:text-[var(--agri-text)]"
            }
          `}
        >
          <i className="ri-store-2-line mr-1" />
          {t("favorites.farmers")} ({farmers.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] h-64 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="ri-error-warning-line"
          title={t("common.error")}
          description={error}
        />
      ) : tab === "products" ? (
        products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="ri-heart-line"
            title={t("favorites.noProducts")}
            description={t("favorites.noProductsDesc")}
          />
        )
      ) : farmers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.map((farmer) => (
            <FarmerCard key={farmer.id || farmer.uid} farmer={farmer} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="ri-heart-line"
          title={t("favorites.noFarmers")}
          description={t("favorites.noFarmersDesc")}
        />
      )}
    </main>
  );
}

function FarmerCard({ farmer }) {
  const name = farmer.storeName || farmer.fullname || farmer.username || "Farmer";
  const location = [farmer.barangay, farmer.municipality].filter(Boolean).join(", ");

  return (
    <Link
      to={`/profile/${farmer.id || farmer.uid}`}
      className="flex items-center gap-4 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md anim-fade-in"
    >
      <div className="h-14 w-14 shrink-0 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center overflow-hidden">
        {farmer.profilePicture ? (
          <img
            src={
              isCloudinaryUrl(farmer.profilePicture)
                ? applyTransform(farmer.profilePicture, PRODUCT_THUMB_TF)
                : farmer.profilePicture
            }
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-lg font-bold text-[#2D6A4F]">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-[var(--agri-text)] truncate">
          {name}
        </h3>
        {location && (
          <p className="text-xs text-[var(--agri-text-muted)] truncate flex items-center gap-1 mt-0.5">
            <i className="ri-map-pin-line text-[#2D6A4F]" />
            {location}
          </p>
        )}
      </div>

      <i className="ri-arrow-right-s-line text-[var(--agri-text-muted)] shrink-0" />
    </Link>
  );
}
