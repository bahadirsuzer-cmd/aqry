import { Link } from "@tanstack/react-router";

const steps = [
  { index: "01", title: "Fikrini yaz", detail: "Bir cümleyle başla. AQRYO soruları ve sonucu taslak olarak hazırlasın." },
  { index: "02", title: "Düzenle ve yayınla", detail: "Metni, görseli ve akışı düzenle. Hazır olduğunda tek linkle yayınla." },
  { index: "03", title: "Linkini paylaş", detail: "Kendi kitleni davet et. Trafiği ve ilişkiyi sen yönet." },
];

export function AiCreditsIntro() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-[1240px] scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7540d0]">Creator için</p>
          <h2 className="mt-3 text-[32px] font-black leading-tight tracking-[-0.05em] text-[#21163b] sm:text-[42px]">Fikirden paylaşılabilir deneyime.</h2>
        </div>
        <Link to="/creator-auth" className="inline-flex min-h-11 items-center rounded-full border border-[#e2d9ec] px-5 text-sm font-bold text-[#7540d0]">Studio’yu aç →</Link>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.index} className="rounded-[24px] border border-[#e8e1ef] bg-[#fbf9ff] p-6">
            <span className="text-sm font-black text-[#7540d0]">{step.index}</span>
            <h3 className="mt-7 text-xl font-black tracking-[-0.04em] text-[#24183a]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#665d73]">{step.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-7 text-center text-sm text-[#665d73]">Amaç basit: içerik oluştur, paylaş ve konuşmayı kendi kitlende devam ettir.</p>
    </section>
  );
}
