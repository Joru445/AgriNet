import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { listDeviceSessions, logoutAllDeviceSessions, logoutOtherDeviceSessions, revokeDeviceSession } from "../../services/deviceSessionApi.service";
import { clearDeviceSession } from "../../services/deviceSession.service";
import { showToast } from "../../utils/toast";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import ErrorState from "../ui/ErrorState";
import Loading from "../ui/Loading";
import ResponsiveModal from "../ui/ResponsiveModal";
import StatusBadge from "../ui/StatusBadge";

function deviceIcon(category) {
  return category === "mobile" ? "ri-smartphone-line" : category === "tablet" ? "ri-tablet-line" : "ri-computer-line";
}

function formatDate(value, lang) {
  const date = value && new Date(value);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "fil" ? "fil-PH" : "en-PH", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function SessionCard({ session, onView, onLogout, t, lang }) {
  return <li className="flex gap-3 px-4 py-4 sm:items-center">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--agri-brand-bg) text-(--agri-brand)"><i className={`${deviceIcon(session.deviceCategory)} text-xl`} aria-hidden="true" /></div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="truncate text-sm font-semibold text-(--agri-text)">{session.deviceDisplayName || `${session.browser} · ${session.operatingSystem}`}</p>
        {session.isCurrent && <StatusBadge status="active" label={t("settings.sessions.current")} size="sm" />}
        {session.status !== "active" && <StatusBadge status="revoked" label={t("settings.sessions.revoked")} size="sm" />}
      </div>
      <p className="mt-0.5 text-xs text-(--agri-text-muted)">{session.browser} · {session.operatingSystem} · {t(`settings.sessions.${session.deviceCategory}`)}</p>
      <p className="mt-1 text-xs text-(--agri-text-secondary)">{t("settings.sessions.lastActive", { date: formatDate(session.lastActivityAt, lang) })}</p>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => onView(session)} className="flex h-9 w-9 items-center justify-center rounded-lg text-(--agri-text-muted) transition hover:bg-(--agri-hover) hover:text-(--agri-text)" aria-label={t("settings.sessions.viewDetails")}><i className="ri-information-line text-lg" /></button>
      {session.status === "active" && <button type="button" onClick={() => onLogout(session)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-500/10 dark:text-red-400" aria-label={t("settings.sessions.logoutDevice")}><i className="ri-logout-box-r-line text-lg" /></button>}
    </div>
  </li>;
}

export default function DeviceSessions() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true); setError("");
    try { setSessions(await listDeviceSessions()); }
    catch (cause) { setError(cause.message || t("settings.sessions.loadFailed")); }
    finally { setLoading(false); }
  }, [t, user?.uid]);

  useEffect(() => { refresh(); }, [refresh]);

  async function confirmAction() {
    if (!pendingAction || submitting) return;
    setSubmitting(true);
    try {
      if (pendingAction.type === "one") {
        await revokeDeviceSession(pendingAction.session.id);
        if (pendingAction.session.isCurrent) {
          clearDeviceSession(user.uid);
          await logout();
          return;
        }
      } else if (pendingAction.type === "others") {
        await logoutOtherDeviceSessions();
      } else {
        await logoutAllDeviceSessions();
        clearDeviceSession(user.uid);
        await logout();
        return;
      }
      showToast.success(t("settings.sessions.updated"));
      setPendingAction(null); setSelected(null);
      await refresh();
    } catch (cause) { showToast.error(cause.message || t("settings.sessions.actionFailed")); }
    finally { setSubmitting(false); }
  }

  const hasOtherActiveSessions = sessions.some((session) => session.status === "active" && !session.isCurrent);
  const copy = pendingAction?.type === "all"
    ? [t("settings.sessions.logoutAll"), t("settings.sessions.logoutAllConfirm")]
    : pendingAction?.type === "others"
      ? [t("settings.sessions.logoutOthers"), t("settings.sessions.logoutOthersConfirm")]
      : [t("settings.sessions.logoutDevice"), t("settings.sessions.logoutDeviceConfirm")];

  return <section>
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--agri-text-muted)">{t("settings.sessions.heading")}</h2>
    <div className="overflow-hidden rounded-xl border border-(--agri-border) bg-(--agri-card) shadow-sm">
      <div className="flex items-start gap-3 border-b border-(--agri-border-subtle) px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--agri-brand-bg) text-(--agri-brand)"><i className="ri-shield-user-line text-xl" /></div>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-(--agri-text)">{t("settings.sessions.title")}</h3><p className="mt-0.5 text-xs text-(--agri-text-secondary)">{t("settings.sessions.description")}</p></div>
        <button type="button" onClick={refresh} className="flex h-9 w-9 items-center justify-center rounded-lg text-(--agri-text-muted) hover:bg-(--agri-hover)" aria-label={t("settings.sessions.refresh")}><i className="ri-refresh-line text-lg" /></button>
      </div>
      {loading ? <div className="py-8"><Loading /></div> : error ? <div className="p-4"><ErrorState message={error} onRetry={refresh} /></div> : sessions.length === 0 ? <p className="px-4 py-8 text-center text-sm text-(--agri-text-muted)">{t("settings.sessions.empty")}</p> : <ul className="divide-y divide-(--agri-border-subtle)">{sessions.map((session) => <SessionCard key={session.id} session={session} onView={setSelected} onLogout={(item) => setPendingAction({ type: "one", session: item })} t={t} lang={lang} />)}</ul>}
      <div className="flex flex-col gap-2 border-t border-(--agri-border-subtle) p-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="sm" disabled={loading || !hasOtherActiveSessions} onClick={() => setPendingAction({ type: "others" })}>{t("settings.sessions.logoutOthers")}</Button>
        <Button variant="danger" size="sm" disabled={loading || sessions.length === 0} onClick={() => setPendingAction({ type: "all" })}>{t("settings.sessions.logoutAll")}</Button>
      </div>
      <p className="border-t border-(--agri-border-subtle) px-4 py-3 text-[11px] leading-relaxed text-(--agri-text-muted)">{t("settings.sessions.scopeNotice")}</p>
    </div>
    <ResponsiveModal open={Boolean(selected)} onClose={() => setSelected(null)} title={t("settings.sessions.detailsTitle")} maxWidth="max-w-md">
      {selected && <dl className="space-y-3 p-1 text-sm">
        <div><dt className="text-(--agri-text-muted)">{t("settings.sessions.device")}</dt><dd className="font-medium text-(--agri-text)">{selected.browser} · {selected.operatingSystem}</dd></div>
        <div><dt className="text-(--agri-text-muted)">{t("settings.sessions.signedIn")}</dt><dd className="font-medium text-(--agri-text)">{formatDate(selected.createdAt, lang)}</dd></div>
        <div><dt className="text-(--agri-text-muted)">{t("settings.sessions.lastActiveLabel")}</dt><dd className="font-medium text-(--agri-text)">{formatDate(selected.lastActivityAt, lang)}</dd></div>
        <div><dt className="text-(--agri-text-muted)">{t("settings.sessions.location")}</dt><dd className="font-medium text-(--agri-text)">{t("settings.sessions.locationUnavailable")}</dd></div>
      </dl>}
    </ResponsiveModal>
    <ConfirmDialog open={Boolean(pendingAction)} onClose={() => setPendingAction(null)} onConfirm={confirmAction} title={copy[0]} description={copy[1]} icon="ri-logout-box-r-line" danger loading={submitting} confirmLabel={t("settings.sessions.confirmLogout")} />
  </section>;
}
