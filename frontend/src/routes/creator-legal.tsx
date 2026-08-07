import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/creator-legal")({
  component: CreatorLegalPage,
});

const LEGAL_ITEMS = [
  ["Kullanım Koşulları", "AQRYO hesabı, Experience kullanımı ve genel ürün kuralları.", "/terms"],
  ["Gizlilik Politikası", "Kişisel verilerin işlenmesi, saklanması ve kullanıcı hakları.", "/privacy"],
  ["Çerez Politikası", "Çerezler ve benzer teknolojilerin kullanımına ilişkin bilgiler.", "/cookies"],
  ["Creator Koşulları", "İçerik yayınlama, Gift, ücretli ek değer, gelir ve creator sorumlulukları.", "/creator-terms"],
  ["Ödeme, Gift ve Dijital İçerik Koşulları", "Offer satın alımları, Gift, ödeme durumları, refund ve dijital içerik kuralları.", "/payment-terms"],
  ["Topluluk Kuralları", "AQRYO üzerinde izin verilmeyen içerik ve davranışlara ilişkin kurallar.", "/community-guidelines"],
  ["Yapay Zeka Kullanım Koşulları", "AQRYO Yapay Zeka araçlarının kullanım sınırları ve creator sorumluluğu.", "/ai-terms"],
] as const;

function CreatorLegalPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadPage() {
      const user = await getCurrentCreator();
      if (cancelled) return;
      if (!user) {
        window.location.href = "/creator-auth";
        return;
      }
      setLoading(false);
    }
    void loadPage();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[960px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-6">
          <a href="/creator-account" className="text-[12px] font-black text-primary">← Hesabım</a>
          <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-primary">Hesabım</p>
          <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[44px]">Yasal</h1>
          <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-muted-foreground">
            AQRYO kullanımıyla ilgili koşullara, politikalara ve creator kurallarına tek yerden ulaş.
          </p>
        </header>

        {loading ? (
          <section className="mt-6 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">Yasal belgeler yükleniyor...</p>
          </section>
        ) : (
          <>
            <section className="mt-6 overflow-hidden rounded-[26px] border border-border bg-white shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
              {LEGAL_ITEMS.map(([title, description, href], index) => (
                <a
                  key={href}
                  href={href}
                  className={`group flex items-center gap-4 p-5 transition hover:bg-background sm:p-6 ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary/[0.06] text-primary">
                    <DocumentIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-black tracking-[-0.02em]">{title}</h2>
                    <p className="mt-1 max-w-[650px] text-[12px] leading-5 text-muted-foreground">{description}</p>
                  </div>
                  <span className="shrink-0 text-[18px] font-black text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary">→</span>
                </a>
              ))}
            </section>

            <section className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <p className="text-[12px] font-black text-amber-900">Yayın öncesi hukuk kontrolü</p>
              <p className="mt-2 text-[12px] leading-5 text-amber-800">
                Bu belgeler AQRYO ürün kurallarını yansıtan çalışma metinleridir. Şirket bilgileri, KVKK/GDPR kapsamı, iade ve cayma hükümleri, creator payout/vergi koşulları ve ödeme sağlayıcısı sözleşmeleri canlıya çıkmadan önce hukuk danışmanı tarafından doğrulanmalıdır.
              </p>
            </section>

            <section className="mt-5 rounded-[24px] border border-border bg-white p-5 sm:p-6">
              <p className="text-[12px] font-black">Hesap silme</p>
              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                Hesabını kapatmak veya silme talebi oluşturmak istiyorsan ayrı hesap silme ekranını kullan.
              </p>
              <a
                href="/creator-delete-account"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 text-[11px] font-black text-red-700 transition hover:bg-red-100"
              >
                Hesap silme sayfasına git
              </a>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 12h5M10 16h5" />
    </svg>
  );
}