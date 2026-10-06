import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

import LocationMap from "./LocationMap";
import Button from "../ui/Button";

import {
  getCurrentPosition,
  reverseGeocode,
  searchLocation,
} from "../../utils/location";
import { setCachedLocation } from "../../utils/locationCache";
import { showToast } from "../../utils/toast";

export default function LocationPicker({
  editing,
  value,
  onProfile = false,
  onChange,
  hideLabel = false,
  hideCoordinates = false,
  onDetectingChange,
}) {
  const { t } = useLanguage();
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Manual search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Manual address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState(value?.address || "");

  useEffect(() => {
    if (value?.address) {
      setCustomAddress(value.address);
    }
  }, [value?.address]);

  // Debounced search for manual location search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocation(trimmed);
      if (active) {
        setSearchResults(results);
        setIsSearching(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Click outside to dismiss search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSearchResult(item) {
    const nextLocation = {
      lat: item.lat,
      lng: item.lng,
      address: item.address,
    };
    setCachedLocation(nextLocation);
    onChange?.(nextLocation);
    setSearchQuery("");
    setSearchResults([]);
    showToast.success(t("location.locationDetectedSuccess"));
  }

  function handleSaveCustomAddress() {
    const trimmed = customAddress.trim();
    if (!trimmed || !value) return;
    onChange?.({
      ...value,
      address: trimmed,
    });
    setIsEditingAddress(false);
  }

  async function handleUseCurrentLocation() {
    if (loadingLocation) return;
    setLoadingLocation(true);
    onDetectingChange?.(true);

    try {
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.lat, position.lng);
      const nextLocation = {
        lat: position.lat,
        lng: position.lng,
        address,
      };

      setCachedLocation(nextLocation);
      onChange?.(nextLocation);
      showToast.success(t("location.locationDetectedSuccess"));
    } catch (error) {
      console.warn("Location detection error:", error);
      if (error?.code === 1) {
        showToast.error(t("location.permissionDenied"));
      } else {
        showToast.error(t("location.detectFailed"));
      }
    } finally {
      setLoadingLocation(false);
      onDetectingChange?.(false);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {!hideLabel && (
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {t("location.farmLocation")}
        </label>
      )}

      {/* Manual Search Bar */}
      {editing && (
        <div ref={searchRef} className="relative">
          <div className="relative flex items-center">
            <i className="ri-search-line absolute left-3.5 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("location.searchPlaceholder")}
              className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-(--agri-card) border border-(--agri-border) rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <i className="ri-close-line text-sm" />
              </button>
            )}
          </div>

          {/* Search loading */}
          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 z-9999 bg-white dark:bg-(--agri-card) border border-(--agri-border) rounded-xl shadow-lg p-3 text-xs text-gray-500 flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin text-sm text-[#2D6A4F]" />
              <span>{t("location.searching")}</span>
            </div>
          )}

          {/* Search results dropdown */}
          {!isSearching && searchResults.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 z-9999 max-h-52 overflow-y-auto bg-white dark:bg-(--agri-card) border border-(--agri-border) rounded-xl shadow-xl py-1 divide-y divide-gray-100 dark:divide-neutral-800">
              {searchResults.map((item, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-green-50/80 dark:hover:bg-neutral-800/80 flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <i className="ri-map-pin-2-line text-[#2D6A4F] mt-0.5 shrink-0 text-sm" />
                    <span className="line-clamp-2 text-gray-700 dark:text-gray-200">
                      {item.address}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Map */}
      <LocationMap
        editing={editing}
        value={value}
        onProfile={onProfile}
        onChange={onChange}
        actionButton={
          editing ? (
            <Button
              variant="primary"
              size="sm"
              icon="ri-focus-3-line"
              loading={loadingLocation}
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              aria-label={t("location.useMyLocationAria")}
              className="h-10 rounded-xl shadow-lg"
            />
          ) : null
        }
      />

      {/* Selected / Edited Address */}
      {value?.address && (
        <div className="rounded-xl border border-green-200 bg-green-50/90 dark:bg-emerald-950/20 dark:border-emerald-800/40 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {t("location.selectedAddress")}
            </span>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  if (isEditingAddress) {
                    handleSaveCustomAddress();
                  } else {
                    setIsEditingAddress(true);
                  }
                }}
                className="text-xs font-medium text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <i className={isEditingAddress ? "ri-check-line" : "ri-edit-line"} />
                <span>
                  {isEditingAddress
                    ? t("location.saveAddress")
                    : t("location.editAddress")}
                </span>
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder={t("location.manualAddressPlaceholder")}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-green-300 dark:border-emerald-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveCustomAddress();
                  }
                }}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveCustomAddress}
                className="h-8 px-3 text-xs"
              >
                {t("location.saveAddress")}
              </Button>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-[#2D6A4F] dark:text-emerald-300 flex items-start gap-1.5">
              <i className="ri-map-pin-line mt-0.5 shrink-0" />
              <span className="leading-snug">{value.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Manual Click/Search Hint */}
      {editing && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <i className="ri-information-line text-xs shrink-0" />
          <span>{t("location.clickMapHint")}</span>
        </p>
      )}

      {!hideCoordinates && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">{t("location.latitude")}</label>

            <input
              readOnly
              value={value?.lat?.toFixed(6) ?? ""}
              className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">{t("location.longitude")}</label>

            <input
              readOnly
              value={value?.lng?.toFixed(6) ?? ""}
              className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}