import {
  createResultShareAsset,
  revokeResultShareAsset,
  shareResultCard,
  type ResultShareAsset,
} from "@/services/resultShareCards";
import {
  useEffect,
  useState,
} from "react";

interface ResultSharePanelProps {
  experienceTitle: string;
  resultTitle: string;
  resultDescription: string;
  creatorName?: string | null;
  creatorUsername?: string | null;
  coverImageUrl?: string | null;
  score?: number | null;
  experienceType?: string | null;
  shareUrl: string;
}

export function ResultSharePanel({
  experienceTitle,
  resultTitle,
  resultDescription,
  creatorName,
  creatorUsername,
  coverImageUrl,
  score,
  experienceType,
  shareUrl,
}: ResultSharePanelProps) {
  const [sharing, setSharing] =
    useState(false);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [asset, setAsset] =
    useState<ResultShareAsset | null>(
      null,
    );

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (asset) {
        revokeResultShareAsset(
          asset,
        );
      }
    };
  }, [asset]);

  function getSource() {
    return {
      experienceTitle,
      resultTitle,
      resultDescription,
      creatorName,
      creatorUsername,
      coverImageUrl,
      score,
      type: experienceType,
      shareUrl,
    };
  }

  async function handleNativeShare() {
    if (sharing) {
      return;
    }

    try {
      setSharing(true);
      setMessage(null);
      setErrorMessage(null);

      const result =
        await shareResultCard(
          getSource(),
        );

      if (result.method === "cancelled") {
        revokeResultShareAsset(
          result.asset,
        );
        return;
      }

      if (
        result.method ===
        "native-with-image"
      ) {
        setMessage(
          "Sonuç görselin paylaşım ekranına hazırlandı.",
        );
      } else if (
        result.method ===
        "native-link"
      ) {
        setMessage(
          "Bu cihaz görsel dosyası paylaşımını desteklemedi; sonuç bağlantısı paylaşıldı.",
        );
      } else if (
        result.method ===
        "clipboard"
      ) {
        setMessage(
          "Paylaşım metni ve bağlantısı kopyalandı.",
        );
      } else {
        setMessage(
          "Sonuç görselin hazır. Görseli aç butonundan kullanabilirsin.",
        );
      }

      if (asset) {
        revokeResultShareAsset(
          asset,
        );
      }

      setAsset(result.asset);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Sonuç paylaşılamadı.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function handlePreview() {
    if (previewLoading) {
      return;
    }

    try {
      setPreviewLoading(true);
      setMessage(null);
      setErrorMessage(null);

      const nextAsset =
        await createResultShareAsset(
          getSource(),
        );

      if (asset) {
        revokeResultShareAsset(
          asset,
        );
      }

      setAsset(nextAsset);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Sonuç görseli oluşturulamadı.",
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleCopyLink() {
    try {
      setErrorMessage(null);

      await navigator.clipboard.writeText(
        shareUrl,
      );

      setMessage(
        "Bağlantı kopyalandı.",
      );
    } catch {
      setErrorMessage(
        "Bağlantı kopyalanamadı.",
      );
    }
  }

  function handleShareOnX() {
    const shareText =
      `Benim sonucum: ${resultTitle}\n\nSen de çöz`;

    const url = new URL(
      "https://twitter.com/intent/tweet",
    );

    url.searchParams.set(
      "text",
      shareText,
    );

    url.searchParams.set(
      "url",
      shareUrl,
    );

    window.open(
      url.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section className="mt-4 rounded-[22px] border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-black">
            Sonucunu paylaş
          </p>

          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            AQRYO sonucuna özel paylaşım
            görselini otomatik hazırlasın.
          </p>
        </div>

        <span className="text-xl">
          ↗
        </span>
      </div>

      {asset ? (
        <div className="mt-4 overflow-hidden rounded-[18px] border border-border bg-white">
          <img
            src={asset.objectUrl}
            alt={`${resultTitle} paylaşım görseli`}
            className="aspect-[4/5] w-full object-cover"
          />

          <div className="flex flex-wrap gap-2 p-3">
            <a
              href={asset.objectUrl}
              download="aqryo-sonucum.png"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-border bg-white px-4 text-[11px] font-black transition hover:border-primary/30 hover:text-primary"
            >
              Görseli kaydet
            </a>

            <button
              type="button"
              onClick={() => {
                revokeResultShareAsset(
                  asset,
                );
                setAsset(null);
              }}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[11px] font-black text-muted-foreground"
            >
              Kapat
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-[14px] bg-emerald-50 px-3 py-2.5 text-[11px] font-bold leading-5 text-emerald-700">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 rounded-[14px] bg-red-50 px-3 py-2.5 text-[11px] font-bold leading-5 text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            void handleNativeShare()
          }
          disabled={sharing}
          className="flex h-11 items-center justify-center rounded-full bg-primary px-3 text-[12px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sharing
            ? "Hazırlanıyor..."
            : "Sonucumu paylaş"}
        </button>

        <button
          type="button"
          onClick={() =>
            void handlePreview()
          }
          disabled={previewLoading}
          className="flex h-11 items-center justify-center rounded-full border border-primary/15 bg-white px-3 text-[12px] font-black text-primary transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {previewLoading
            ? "Hazırlanıyor..."
            : "Görseli oluştur"}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShareOnX}
          className="flex h-10 items-center justify-center rounded-full bg-black px-3 text-[11px] font-black text-white"
        >
          X'te paylaş
        </button>

        <button
          type="button"
          onClick={() =>
            void handleCopyLink()
          }
          className="flex h-10 items-center justify-center rounded-full border border-border bg-white px-3 text-[11px] font-black text-muted-foreground"
        >
          Bağlantıyı kopyala
        </button>
      </div>
    </section>
  );
}