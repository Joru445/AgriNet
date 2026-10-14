import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ThemeToggle from "../../components/settings/ThemeToggle";
import LanguageSelector from "../../components/settings/LanguageSelector";
import PushNotificationManager from "../../components/notifications/PushNotificationManager";
import NotificationPreferences from "../../components/notifications/NotificationPreferences";
import LogoutConfirmModal from "../../components/settings/LogoutConfirmModal";
import ConnectedAccounts from "../../components/settings/ConnectedAccounts";
import UserIdentity from "../../components/ui/UserIdentity";
import FarmerVerification from "../../components/farmer/verification/FarmerVerification";
import AccountSwitcher from "../../components/settings/AccountSwitcher";
import PasskeyManager from "../../components/settings/PasskeyManager";
import DeviceSessions from "../../components/settings/DeviceSessions";
import Button from "../../components/ui/Button";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { usePWAUpdate } from "../../hooks/usePWAUpdate";
import useMediaQuery from "../../hooks/useMediaQuery";
import { getMePath } from "../../utils/routes";
import { showToast } from "../../utils/toast";
import LoginRequired from "../../components/ui/LoginRequired";
import Loading from "../../components/ui/Loading";

const CATEGORIES = [
  { id: "accounts", icon: "ri-user-3-line" },
  { id: "security", icon: "ri-shield-check-line" },
  { id: "notifications", icon: "ri-notification-3-line" },
  { id: "preferences", icon: "ri-settings-4-line" },
  { id: "about", icon: "ri-information-line" },
];

function SectionHeading({ children, className = "" }) {
  return (
    <h2
      className={`mb-2 text-xs font-semibold uppercase tracking-wider text-(--agri-text-muted) ${className}`}
    >
      {children}
    </h2>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-(--agri-border) bg-(--agri-card) shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function getSettingsBase(pathname) {
  if (pathname.startsWith("/admin/settings")) return "/admin/settings";
  if (pathname.startsWith("/farmer/settings")) return "/farmer/settings";
  return "/settings";
}

function getSettingsPath(pathname, basePath) {
  return pathname.slice(basePath.length).replace(/^\/+|\/+$/g, "");
}

function CategoryLink({ category, basePath, active, compact = false, t }) {
  const label = t(`settings.categories.${category.id}`);
  const description = t(`settings.categoryDescriptions.${category.id}`);
  const className = active
    ? "border-(--agri-brand) bg-(--agri-brand-bg) text-(--agri-brand)"
    : "border-transparent text-(--agri-text-secondary) hover:bg-(--agri-hover) hover:text-(--agri-text)";

  return (
    <Link
      to={`${basePath}/${category.id}`}
      className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--agri-brand) ${className}`}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-(--agri-card)" : "bg-(--agri-hover) text-(--agri-text-muted) group-hover:text-(--agri-brand)"}`}
      >
        <i className={`${category.icon} text-lg`} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {compact && (
          <span className="mt-0.5 block truncate text-xs text-(--agri-text-muted)">
            {description}
          </span>
        )}
      </span>
      {compact && (
        <i
          className="ri-arrow-right-s-line text-lg text-(--agri-text-muted)"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

function AccountsContent({ profile, mePath, onLogout, t }) {
  return (
    <div className="space-y-6">
      <section>
        <SectionHeading>{t("settings.account")}</SectionHeading>
        <SectionCard>
          <Link
            to={mePath}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-(--agri-hover)"
          >
            <UserIdentity
              user={profile}
              onlyPic
              size="md"
              className="shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-(--agri-text)">
                {t("settings.myProfile")}
              </span>
              <span className="block truncate text-xs text-(--agri-text-muted)">
                {profile.fullname || `@${profile.username || ""}`}
              </span>
            </span>
            <i
              className="ri-arrow-right-s-line shrink-0 text-(--agri-text-muted)"
              aria-hidden="true"
            />
          </Link>
        </SectionCard>
      </section>
      <AccountSwitcher />
      <section>
        <SectionHeading>{t("settings.logout")}</SectionHeading>
        <SectionCard>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-500/10"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40">
              <i className="ri-logout-box-line text-lg" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-red-500">
                {t("common.logout")}
              </span>
            </span>
            <i
              className="ri-arrow-right-s-line shrink-0 text-(--agri-text-muted)"
              aria-hidden="true"
            />
          </button>
        </SectionCard>
      </section>
    </div>
  );
}

function SecurityContent({ profile, basePath, devicesOnly, t }) {
  if (devicesOnly)
    return (
      <section>
        <SectionHeading>{t("settings.sessions.heading")}</SectionHeading>
        <DeviceSessions />
      </section>
    );
  return (
    <div className="space-y-6">
      <section>
        <SectionHeading>{t("settings.security")}</SectionHeading>
        <SectionCard>
          <PasskeyManager embedded />
          <div className="border-t border-(--agri-border-subtle)">
            <ConnectedAccounts />
          </div>
        </SectionCard>
      </section>
      <section>
        <SectionHeading>{t("settings.sessions.heading")}</SectionHeading>
        <SectionCard>
          <Link
            to={`${basePath}/security/devices`}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-(--agri-hover)"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--agri-brand-bg) text-(--agri-brand)">
              <i className="ri-device-line text-lg" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-(--agri-text)">
                {t("settings.sessions.title")}
              </span>
              <span className="block text-xs text-(--agri-text-muted)">
                {t("settings.sessions.description")}
              </span>
            </span>
            <i
              className="ri-arrow-right-s-line shrink-0 text-(--agri-text-muted)"
              aria-hidden="true"
            />
          </Link>
        </SectionCard>
      </section>
      {profile.role === "farmer" && <FarmerVerification />}
    </div>
  );
}

function NotificationsContent({ pushSubscribed, onSubscriptionChange, t }) {
  return (
    <section>
      <SectionHeading>{t("settings.notifications")}</SectionHeading>
      <SectionCard className="divide-y divide-(--agri-border-subtle)">
        <div className="p-4">
          <PushNotificationManager
            onSubscriptionChange={onSubscriptionChange}
          />
        </div>
        <div className="p-4">
          <p
            className={`mb-3 text-xs font-semibold ${pushSubscribed ? "text-(--agri-text-secondary)" : "text-gray-400"}`}
          >
            {t("notificationPreferences.title")}
          </p>
          <NotificationPreferences pushEnabled={pushSubscribed} />
        </div>
      </SectionCard>
    </section>
  );
}

function PreferencesContent({ t }) {
  return (
    <section data-onboarding="settings-preferences">
      <SectionHeading>{t("settings.preferences")}</SectionHeading>
      <SectionCard className="divide-y divide-(--agri-border-subtle)">
        <LanguageSelector compact />
        <ThemeToggle compact />
      </SectionCard>
    </section>
  );
}

function AboutContent({
  needRefresh,
  isChecking,
  checkForUpdate,
  updateServiceWorker,
  startTour,
  t,
}) {
  return (
    <div className="space-y-6">
      <section>
        <SectionHeading>{t("settings.appUpdate")}</SectionHeading>
        <SectionCard>
          <div className="flex items-center gap-3 px-4 py-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${needRefresh ? "bg-(--agri-brand-bg) text-(--agri-brand)" : "bg-(--agri-hover) text-(--agri-text-muted)"}`}
            >
              <i
                className={`${needRefresh || isChecking ? "ri-loader-4-line animate-spin" : "ri-check-line"} text-lg`}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-(--agri-text)">
                {needRefresh
                  ? t("settings.updateAvailable")
                  : t("settings.upToDate")}
              </p>
              <p className="text-xs text-(--agri-text-muted)">
                {needRefresh
                  ? t("settings.updateDescription")
                  : t("settings.upToDateDescription")}
              </p>
            </div>
            {needRefresh ? (
              <Button size="sm" onClick={() => updateServiceWorker(true)}>
                {t("settings.update")}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                loading={isChecking}
                onClick={checkForUpdate}
              >
                {t("settings.checkForUpdates")}
              </Button>
            )}
          </div>
        </SectionCard>
      </section>
      <section>
        <SectionHeading>{t("settings.tutorial")}</SectionHeading>
        <SectionCard>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--agri-brand-bg) text-(--agri-brand)">
              <i className="ri-question-line text-lg" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-(--agri-text)">
                {t("settings.replayTutorial")}
              </p>
              <p className="text-xs text-(--agri-text-muted)">
                {t("settings.replayTutorialDescription")}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={startTour}>
              {t("settings.replay")}
            </Button>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}

export default function Settings() {
  const { user, profile, logout, authInitializing } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { needRefresh, isChecking, checkForUpdate, updateServiceWorker } =
    usePWAUpdate();
  const { startTour } = useOnboarding();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  if (authInitializing) return <Loading />;
  if (!user) return <LoginRequired title={t("settings.title")} />;
  if (!profile) return null;

  const basePath = getSettingsBase(pathname);
  const settingPath = getSettingsPath(pathname, basePath);
  const [requestedCategory, childPath] = settingPath.split("/");
  const category = CATEGORIES.some(({ id }) => id === requestedCategory)
    ? requestedCategory
    : "accounts";
  const isMobileIndex = !isDesktop && !requestedCategory;
  const isDevicesPage = category === "security" && childPath === "devices";
  const mePath = getMePath(profile.role);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      showToast.success(t("common.loggedOut"));
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const content =
    category === "accounts" ? (
      <AccountsContent
        profile={profile}
        mePath={mePath}
        onLogout={() => setShowLogoutModal(true)}
        t={t}
      />
    ) : category === "security" ? (
      <SecurityContent
        profile={profile}
        basePath={basePath}
        devicesOnly={isDevicesPage}
        t={t}
      />
    ) : category === "notifications" ? (
      <NotificationsContent
        pushSubscribed={pushSubscribed}
        onSubscriptionChange={setPushSubscribed}
        t={t}
      />
    ) : category === "preferences" ? (
      <PreferencesContent t={t} />
    ) : (
      <AboutContent
        needRefresh={needRefresh}
        isChecking={isChecking}
        checkForUpdate={checkForUpdate}
        updateServiceWorker={updateServiceWorker}
        startTour={startTour}
        t={t}
      />
    );

  return (
    <main className="mx-auto w-full max-w-6xl p-4 pb-8 md:p-6">
      {isMobileIndex ? (
        <>
          <header className="mb-6">
            <h1 className="text-xl font-bold text-(--agri-text)">
              {t("settings.title")}
            </h1>
            <p className="mt-0.5 text-sm text-(--agri-text-muted)">
              {t("settings.subtitle")}
            </p>
          </header>
          <SectionCard className="mb-4">
            <Link
              to={mePath}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-(--agri-hover)"
            >
              <UserIdentity
                user={profile}
                onlyPic
                size="md"
                className="shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-(--agri-text)">
                  {profile.fullname || profile.username}
                </span>
                <span className="block truncate text-xs text-(--agri-text-muted)">
                  {t(`roles.${profile.role}`)}
                </span>
              </span>
              <i
                className="ri-arrow-right-s-line text-(--agri-text-muted)"
                aria-hidden="true"
              />
            </Link>
          </SectionCard>
          <nav className="space-y-2" aria-label={t("settings.title")}>
            {CATEGORIES.map((item) => (
              <CategoryLink
                key={item.id}
                category={item}
                basePath={basePath}
                compact
                t={t}
              />
            ))}
          </nav>
        </>
      ) : (
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <header className="mb-5">
                <h1 className="text-xl font-bold text-(--agri-text)">
                  {t("settings.title")}
                </h1>
                <p className="mt-0.5 text-sm text-(--agri-text-muted)">
                  {t("settings.subtitle")}
                </p>
              </header>
              <nav className="space-y-1" aria-label={t("settings.title")}>
                {CATEGORIES.map((item) => (
                  <CategoryLink
                    key={item.id}
                    category={item}
                    basePath={basePath}
                    active={category === item.id}
                    t={t}
                  />
                ))}
              </nav>
            </div>
          </aside>
          <section className="mx-auto w-full max-w-2xl">
            {!isDesktop && (
              <header className="mb-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(isDevicesPage ? `${basePath}/security` : basePath)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-(--agri-text-secondary) transition hover:bg-(--agri-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--agri-brand)"
                  aria-label={t("common.back")}
                >
                  <i
                    className="ri-arrow-left-line text-lg"
                    aria-hidden="true"
                  />
                </button>
                <div>
                  <p className="text-xl font-bold text-(--agri-text)">
                    {isDevicesPage
                      ? t("settings.sessions.title")
                      : t(`settings.categories.${category}`)}
                  </p>
                  <p className="text-sm text-(--agri-text-muted)">
                    {isDevicesPage
                      ? t("settings.sessions.description")
                      : t(`settings.categoryDescriptions.${category}`)}
                  </p>
                </div>
              </header>
            )}
            {isDesktop && (
              <header className="mb-6">
                <h2 className="text-xl font-bold text-(--agri-text)">
                  {isDevicesPage
                    ? t("settings.sessions.title")
                    : t(`settings.categories.${category}`)}
                </h2>
                <p className="mt-0.5 text-sm text-(--agri-text-muted)">
                  {isDevicesPage
                    ? t("settings.sessions.description")
                    : t(`settings.categoryDescriptions.${category}`)}
                </p>
              </header>
            )}
            {content}
          </section>
        </div>
      )}
      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}
