import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export const Route = createFileRoute(
  "/how-it-works",
)({
  component: HowItWorksPage,
});

const participantSteps = [
  {
    number: "01",
    title: "Linke gir",
    text: "Creator’ın X, Instagram, TikTok, YouTube, Telegram, e-posta veya web sitesinde paylaştığı AQRYO bağlantısını aç.",
  },
  {
    number: "02",
    title: "Experience’a katıl",
    text: "Testi çöz, hikayeyi ilerlet, bulmacayı çöz veya Experience’ın etkileşimini tamamla.",
  },
  {
    number: "03",
    title: "Sonucunu gör",
    text: "Experience’ın doğal sonucu ücretsizdir. Kullanıcı sonucu görmek için ödeme yapmak zorunda değildir.",
  },
  {
    number: "04",
    title: "İstersen devam et",
    text: "Result sonrasında creator ek değer sunabilir veya kullanıcı Gift gönderebilir. Bunlar Experience’ı tamamlamak için zorunlu değildir.",
  },
];

const creatorSteps = [
  {
    number: "01",
    title: "Oluştur",
    text: "Kendin oluştur veya AI desteğiyle Experience taslağı hazırla.",
  },
  {
    number: "02",
    title: "Yayınla",
    text: "Experience’ını tamamla, kontrol et ve tek bağlantıyla yayına al.",
  },
  {
    number: "03",
    title: "Paylaş",
    text: "Bağlantını kendi kitlene taşı. AQRYO bir sosyal ağ veya keşfet platformu değildir.",
  },
  {
    number: "04",
    title: "Etkileşim ve gelir",
    text: "Katılımları takip et; Result sonrası Gift ve isteğe bağlı ücretli ek değerlerden gelir elde et.",
  },
];

function StepGrid({
  steps,
}: {
  steps: typeof participantSteps;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {steps.map((step) => (
        <article
          key={step.number}
          className="rounded-[24px] border border-border bg-white p-5 shadow-[0_16px_40px_rgba(35,16,55,0.05)] sm:p-6"
        >
          <span className="text-[10px] font-black text-primary">
            {step.number}
          </span>

          <h3 className="mt-3 text-[20px] font-black tracking-[-0.035em]">
            {step.title}
          </h3>

          <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
            {step.text}
          </p>
        </article>
      ))}
    </div>
  );
}

function HowItWorksPage() {
  return (
    <PublicPageShell
      eyebrow="Nasıl çalışır?"
      title="Bir link. Bir Experience. Net bir sonuç."
      description="AQRYO, creator’ın dışarıdan getirdiği trafiği etkileşimli Experience’lara dönüştürür. Katılımcı değer alır; creator isterse Result sonrasında ek gelir fırsatı sunar."
    >
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-7 lg:px-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
            Katılımcı için
          </p>
          <h2 className="mt-2 text-[28px] font-black tracking-[-0.045em]">
            Gir, katıl, sonucunu gör.
          </h2>
          <div className="mt-6">
            <StepGrid steps={participantSteps} />
          </div>
        </div>

        <div className="mt-14">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
            Creator için
          </p>
          <h2 className="mt-2 text-[28px] font-black tracking-[-0.045em]">
            Oluştur, paylaş, dönüşümü takip et.
          </h2>
          <div className="mt-6">
            <StepGrid steps={creatorSteps} />
          </div>
        </div>

        <div className="mt-12 rounded-[28px] bg-gradient-to-r from-violet-600 to-purple-500 p-6 text-white sm:p-8">
          <h2 className="text-[27px] font-black tracking-[-0.045em]">
            İlk Experience’ını oluştur.
          </h2>

          <p className="mt-2 max-w-xl text-[12px] leading-6 text-white/80">
            Teknik bilgi gerekmez. Creator Studio’dan başlayabilir veya AI desteğiyle taslak oluşturabilirsin.
          </p>

          <Link
            to="/creator-auth"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-[11px] font-black text-primary"
          >
            Creator olarak başla →
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}