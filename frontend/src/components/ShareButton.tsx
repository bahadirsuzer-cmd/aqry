import { useCallback, useEffect, useState } from "react";

interface ShareButtonProps {
  title: string;
  text: string;
  onShare?: () => void;
}

export function ShareButton({ title, text, onShare }: ShareButtonProps) {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleShare = useCallback(async () => {
    onShare?.();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const payload = `${text}\n${url}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        setNotice("Paylaşım ekranı açıldı");
        return;
      } catch {
        /* user cancelled or share failed — fall through to clipboard */
      }
    }

    try {
      await navigator.clipboard.writeText(payload);
      setNotice("Sonucun panoya kopyalandı");
    } catch {
      setNotice("Paylaşım başlatılamadı, metni manuel kopyalayabilirsin");
    }
  }, [onShare, text, title]);

  return (
    <>
      <button type="button" onClick={handleShare} className="btn-primary">
        Sonucumu paylaş
      </button>
      {notice ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] animate-rise rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-card"
        >
          {notice}
        </div>
      ) : null}
    </>
  );
}
