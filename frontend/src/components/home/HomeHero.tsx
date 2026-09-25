import { Link } from "@tanstack/react-router";
import { useState } from "react";

const questions = [
  { title: "Plan son anda iptal oldu. Sen?", options: ["Yeni bir plan yaparım", "Biraz kendi hâlime çekilirim"] },
  { title: "Arkadaşların seni nasıl tanır?", options: ["Herkesi bir araya getiren", "En iyi dinleyen"] },
];

interface HomeHeroProps { isCreator?: boolean; authChecked?: boolean }

export function HomeHero({ isCreator = false, authChecked = true }: HomeHeroProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showBonus, setShowBonus] = useState(false);
  const finished = step >= questions.length;
  const outgoing = answers.includes(0);

  function choose(answer: number) {
    setAnswers((previous) => [...previous.slice(0, step), answer]);
    setStep((previous) => previous + 1);
  }
  function reset() { setStep(0); setAnswers([]); setShowBonus(false); }

  return (
    <section className="overflow-hidden bg-[#faf8ff]">
      <div className="mx-auto grid max-w-[1240px] gap-9 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[0.87fr_1.13fr] lg:items-center lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <p className="text-[13px] font-bold tracking-[0.12em] text-[#7140c4]">AQRYO · CREATOR STUDIO</p>
          <h1 className="mt-4 text-[clamp(2.75rem,5vw,5.25rem)] font-black leading-[0.99] tracking-[-0.065em] text-[#21163b]">
            Kitleni oyuna davet et.<br /><span className="text-[#7540d0]">Etkileşimi başlat.</span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-base leading-7 text-[#625a70] sm:text-lg">Fikrini yaz, deneyimini oluştur, linkini kendi kitlenle paylaş.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {authChecked ? <Link to={isCreator ? "/creator-studio" : "/creator-auth"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#7540d0] px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(117,64,208,.2)] transition hover:bg-[#5f2bb9]">{isCreator ? "Studio’ya git" : "Kendininkini oluştur"} →</Link> : null}
            <a href="#hero-demo" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ded5ed] bg-white px-6 text-sm font-bold text-[#332347]">Örneği oyna</a>
          </div>
        </div>
        <div id="hero-demo" className="scroll-mt-24 rounded-[32px] bg-[#231739] p-4 shadow-[0_30px_70px_rgba(31,18,58,.2)] sm:p-6">
          <div className="mx-auto flex min-h-[370px] max-w-[440px] flex-col rounded-[26px] bg-white p-6 sm:min-h-[430px] sm:p-8" aria-live="polite">
            <div className="flex items-center justify-between text-xs font-bold text-[#806c99]"><span>✦ @ayse ile mini deneyim</span><span>{finished ? "SONUÇ" : `${step + 1} / ${questions.length}`}</span></div>
            {!finished ? <>
              <div className="mt-7 h-1.5 rounded-full bg-[#eee8f7]"><div className="h-full rounded-full bg-[#56c9be] transition-all" style={{ width: `${(step / questions.length) * 100}%` }} /></div>
              <div className="flex flex-1 flex-col justify-center py-9"><span className="mb-4 text-4xl" aria-hidden="true">{step === 0 ? "✨" : "💬"}</span><h2 className="text-[29px] font-black leading-tight tracking-[-0.04em] text-[#24183a] sm:text-[34px]">{questions[step].title}</h2></div>
              <div className="space-y-3">{questions[step].options.map((option, index) => <button key={option} type="button" onClick={() => choose(index)} className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-[#f4f0fb] px-5 text-left text-base font-bold text-[#34234e] transition hover:bg-[#e9ddfa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7540d0]">{option}<span aria-hidden="true">↗</span></button>)}</div>
              {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="mt-5 self-start text-sm font-semibold text-[#806c99]">← Önceki seçim</button> : null}
            </> : <div className="flex flex-1 flex-col justify-center">
              <span className="text-xs font-bold tracking-[0.12em] text-[#7540d0]">ÜCRETSİZ SONUCUN</span>
              <div className="mt-5 rounded-[25px] bg-gradient-to-br from-[#edddff] via-[#faf4ff] to-[#d9f6ef] p-7"><span className="text-4xl" aria-hidden="true">{outgoing ? "⚡" : "🌙"}</span><h2 className="mt-5 text-[30px] font-black leading-tight tracking-[-0.04em] text-[#27173f]">{outgoing ? "Grubun kıvılcımı sensin" : "Grubun sakin gücüsün"}</h2><p className="mt-3 text-base leading-6 text-[#574c66]">{outgoing ? "Yeni planları başlatıp insanları bir araya getiriyorsun. Bazen herkesin senin hızına yetişmesini bekliyorsun." : "İnsanları dikkatle dinleyip ortamı dengeliyorsun. Bazen kendi isteğini de açıkça söylemen gerekiyor."}</p></div>
              {!showBonus ? <button type="button" onClick={() => setShowBonus(true)} className="mt-7 min-h-12 rounded-full bg-[#7540d0] px-6 text-sm font-bold text-white">Tamamla →</button> : <div className="mt-6 rounded-2xl border border-[#e6dcf1] p-5"><p className="font-bold text-[#26163e]">Deneyim burada bitti.</p><p className="mt-1 text-sm leading-6 text-[#625a70]">Gerçek deneyimlerde creator yeni bir soru, hikaye veya meydan okumayla etkileşimi devam ettirebilir.</p><button type="button" onClick={reset} className="mt-4 text-sm font-bold text-[#7540d0]">Baştan oyna ↺</button></div>}
            </div>}
          </div>
          <p className="mt-4 text-center text-xs font-medium text-white/70">Oynanabilir örnek · Ücretsiz sonuç eksiksiz gösterilir</p>
        </div>
      </div>
    </section>
  );
}
