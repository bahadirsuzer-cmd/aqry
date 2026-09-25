import { Link, useRouterState } from "@tanstack/react-router";
import { AQRYO_LANGUAGES, useAqryoLocale, type AqryoLocale } from "@/lib/i18n";
import { getCurrentCreator } from "@/services/auth";
import { getUnreadAnonymousCount, getUnreadAnonymousItems, loadAnonymousInbox } from "@/services/anonymousInbox";
import { useEffect, useRef, useState } from "react";

interface CreatorNavigationProps {
  onSignOut: () => void | Promise<void>;
}

export function CreatorNavigation({ onSignOut }: CreatorNavigationProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { locale, setLocale, t } = useAqryoLocale();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission,
  );
  const lastUnreadRef = useRef(0);
  const initializedInboxRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    async function refreshInbox() {
      const creator = await getCurrentCreator();
      if (!creator || cancelled) return;

      try {
        const items = await loadAnonymousInbox(creator.id);
        const unread = getUnreadAnonymousCount(items);
        const unreadItems = getUnreadAnonymousItems(items);

        if (
          initializedInboxRef.current &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted" &&
          unread > lastUnreadRef.current &&
          unreadItems.length > 0
        ) {
          const newest = unreadItems[0];
          new Notification(
            newest.mode === "question" ? "AQRYO · Yeni soru geldi" : "AQRYO · Yeni itiraf geldi",
            {
              body: newest.message.length > 110 ? `${newest.message.slice(0, 107)}...` : newest.message,
              icon: "/aqryo-logo.png",
            },
          );
        }

        lastUnreadRef.current = unread;
        initializedInboxRef.current = true;
        if (!cancelled) setUnreadCount(unread);
      } catch (error) {
        console.error("AQRYO inbox badge yüklenemedi:", error);
      }
    }

    void refreshInbox();
    timer = window.setInterval(() => void refreshInbox(), 60_000);

    const handleRead = () => void refreshInbox();
    window.addEventListener("aqryo:inbox-read", handleRead);

    return () => {
      cancelled = true;
      if (timer !== null) window.clearInterval(timer);
      window.removeEventListener("aqryo:inbox-read", handleRead);
    };
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  const navigationItems = [
    { label: t("studio"), to: "/creator-studio", badge: 0 },
    { label: t("inbox"), to: "/creator-inbox", badge: unreadCount },
    { label: t("experiences"), to: "/creator-experiences", badge: 0 },
    { label: t("account"), to: "/creator-account", badge: 0 },
  ];

  return (
    <header className="sticky top-0 z-[100] isolate border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
        <div className="flex h-[78px] items-center justify-between gap-3">
          <Link to="/" aria-label="AQRYO" className="flex shrink-0 items-center">
            <img
              src="/aqryo-logo.png"
              alt="AQRYO"
              className="h-[38px] w-auto object-contain sm:h-[42px]"
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-1.5 md:flex">
            {navigationItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[14px] font-extrabold transition ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-background hover:text-primary"
                  }`}
                >
                  {item.label}
                  {item.badge > 0 ? (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {notificationPermission === "default" ? (
              <button
                type="button"
                onClick={() => void enableNotifications()}
                className="hidden h-11 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-3 text-[11px] font-black text-violet-700 lg:flex"
              >
                Bildirimleri aç
              </button>
            ) : null}
            <label className="hidden sm:block">
              <span className="sr-only">{t("language")}</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as AqryoLocale)}
                className="h-11 rounded-full border border-border bg-white px-3 text-[12px] font-extrabold text-foreground outline-none focus:border-primary"
              >
                {AQRYO_LANGUAGES.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </label>

            <Link
              to="/creator-studio"
              className="flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-black px-5 text-[13px] font-extrabold text-white transition hover:bg-primary"
            >
              {t("newExperience")}
            </Link>
          </div>
        </div>

        <div className="border-t border-border md:hidden">
          <nav className="-mx-3 flex items-center gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navigationItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13px] font-extrabold transition ${
                    active
                      ? "bg-primary text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {item.label}
                  {item.badge > 0 ? (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            {notificationPermission === "default" ? (
              <button
                type="button"
                onClick={() => void enableNotifications()}
                className="flex h-11 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-4 text-[12px] font-black text-violet-700"
              >
                🔔
              </button>
            ) : null}

            <select
              aria-label={t("language")}
              value={locale}
              onChange={(event) => setLocale(event.target.value as AqryoLocale)}
              className="h-11 shrink-0 rounded-full border border-border bg-white px-3 text-[12px] font-extrabold"
            >
              {AQRYO_LANGUAGES.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={onSignOut}
              className="flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-background px-4 text-[13px] font-extrabold text-muted-foreground"
            >
              {t("signOut")}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
