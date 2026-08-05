import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AqryLogo } from "@/components/AqryLogo";
import { getTestBySlug } from "@/data/testData";

export const Route = createFileRoute("/test/$slug/result")({
  component: ResultPage,
});

function ResultPage() {
  const { slug } = Route.useParams();
  const test = getTestBySlug(slug);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-foreground">
            Sonuç bulunamadı
          </h1>

          <Link
            to="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-bold text-white"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  async function handleShare() {
    const shareData = {
      title: `${test.title} sonucum`,
      text: "Ben %86 Bree Van de Kamp çıktım. Sen de AQRY testini çöz.",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert("Sonuç bağlantısı kopyalandı.");
    } catch {
      window.alert("Bağlantı kopyalanamadı.");
    }
  }

  function handlePayment() {
    setIsProcessing(true);

    window.setTimeout(() => {
      setIsProcessing(false);
      setIsUnlocked(true);
      setIsCheckoutOpen(false);

      window.scrollTo({
        top: 520,
        behavior: "smooth",
      });
    }, 900);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <span className="absolute -right-28 top-20 select-none text-[220px] font-black tracking-[-0.08em] text-primary/[0.018] sm:text-[320px]">
          AQRY.
        </span>

        <span className="absolute -left-24 bottom-0 select-none text-[180px] font-black tracking-[-0.08em] text-primary/[0.018] sm:text-[240px]">
          AQRY.
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-5 pb-12 sm:px-8">
        <header className="flex h-[68px] items-center gap-3">
          <AqryLogo />

          <span className="hidden border-l border-primary/20 pl-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary md:block">
            Sonucun
          </span>
        </header>

        <main className="pb-8 pt-2">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,760px)_280px]">
            <div className="min-w-0">
              <section className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_24px_70px_rgba(38,16,65,0.10)]">
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-400 px-5 py-7 text-white sm:px-9 sm:py-8">
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.09]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                      backgroundSize: "18px 18px",
                    }}
                  />

                  <div className="relative z-10">
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md">
                      Ücretsiz sonucun
                    </span>

                    <p className="mt-5 text-sm font-semibold text-white/75">
                      Wisteria Lane&apos;de sen...
                    </p>

                    <h1 className="mt-2 text-[38px] font-black leading-[0.96] tracking-[-0.06em] sm:text-[54px]">
                      Bree Van
                      <br className="sm:hidden" />
                      <span className="sm:ml-3">de Kamp&apos;sın.</span>
                    </h1>
                  </div>
                </div>

                <div className="px-5 py-6 sm:px-9 sm:py-7">
                  <h2 className="text-[21px] font-black leading-tight tracking-[-0.035em] text-foreground">
                    Kontrollü, güçlü ve detaylara hâkim.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                    Her şeyin doğru zamanda ve doğru şekilde ilerlemesini
                    istiyorsun. İnsanlar seni soğukkanlı ve kusursuz görse de
                    sevdiklerin için büyük fedakârlıklar yapıyorsun.
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-[18px] bg-muted/50 px-3 py-3 sm:px-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
                        Güçlü yönün
                      </p>

                      <p className="mt-2 text-sm font-black text-foreground">
                        Disiplin
                      </p>
                    </div>

                    <div className="rounded-[18px] bg-muted/50 px-3 py-3 sm:px-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
                        Gizli tarafın
                      </p>

                      <p className="mt-2 text-sm font-black text-foreground">
                        Hassasiyet
                      </p>
                    </div>

                    <div className="rounded-[18px] bg-muted/50 px-3 py-3 sm:px-4">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
                        Eşleşmen
                      </p>

                      <p className="mt-2 text-sm font-black text-foreground">
                        %86 Bree
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-6 sm:px-9 sm:py-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                        Detaylı analiz
                      </p>

                      <h2 className="mt-3 text-[21px] font-black leading-[1.08] tracking-[-0.035em] text-foreground sm:text-[24px]">
                        Karakterinin görünmeyen taraflarını keşfet
                      </h2>
                    </div>

                    {isUnlocked ? (
                      <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 sm:inline-flex">
                        Açıldı
                      </span>
                    ) : null}
                  </div>

                  <div className="relative mt-4 overflow-hidden rounded-[22px] border border-border bg-background px-5 py-5">
                    <p className="text-[15px] leading-7 text-foreground">
                      Kontrolü elinde tuttuğunda kendini güvende hissediyorsun.
                      İnsanların ihtiyaçlarını onlar söylemeden fark ediyor,
                      düzen kurarak çevrendekileri koruyorsun.
                    </p>

                    {isUnlocked ? (
                      <div className="mt-3 space-y-3">
                        <p className="text-[15px] leading-7 text-muted-foreground">
                          İlişkilerinde güvenilir ve sadıksın; ancak bazen her
                          şeyi tek başına çözmeye çalışman insanları senden
                          uzaklaştırabiliyor.
                        </p>

                        <p className="text-[15px] leading-7 text-muted-foreground">
                          Güçlü görünmenin altında yardım istemekte zorlanan,
                          incinmekten çekinen ve kusurlarının görülmesini
                          istemeyen hassas bir taraf bulunuyor.
                        </p>

                        <p className="text-[15px] leading-7 text-muted-foreground">
                          Bree ile yüksek eşleşmenin temel nedeni düzen,
                          sorumluluk ve kontrol ihtiyacın. Lynette ile liderlik,
                          Gabrielle ile özgüven, Susan ile duygusal açıklık
                          tarafında da benzerlik taşıyorsun.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[18px] bg-muted/45 px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                              İlişki biçimin
                            </p>

                            <p className="mt-2 text-sm font-black text-foreground">
                              Koruyucu ve sadık
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-muted/45 px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                              Dikkat etmen gereken
                            </p>

                            <p className="mt-2 text-sm font-black text-foreground">
                              Her şeyi kontrol etmeye çalışma
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="relative mt-3 h-[150px] overflow-hidden">
                          <div className="select-none space-y-3 blur-[6px]">
                            <p className="text-[15px] leading-7 text-muted-foreground">
                              İlişkilerinde güvenilir ve sadıksın; ancak bazen
                              her şeyi tek başına çözmeye çalışman insanları
                              senden uzaklaştırabiliyor.
                            </p>

                            <p className="text-[15px] leading-7 text-muted-foreground">
                              Güçlü görünmenin altında yardım istemekte
                              zorlanan, incinmekten çekinen hassas bir taraf
                              bulunuyor.
                            </p>

                            <p className="text-[15px] leading-7 text-muted-foreground">
                              Tüm karakter eşleşmelerin ve sana özel ilişki
                              yorumun detaylı analizde yer alıyor.
                            </p>
                          </div>

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/90 to-transparent" />
                        </div>

                        <div className="absolute inset-x-0 bottom-5 flex justify-center">
                          <span className="rounded-full border border-border bg-card/95 px-4 py-2 text-xs font-bold text-foreground shadow-soft backdrop-blur-md">
                            Detayın devamı kilitli
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {!isUnlocked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="mt-5 flex h-14 w-full items-center justify-between rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-6 text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(192,38,211,0.20)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(192,38,211,0.28)]"
                      >
                        <span>Detaylı sonucumu gör</span>
                        <span>19 TL</span>
                      </button>

                      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                        Güçlü ve zayıf yönlerin, ilişki biçimin ve tüm karakter
                        eşleşmelerin.
                      </p>
                    </>
                  ) : (
                    <div className="mt-5 flex items-center justify-center rounded-[20px] bg-emerald-500/10 px-5 py-4 text-sm font-bold text-emerald-700">
                      Detaylı analiz açıldı
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleShare}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-bold text-foreground transition duration-200 hover:border-primary/30 hover:bg-primary/[0.035]"
                  >
                    Sonucumu paylaş

                    <span aria-hidden="true">↗</span>
                  </button>

                  <Link
                    to="/test/$slug/quiz"
                    params={{ slug }}
                    className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-bold text-foreground transition duration-200 hover:border-primary/30 hover:bg-primary/[0.035]"
                  >
                    Testi tekrar çöz
                  </Link>
                </div>
              </section>
            </div>

            <aside className="hidden overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_50px_rgba(38,16,65,0.07)] lg:block">
              <div className="px-6 pb-6 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Sonucu hazırlayan
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-sm ring-4 ring-primary/5">
                    {test.creator.avatar ? (
                      <img
                        src={test.creator.avatar}
                        alt={test.creator.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {test.creator.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="truncate text-lg font-black tracking-[-0.035em] text-foreground">
                        {test.creator.name}
                      </h2>

                      <span
                        aria-label="Doğrulanmış creator"
                        className="text-xs text-fuchsia-500"
                      >
                        ✿
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      @{test.creator.username.replace(/^@/, "")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border px-6 py-5">
                <div className="rounded-[20px] bg-muted/50 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Bu Experience
                  </p>

                  <p className="mt-2 text-sm font-bold leading-5 text-foreground">
                    {test.title}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-muted/40 p-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      Süre
                    </p>

                    <p className="mt-1 text-sm font-bold text-foreground">
                      2 dk
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      Soru
                    </p>

                    <p className="mt-1 text-sm font-bold text-foreground">
                      10
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3 text-center">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      Sonuç
                    </p>

                    <p className="mt-1 text-sm font-bold text-foreground">
                      Ücretsiz
                    </p>
                  </div>
                </div>

                <a
                  href={`/${test.creator.username.replace(/^@/, "")}`}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-bold text-foreground transition hover:border-primary/30 hover:bg-primary/[0.035]"
                >
                  Profili Gör

                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Ödeme penceresini kapat"
            onClick={() => setIsCheckoutOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <section className="relative z-10 w-full overflow-hidden rounded-t-[30px] border border-border bg-card shadow-2xl sm:max-w-[440px] sm:rounded-[30px]">
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Güvenli ödeme
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-foreground">
                    Detaylı analizi aç
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg text-muted-foreground transition hover:bg-muted"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-[22px] bg-muted/45 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-foreground">
                      Detaylı karakter analizi
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {test.creator.name} tarafından hazırlanmıştır.
                    </p>
                  </div>

                  <p className="text-xl font-black tracking-[-0.04em] text-foreground">
                    19 TL
                  </p>
                </div>

                <div className="my-5 h-px bg-border" />

                <div className="space-y-3 text-sm font-semibold text-foreground">
                  <p className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Tüm karakter eşleşmeleri
                  </p>

                  <p className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Güçlü ve zayıf yönlerin
                  </p>

                  <p className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Sana özel detaylı yorum
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Toplam
                </span>

                <span className="text-2xl font-black tracking-[-0.05em] text-foreground">
                  19 TL
                </span>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-black px-6 text-sm font-bold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:bg-black/85 enabled:hover:shadow-lg disabled:cursor-wait disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Ödeme işleniyor
                  </>
                ) : (
                  <>
                    Ödemeyi tamamla
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-full text-sm font-bold text-muted-foreground transition hover:bg-muted"
              >
                Vazgeç
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
                Bu ekran şimdilik demo ödeme akışıdır. Gerçek ödeme sistemi daha
                sonra bağlanacaktır.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}