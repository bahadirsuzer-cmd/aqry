import { useEffect } from "react";
import type { QuizResult, ResultProfile, Test } from "@/types";
import { AqryLogo } from "@/components/AqryLogo";
import { formatPrice } from "@/utils/format";
import { trackEvent } from "@/utils/analytics";

interface ResultPreviewPageProps {
  test: Test;
  profile: ResultProfile;
  result: QuizResult;
  onUnlock: () => void;
}

export function ResultPreviewPage({ test, profile, result, onUnlock }: ResultPreviewPageProps) {
  const percent = result.percentages[profile.key];

  useEffect(() => {
    trackEvent("result_preview_viewed", {
      testId: test.id,
      testSlug: test.slug,
      creatorId: test.creator.id,
      resultId: profile.id,
    });
  }, [profile.id, test]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[520px] px-5 py-5">
        <AqryLogo />

        <div className="animate-rise mt-8 space-y-6">
          <div className="rounded-3xl bg-gradient-brand p-6 text-center shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              Sonucun hazır
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-primary-foreground">
              Sen %{percent} {profile.name}'sin
            </h1>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft">
            <p className="text-[15px] leading-relaxed text-foreground">{profile.shortDescription}</p>
            <p
              aria-hidden="true"
              className="mt-3 select-none text-[15px] leading-relaxed text-foreground blur-[6px]"
            >
              {profile.fullDescription.slice(0, 320)}
            </p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card to-transparent" />
          </div>

          <div className="space-y-3">
            <button type="button" onClick={onUnlock} className="btn-primary">
              Detaylı sonucumu gör — {formatPrice(test.price, test.currency)}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Detaylı analiz: güçlü yönler, zayıf yönler, ilişki biçimi ve tüm karakter eşleşmelerin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
