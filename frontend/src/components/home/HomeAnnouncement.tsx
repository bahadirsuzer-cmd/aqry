import { useEffect, useState } from "react";

import {
  getActiveSiteAnnouncement,
  type PublicSiteAnnouncement,
} from "@/services/homepage";

function storageKey(
  announcementId: string,
) {
  return `aqryo-announcement-dismissed:${announcementId}`;
}

export function HomeAnnouncement() {
  const [
    announcement,
    setAnnouncement,
  ] =
    useState<PublicSiteAnnouncement | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const active =
          await getActiveSiteAnnouncement();

        if (
          !active ||
          cancelled
        ) {
          return;
        }

        if (
          active.displayMode ===
          "once"
        ) {
          const dismissed =
            window.localStorage.getItem(
              storageKey(active.id),
            );

          if (dismissed === "1") {
            return;
          }
        }

        setAnnouncement(active);
      } catch (error) {
        console.error(
          "Homepage duyurusu yüklenemedi:",
          error,
        );
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!announcement) {
    return null;
  }

  const current = announcement;

  function markDismissed() {
    if (
      current.displayMode ===
      "once"
    ) {
      window.localStorage.setItem(
        storageKey(current.id),
        "1",
      );
    }
  }

  function close() {
    markDismissed();
    setAnnouncement(null);
  }

  function handleAction() {
    markDismissed();

    if (!current.buttonUrl) {
      setAnnouncement(null);
      return;
    }

    window.location.href =
      current.buttonUrl;
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 px-5 backdrop-blur-[2px]">
      <div className="relative w-full max-w-[480px] rounded-[28px] border border-border bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] sm:p-7">
        <button
          type="button"
          onClick={close}
          aria-label="Duyuruyu kapat"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[16px] font-bold text-muted-foreground transition hover:text-foreground"
        >
          ×
        </button>

        <div className="pr-10">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary">
            AQRYO duyurusu
          </p>

          <h2 className="mt-3 text-[26px] font-black leading-[1.05] tracking-[-0.045em]">
            {current.title}
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-[12px] leading-6 text-muted-foreground">
            {current.message}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-black"
          >
            Kapat
          </button>

          {current.buttonText &&
          current.buttonUrl ? (
            <button
              type="button"
              onClick={handleAction}
              className="h-11 rounded-full bg-black px-6 text-[10px] font-black text-white"
            >
              {current.buttonText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}