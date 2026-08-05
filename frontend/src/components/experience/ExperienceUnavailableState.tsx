import { Link } from "@tanstack/react-router";

export type ExperienceUnavailableReason =
  | "not_found"
  | "paused"
  | "archived"
  | "moderated"
  | "error";

interface ExperienceUnavailableStateProps {
  reason: ExperienceUnavailableReason;
  onRetry?: () => void;
}

const CONTENT: Record<
  ExperienceUnavailableReason,
  {
    eyebrow: string;
    title: string;
    description: string;
    symbol: string;
  }
> = {
  not_found: {
    eyebrow: "Experience bulunamadı",
    title: "Bu bağlantı artık burada değil.",
    description:
      "Bağlantı hatalı olabilir veya Experience kaldırılmış olabilir.",
    symbol: "?",
  },
  paused: {
    eyebrow: "Şu anda kapalı",
    title: "Bu Experience geçici olarak duraklatıldı.",
    description:
      "Creator daha sonra yeniden yayınlayabilir. Mevcut veriler ve önceki işlemler korunur.",
    symbol: "Ⅱ",
  },
  archived: {
    eyebrow: "Experience arşivlendi",
    title: "Bu Experience artık yeni katılım kabul etmiyor.",
    description:
      "Creator bu sürümü arşivlemiş olabilir.",
    symbol: "□",
  },
  moderated: {
    eyebrow: "Erişim kısıtlandı",
    title: "Bu Experience şu anda kullanılamıyor.",
    description:
      "İçerik, güvenlik veya platform kuralları nedeniyle inceleme altında olabilir.",
    symbol: "!",
  },
  error: {
    eyebrow: "Bir şey ters gitti",
    title: "Experience şu anda açılamıyor.",
    description:
      "Bağlantıyı tekrar deneyebilir veya AQRYO ana sayfasına dönebilirsin.",
    symbol: "↻",
  },
};

export function ExperienceUnavailableState({
  reason,
  onRetry,
}: ExperienceUnavailableStateProps) {
  const content = CONTENT[reason];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/70 via-white to-white px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[78vh] w-full max-w-[620px] items-center justify-center">
        <div className="w-full rounded-[30px] border border-border bg-white p-7 text-center shadow-[0_24px_80px_rgba(35,16,55,0.09)] sm:p-10">
          <Link
            to="/"
            className="text-[25px] font-black tracking-[-0.065em] text-primary"
          >
            AQRYO.
          </Link>

          <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary/[0.07] text-[30px] font-black text-primary">
            {content.symbol}
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
            {content.eyebrow}
          </p>

          <h1 className="mx-auto mt-3 max-w-[480px] text-[29px] font-black leading-[1.05] tracking-[-0.05em] sm:text-[35px]">
            {content.title}
          </h1>

          <p className="mx-auto mt-4 max-w-[440px] text-[12px] leading-6 text-muted-foreground">
            {content.description}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {reason === "error" && onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[11px] font-black text-white"
              >
                Tekrar dene
              </button>
            ) : null}

            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-6 text-[11px] font-black text-foreground"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}