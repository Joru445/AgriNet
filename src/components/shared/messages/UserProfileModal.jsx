import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firestore";
import { getUserProfile } from "../../../services/user.service";

import RoleBadge from "../../common/RoleBadge";
import ImageViewerModal from "../../common/ImageViewerModal";
import ReportModal from "../../common/ReportModal";
import { useAuth } from "../../../context/AuthContext";

function formatDate(timestamp) {
  if (!timestamp) return "Not available";
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return "Not available";
}

export default function UserProfileModal({ user: initialUser, onClose }) {
  const { profile } = useAuth();
  const [profileData, setProfileData] = useState(initialUser);
  const [stats, setStats] = useState({
    loading: true,
    completedDeals: 0,
    totalDeals: 0,
  });
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const targetUid = initialUser?.uid || initialUser?.id;

  useEffect(() => {
    if (!targetUid) {
      setStats({ loading: false, completedDeals: 0, totalDeals: 0 });
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        let freshUser = null;
        try {
          freshUser = await getUserProfile(targetUid);
          if (freshUser && isMounted) {
            setProfileData((prev) => ({ ...prev, ...freshUser }));
          }
        } catch (_) {}

        let completed = freshUser?.completedDeals ?? 0;
        let total = freshUser?.totalDeals ?? 0;
        const cancelled = freshUser?.cancelledDeals ?? 0;

        if (total === 0 && (completed > 0 || cancelled > 0)) {
          total = completed + cancelled;
        }

        // Direct inquiry query fallback
        if (completed === 0 && total === 0) {
          try {
            const inqRef = collection(db, "inquiries");
            const q = query(inqRef, where("consumerId", "==", targetUid));
            const inqSnap = await getDocs(q);
            if (isMounted && !inqSnap.empty) {
              total = inqSnap.size;
              completed = inqSnap.docs.filter((d) => d.data().status === "completed").length;
            }
          } catch (inqErr) {
            console.warn("Inquiries query:", inqErr);
          }
        }

        if (completed === 0 && total === 0) {
          try {
            const revRef = collection(db, "reviews");
            const qRev = query(revRef, where("reviewerId", "==", targetUid));
            const revSnap = await getDocs(qRev);
            if (isMounted && !revSnap.empty) {
              completed = revSnap.size;
              total = revSnap.size;
            }
          } catch (revErr) {
            console.warn("Reviews query:", revErr);
          }
        }

        if (isMounted) {
          setStats({
            loading: false,
            completedDeals: completed,
            totalDeals: total > 0 ? total : completed,
          });
        }
      } catch (err) {
        console.error("Failed to load consumer stats:", err);
        if (isMounted) {
          setStats({ loading: false, completedDeals: 0, totalDeals: 0 });
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [targetUid]);

  const user = profileData || initialUser;
  if (!user) return null;

  const isTrusted = stats.completedDeals >= 6 || user.verified;
  const isActive = stats.completedDeals > 0 && stats.completedDeals < 6;

  const completionRate =
    stats.totalDeals > 0
      ? Math.round((stats.completedDeals / stats.totalDeals) * 100)
      : (stats.completedDeals === 0 ? 100 : 100);

  const fullLocation = [user.barangay, user.municipality || user.address]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Consumer Profile
            </h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500">
              Buyer verification & account details
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {profile?.uid && profile?.uid !== targetUid && (
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                title="Report this user"
                aria-label="Report user"
              >
                <i className="ri-shield-alert-line text-lg" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
              aria-label="Close"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </div>

        {/* Profile Card / Avatar */}
        <div className="flex flex-col items-center text-center pt-4 pb-2.5">
          <div className="relative mb-2.5">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullname}
                onClick={() =>
                  setFullscreenImage({
                    src: user.profilePicture,
                    title: `${user.fullname || user.username}'s Profile Picture`,
                  })
                }
                className="h-18 w-18 rounded-full object-cover ring-3 ring-[#D8F3DC] cursor-pointer hover:opacity-90 transition"
                title="Click to view photo"
              />
            ) : (
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[#D8F3DC] text-xl font-black text-[#2D6A4F] ring-3 ring-[#D8F3DC]/40">
                {user.fullname
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
            )}

            {user.verified && (
              <span
                className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A4F] text-white ring-2 ring-white"
                title="Verified Account"
              >
                <i className="ri-check-line text-[10px] font-bold" />
              </span>
            )}
          </div>

          <h4 className="text-base sm:text-lg font-bold text-gray-900">
            {user.fullname}
          </h4>

          <p className="text-xs font-medium text-gray-500 mb-2">
            @{user.username || "user"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <RoleBadge role={user.role || "consumer"} />

            {/* Buyer Trust Status Badge */}
            {!stats.loading && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isTrusted
                    ? "bg-emerald-50 text-[#1B4332] border-emerald-300"
                    : isActive
                      ? "bg-green-50 text-[#2D6A4F] border-green-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <i
                  className={`text-xs ${
                    isTrusted
                      ? "ri-shield-check-fill text-emerald-600"
                      : isActive
                        ? "ri-checkbox-circle-fill text-green-600"
                        : "ri-seedling-fill text-amber-600"
                  }`}
                />
                {isTrusted
                  ? "Trusted Buyer"
                  : isActive
                    ? "Active Buyer"
                    : "New Consumer"}
              </span>
            )}
          </div>
        </div>

        {/* Farmer Trust Summary Card */}
        <div className="my-2.5 p-3 rounded-2xl bg-[#E8F5EE]/70 border border-[#CDE5D6]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-[#1B4332] flex items-center gap-1">
              <i className="ri-shield-user-line text-sm text-[#2D6A4F]" />
              <span>Buyer Trust & Transaction History</span>
            </span>

            {isTrusted && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200/60">
                Verified
              </span>
            )}
          </div>

          {stats.loading ? (
            <div className="py-2.5 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin text-sm text-[#2D6A4F]" />
              <span>Checking history...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                <p className="text-lg font-black text-[#2D6A4F]">
                  {stats.completedDeals}
                </p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                  Completed Deals
                </p>
              </div>

              <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                <p className="text-lg font-black text-[#2D6A4F]">
                  {completionRate}%
                </p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                  Success Rate
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Details List */}
        <div className="space-y-2 text-left">
          {fullLocation && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/90 border border-gray-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#2D6A4F]">
                <i className="ri-map-pin-2-line text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Location
                </p>
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {fullLocation}
                </p>
              </div>
            </div>
          )}

          {(user.phone || user.contactNumber) && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/90 border border-gray-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#2D6A4F]">
                <i className="ri-phone-line text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Phone
                </p>
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {user.phone || user.contactNumber}
                </p>
              </div>
            </div>
          )}

          {user.email && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/90 border border-gray-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#2D6A4F]">
                <i className="ri-mail-line text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Email
                </p>
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {user.createdAt && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/90 border border-gray-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#2D6A4F]">
                <i className="ri-calendar-line text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Member Since
                </p>
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Close Action Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold hover:bg-[#1B4332] active:scale-[0.99] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={Boolean(fullscreenImage)}
        src={fullscreenImage?.src}
        title={fullscreenImage?.title}
        onClose={() => setFullscreenImage(null)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="profile"
        targetId={targetUid}
        targetTitle={`User Profile of ${user.fullname || user.username}`}
        reportedUser={user}
      />
    </div>
  );
}
