import type {
  PaymentPurchaseKind,
  PaymentUiStatus,
} from "@/services/paymentStatus";

interface PaymentStatusCardProps {
  status: PaymentUiStatus;
  purchaseKind?: PaymentPurchaseKind;
  onContinue?: () => void;
  onRetry?: () => void;
}

interface PaymentStatusContent {
  symbol: string;
  eyebrow: string;
  title: string;
  description: string;
}

function getContent(
  status: PaymentUiStatus,
  purchaseKind: PaymentPurchaseKind,
): PaymentStatusContent {
  if (status === "paid") {
    if (purchaseKind === "gift") {
      return {
        symbol: "♥",
        eyebrow: "Gift gönderildi",
        title: "Teşekkürler.",
        description:
          "Gift’in creator’a ulaştı. Gift, ücretli Result veya Offer’ın kilidini açmaz.",
      };
    }

    if (purchaseKind === "offer") {
      return {
        symbol: "✓",
        eyebrow: "Ödeme tamamlandı",
        title: "İçeriğin açıldı.",
        description:
          "Satın aldığın ek içeriğe aşağıdan devam edebilirsin.",
      };
    }

    return {
      symbol: "✓",
      eyebrow: "Ödeme tamamlandı",
      title: "İşlem başarılı.",
      description:
        "Ödemen başarıyla işlendi.",
    };
  }

  if (status === "failed") {
    return {
      symbol: "!",
      eyebrow: "Ödeme başarısız",
      title: "Ödeme tamamlanamadı.",
      description:
        "Kartından başarılı bir ödeme alınmadı. İstersen tekrar deneyebilirsin.",
    };
  }

  if (status === "cancelled") {
    return {
      symbol: "×",
      eyebrow: "Ödeme iptal edildi",
      title: "İşlem tamamlanmadı.",
      description:
        "Ödeme iptal edildi. Herhangi bir ücretli içerik açılmadı.",
    };
  }

  return {
    symbol: "…",
    eyebrow: "Ödeme kontrol ediliyor",
    title: "İşlemin henüz tamamlanmadı.",
    description:
      "Ödeme sağlayıcısından kesin sonuç bekleniyor. Bu sırada tekrar ödeme başlatma.",
  };
}

function statusClasses(
  status: PaymentUiStatus,
) {
  if (status === "paid") {
    return {
      icon:
        "bg-emerald-50 text-emerald-700",
      badge:
        "bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "failed") {
    return {
      icon: "bg-red-50 text-red-700",
      badge: "bg-red-50 text-red-700",
    };
  }

  if (status === "cancelled") {
    return {
      icon:
        "bg-amber-50 text-amber-700",
      badge:
        "bg-amber-50 text-amber-700",
    };
  }

  return {
    icon:
      "bg-violet-50 text-primary",
    badge:
      "bg-violet-50 text-primary",
  };
}

export function PaymentStatusCard({
  status,
  purchaseKind = "unknown",
  onContinue,
  onRetry,
}: PaymentStatusCardProps) {
  const content =
    getContent(status, purchaseKind);

  const classes =
    statusClasses(status);

  const canRetry =
    status === "failed" ||
    status === "cancelled";

  return (
    <section className="mx-auto w-full max-w-[560px] rounded-[30px] border border-border bg-white p-6 text-center shadow-[0_24px_70px_rgba(35,16,55,0.10)] sm:p-8">
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] text-[30px] font-black ${classes.icon}`}
      >
        {content.symbol}
      </div>

      <span
        className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] ${classes.badge}`}
      >
        {content.eyebrow}
      </span>

      <h2 className="mt-4 text-[30px] font-black leading-[1.02] tracking-[-0.05em]">
        {content.title}
      </h2>

      <p className="mx-auto mt-3 max-w-[410px] text-[12px] leading-6 text-muted-foreground">
        {content.description}
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {status === "paid" &&
        onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-[11px] font-black text-white"
          >
            Devam et →
          </button>
        ) : null}

        {canRetry && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-[11px] font-black text-white"
          >
            Tekrar dene
          </button>
        ) : null}

        {status === "pending" &&
        onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-7 text-[11px] font-black text-foreground"
          >
            Experience’a dön
          </button>
        ) : null}
      </div>

      {status === "pending" ? (
        <p className="mt-5 text-[9px] leading-4 text-muted-foreground">
          Kesin ödeme sonucu doğrulanmadan ücretli içerik açılmamalıdır.
        </p>
      ) : null}
    </section>
  );
}