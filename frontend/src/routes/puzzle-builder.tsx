import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle-builder")({
  component: PuzzleBuilderPage,
});

type PuzzleKind = "count" | "geometry" | "math";
type Presentation = "clean" | "debate";

type CountPuzzle = {
  grid: number;
  answer: number;
  commonWrong: number;
};

type GeometryPuzzle = {
  exterior: number;
  base: number;
  answer: number;
  commonWrong: number;
};

type MathPuzzle = {
  expression: string;
  answer: number;
  commonWrong: number;
};

const SOCIAL_COPY: Record<PuzzleKind, string[]> = {
  count: [
    "Çoğu kişi ilk gördüğünü sayıyor. Görselde toplam kaç kare var? 👀",
    "Göz yanıltıyor. Toplam kaç kare var?",
    "İlk cevabına güveniyor musun? Kaç kare görüyorsun?",
  ],
  geometry: [
    "İlk bakışta kolay görünüyor. x kaç?",
    "Bu açı sorusunda en çok aynı hata yapılıyor. x kaç?",
    "Kalem kullanmadan çözebilir misin? x kaç?",
  ],
  math: [
    "İşlem önceliğine güveniyorsan cevabı yaz 👇",
    "Bu işlem yorumları ikiye bölüyor. Sonuç kaç?",
    "Kalem yok, hesap makinesi yok. Sonuç kaç?",
  ],
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function makeCount(): CountPuzzle {
  const grid = pick([3, 4]);
  const answer = Array.from({ length: grid }, (_, index) => {
    const size = index + 1;
    return (grid - size + 1) ** 2;
  }).reduce((total, value) => total + value, 0);

  return {
    grid,
    answer,
    commonWrong: grid * grid,
  };
}

function makeGeometry(): GeometryPuzzle {
  const exterior = pick([110, 120, 125, 130, 135, 140]);
  const maxBase = Math.min(60, 170 - exterior);
  const possibleBases = [25, 30, 35, 40, 45, 50, 55, 60].filter(
    (value) => value <= maxBase && exterior - value > 20,
  );
  const base = pick(possibleBases.length ? possibleBases : [30]);
  const answer = exterior - base;
  const commonWrong = 180 - exterior - base;

  return {
    exterior,
    base,
    answer,
    commonWrong,
  };
}

function leftToRight(values: number[], operators: string[]) {
  let result = values[0];

  for (let index = 0; index < operators.length; index += 1) {
    const next = values[index + 1];
    const operator = operators[index];

    if (operator === "+") result += next;
    else if (operator === "-") result -= next;
    else if (operator === "×") result *= next;
    else result /= next;
  }

  return result;
}

function makeMath(): MathPuzzle {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const template = randomInt(0, 3);
    let values: number[] = [];
    let operators: string[] = [];
    let answer = 0;

    if (template === 0) {
      const divisor = pick([2, 3, 4, 5]);
      const quotient = randomInt(2, 8);
      const divided = divisor * quotient;
      const first = randomInt(3, 18);
      values = [first, divided, divisor];
      operators = ["+", "÷"];
      answer = first + divided / divisor;
    } else if (template === 1) {
      const divisor = pick([2, 4, 5]);
      const quotient = randomInt(2, 7);
      const divided = divisor * quotient;
      const first = randomInt(20, 50);
      const last = randomInt(3, 12);
      values = [first, divided, divisor, last];
      operators = ["-", "÷", "+"];
      answer = first - divided / divisor + last;
    } else if (template === 2) {
      const first = randomInt(8, 30);
      const multiplierA = randomInt(3, 9);
      const multiplierB = randomInt(2, 6);
      const last = randomInt(2, 12);
      values = [first, multiplierA, multiplierB, last];
      operators = ["+", "×", "-"];
      answer = first + multiplierA * multiplierB - last;
    } else {
      const divisor = pick([2, 3, 4]);
      const quotient = randomInt(3, 9);
      const divided = divisor * quotient;
      const plus = randomInt(2, 8);
      const multiplier = randomInt(2, 5);
      values = [divided, divisor, plus, multiplier];
      operators = ["÷", "+", "×"];
      answer = divided / divisor + plus * multiplier;
    }

    const commonWrong = leftToRight(values, operators);

    if (
      Number.isInteger(answer) &&
      Number.isInteger(commonWrong) &&
      answer !== commonWrong &&
      Math.abs(answer) <= 120 &&
      Math.abs(commonWrong) <= 120
    ) {
      return {
        expression: values
          .map((value, index) =>
            index === 0 ? String(value) : `${operators[index - 1]} ${value}`,
          )
          .join(" "),
        answer,
        commonWrong,
      };
    }
  }

  return {
    expression: "40 + 10 ÷ 2 - 15",
    answer: 30,
    commonWrong: 10,
  };
}

function randomCopy(kind: PuzzleKind) {
  return pick(SOCIAL_COPY[kind]);
}

function PuzzleBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<PuzzleKind>("math");
  const [presentation, setPresentation] = useState<Presentation>("clean");
  const [socialText, setSocialText] = useState(() => randomCopy("math"));
  const [count, setCount] = useState<CountPuzzle>(() => makeCount());
  const [geometry, setGeometry] = useState<GeometryPuzzle>(() => makeGeometry());
  const [math, setMath] = useState<MathPuzzle>(() => makeMath());
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const creator = await getCurrentCreator();
      if (!creator) {
        window.location.href = "/creator-auth";
        return;
      }
      if (!cancelled) setLoading(false);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  const answer = useMemo(() => {
    if (kind === "count") return String(count.answer);
    if (kind === "geometry") return `${geometry.answer}°`;
    return String(math.answer);
  }, [count.answer, geometry.answer, kind, math.answer]);

  const commonWrong = useMemo(() => {
    if (kind === "count") return String(count.commonWrong);
    if (kind === "geometry") return `${geometry.commonWrong}°`;
    return String(math.commonWrong);
  }, [count.commonWrong, geometry.commonWrong, kind, math.commonWrong]);

  function selectKind(next: PuzzleKind) {
    setKind(next);
    setPresentation("clean");
    setSocialText(randomCopy(next));
    setCopied(false);
  }

  function regenerate() {
    if (kind === "count") setCount(makeCount());
    else if (kind === "geometry") setGeometry(makeGeometry());
    else setMath(makeMath());

    setSocialText(randomCopy(kind));
    setCopied(false);
  }

  async function copyText() {
    await navigator.clipboard.writeText(socialText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function serializeSvg() {
    if (!svgRef.current) return null;
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgRef.current);
  }

  function downloadSvg() {
    const source = serializeSvg();
    if (!source) return;

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aqryo-${kind}-puzzle.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function createPngFile() {
    const source = serializeSvg();
    if (!source) throw new Error("Görsel hazırlanamadı.");

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Görsel dönüştürülemedi."));
        image.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1440;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas açılamadı.");

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("PNG üretilemedi."))),
          "image/png",
          0.96,
        );
      });

      return new File([blob], `aqryo-${kind}-puzzle.png`, {
        type: "image/png",
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function sharePuzzle() {
    if (sharing) return;

    try {
      setSharing(true);
      const file = await createPngFile();

      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          text: socialText,
          title: "AQRYO Puzzle",
        });
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(fileUrl);

      const x = new URL("https://twitter.com/intent/tweet");
      x.searchParams.set("text", socialText);
      window.open(x.toString(), "_blank", "noopener,noreferrer");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Paylaşım açılamadı.");
    } finally {
      setSharing(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-600">
              Sosyal puzzle motoru
            </p>
            <h1 className="mt-1 text-[22px] font-black tracking-[-0.045em]">Puzzle</h1>
          </div>
          <Link
            to="/creator-studio"
            className="rounded-full border border-border bg-white px-4 py-2 text-[10px] font-black text-muted-foreground"
          >
            Studio’ya dön
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:py-9">
        <section className="space-y-5">
          <div className="rounded-[28px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">
              1 · Soru türü
            </p>
            <h2 className="mt-2 text-[26px] font-black tracking-[-0.05em]">
              Kolay görünen, fikir ayrılığı yaratan sorular.
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <PuzzleTypeButton
                active={kind === "math"}
                title="İşlem önceliği"
                description="Doğru bilen / soldan giden"
                onClick={() => selectKind("math")}
              />
              <PuzzleTypeButton
                active={kind === "geometry"}
                title="Geometri"
                description="İç açı / dış açı tuzağı"
                onClick={() => selectKind("geometry")}
              />
              <PuzzleTypeButton
                active={kind === "count"}
                title="Kaç tane var?"
                description="İlk bakış sayımı / gerçek toplam"
                onClick={() => selectKind("count")}
              />
            </div>

            {kind === "math" ? (
              <div className="mt-5">
                <p className="text-[10px] font-black">Sunum</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresentation("clean")}
                    className={`rounded-[18px] border px-4 py-3 text-left text-[10px] font-black ${
                      presentation === "clean"
                        ? "border-violet-500 bg-violet-50 text-violet-800"
                        : "border-border bg-white"
                    }`}
                  >
                    Sadece soru
                    <span className="mt-1 block text-[8px] font-semibold text-muted-foreground">
                      Şık yok
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresentation("debate")}
                    className={`rounded-[18px] border px-4 py-3 text-left text-[10px] font-black ${
                      presentation === "debate"
                        ? "border-violet-500 bg-violet-50 text-violet-800"
                        : "border-border bg-white"
                    }`}
                  >
                    Kim haklı?
                    <span className="mt-1 block text-[8px] font-semibold text-muted-foreground">
                      2 tartışma balonu
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={regenerate}
              className="mt-5 h-11 rounded-full bg-black px-5 text-[10px] font-black text-white"
            >
              Yeni soru üret ↻
            </button>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">
              2 · CTA
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              Şık vermiyoruz. Metin yalnızca insanı durdurup cevabını yorumlara yazmaya iter.
            </p>

            <textarea
              rows={4}
              value={socialText}
              onChange={(event) => setSocialText(event.target.value)}
              className="mt-5 w-full resize-none rounded-[18px] border border-border bg-background px-4 py-4 text-[12px] font-semibold leading-6 outline-none focus:border-violet-300"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={sharing}
                onClick={() => void sharePuzzle()}
                className="h-11 rounded-full bg-violet-600 px-6 text-[10px] font-black text-white disabled:opacity-50"
              >
                {sharing ? "Hazırlanıyor..." : "Paylaş →"}
              </button>
              <button
                type="button"
                onClick={() => void copyText()}
                className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-black"
              >
                {copied ? "Kopyalandı ✓" : "Metni kopyala"}
              </button>
              <button
                type="button"
                onClick={downloadSvg}
                className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-black"
              >
                SVG indir
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-violet-100 bg-violet-50/70 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-black text-violet-950">Doğru cevap</p>
                <p className="mt-2 text-[20px] font-black text-violet-800">{answer}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-violet-950">Yaygın yanlış yöntem sonucu</p>
                <p className="mt-2 text-[20px] font-black text-rose-600">{commonWrong}</p>
              </div>
            </div>
            <p className="mt-3 text-[9px] leading-4 text-violet-900/60">
              Normal şablonda bu iki sonuç görselde gösterilmez. Yalnız “Kim haklı?” sunumunda iki balona yerleştirilir.
            </p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            Paylaşılacak görsel
          </p>

          <div className="overflow-hidden rounded-[30px] border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(56,27,90,0.11)]">
            <PuzzleSvg
              ref={svgRef}
              kind={kind}
              presentation={presentation}
              count={count}
              geometry={geometry}
              math={math}
            />
          </div>

          <p className="mt-3 text-center text-[9px] leading-4 text-muted-foreground">
            Sorunun cevabı görselde yalnız tartışma balonlu sunum seçildiğinde görünür.
          </p>
        </aside>
      </div>
    </main>
  );
}

const PuzzleSvg = React.forwardRef<
  SVGSVGElement,
  {
    kind: PuzzleKind;
    presentation: Presentation;
    count: CountPuzzle;
    geometry: GeometryPuzzle;
    math: MathPuzzle;
  }
>(function PuzzleSvg({ kind, presentation, count, geometry, math }, ref) {
  const size = 220;
  const start = 70;
  const cell = size / count.grid;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 480"
      className="w-full rounded-[22px]"
      role="img"
      aria-label="AQRYO puzzle"
    >
      <rect width="360" height="480" rx="28" fill="#fbfafc" />
      <circle cx="48" cy="45" r="20" fill="#74f0de" />
      <text x="48" y="52" textAnchor="middle" fontSize="19" fontWeight="900" fill="#17101f">Q</text>
      <text x="78" y="51" fontSize="14" fontWeight="900" fill="#17101f">AQRYO</text>

      {kind === "math" ? (
        presentation === "debate" ? (
          <>
            <text x="180" y="115" textAnchor="middle" fontSize="30" fontWeight="900" fill="#17101f">
              {math.expression}
            </text>
            <text x="180" y="150" textAnchor="middle" fontSize="15" fontWeight="800" fill="#6b7280">
              Kim haklı?
            </text>

            <circle cx="95" cy="280" r="45" fill="#dbeafe" />
            <circle cx="265" cy="280" r="45" fill="#fee2e2" />
            <circle cx="81" cy="269" r="5" fill="#17101f" />
            <circle cx="109" cy="269" r="5" fill="#17101f" />
            <circle cx="251" cy="269" r="5" fill="#17101f" />
            <circle cx="279" cy="269" r="5" fill="#17101f" />
            <path d="M78 294Q95 306 112 294" stroke="#17101f" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M248 294Q265 306 282 294" stroke="#17101f" strokeWidth="4" fill="none" strokeLinecap="round" />

            <path d="M45 200Q95 165 145 200L132 247Q95 225 58 247Z" fill="white" stroke="#17101f" strokeWidth="3" />
            <text x="95" y="210" textAnchor="middle" fontSize="24" fontWeight="900" fill="#17101f">
              {math.answer}
            </text>

            <path d="M215 200Q265 165 315 200L302 247Q265 225 228 247Z" fill="white" stroke="#17101f" strokeWidth="3" />
            <text x="265" y="210" textAnchor="middle" fontSize="24" fontWeight="900" fill="#17101f">
              {math.commonWrong}
            </text>

            <text x="180" y="420" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7c3aed">
              Sen hangisini söylüyorsun?
            </text>
          </>
        ) : (
          <>
            <text x="180" y="120" textAnchor="middle" fontSize="20" fontWeight="900" fill="#6b7280">
              Çoğu kişi aynı yerde hata yapıyor
            </text>
            <text x="180" y="240" textAnchor="middle" fontSize="38" fontWeight="900" fill="#17101f">
              {math.expression}
            </text>
            <text x="180" y="300" textAnchor="middle" fontSize="32" fontWeight="900" fill="#7c3aed">
              = ?
            </text>
            <text x="180" y="420" textAnchor="middle" fontSize="17" fontWeight="800" fill="#6b7280">
              İşlem önceliğine güveniyor musun?
            </text>
          </>
        )
      ) : null}

      {kind === "geometry" ? (
        <>
          <text x="180" y="92" textAnchor="middle" fontSize="18" fontWeight="900" fill="#6b7280">
            İç açı mı, dış açı mı?
          </text>

          <path d="M74 370L180 165L302 370Z" fill="none" stroke="#17101f" strokeWidth="7" strokeLinejoin="round" />
          <path d="M180 165L215 98" stroke="#17101f" strokeWidth="7" strokeLinecap="round" />

          <path d="M169 187Q190 194 199 211" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
          <text x="204" y="190" fontSize="19" fontWeight="900" fill="#ef4444">{geometry.exterior}°</text>

          <path d="M82 349Q101 345 111 325" fill="none" stroke="#17101f" strokeWidth="4" />
          <text x="99" y="338" fontSize="18" fontWeight="900" fill="#17101f">{geometry.base}°</text>

          <path d="M274 351Q286 330 301 326" fill="none" stroke="#7c3aed" strokeWidth="5" />
          <text x="265" y="338" fontSize="28" fontWeight="900" fill="#7c3aed">x</text>

          <text x="180" y="435" textAnchor="middle" fontSize="18" fontWeight="900" fill="#17101f">
            x kaç?
          </text>
        </>
      ) : null}

      {kind === "count" ? (
        <>
          <text x="180" y="95" textAnchor="middle" fontSize="22" fontWeight="900" fill="#17101f">
            Toplam kaç kare var?
          </text>
          {Array.from({ length: count.grid + 1 }, (_, index) => (
            <React.Fragment key={index}>
              <line
                x1={start + index * cell}
                y1="145"
                x2={start + index * cell}
                y2={145 + size}
                stroke="#17101f"
                strokeWidth="5"
              />
              <line
                x1={start}
                y1={145 + index * cell}
                x2={start + size}
                y2={145 + index * cell}
                stroke="#17101f"
                strokeWidth="5"
              />
            </React.Fragment>
          ))}
          <text x="180" y="425" textAnchor="middle" fontSize="17" fontWeight="800" fill="#6b7280">
            İlk gördüğünü sayıp geçme 👀
          </text>
        </>
      ) : null}
    </svg>
  );
});

function PuzzleTypeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border p-4 text-left transition ${
        active
          ? "border-violet-500 bg-violet-50 shadow-[0_12px_30px_rgba(124,58,237,0.10)]"
          : "border-border bg-white hover:border-violet-200"
      }`}
    >
      <p className="text-[12px] font-black">{title}</p>
      <p className="mt-1 text-[9px] font-bold text-muted-foreground">{description}</p>
    </button>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f7f5fb]">
      <div className="mx-auto max-w-[1280px] px-4 py-10">
        <div className="h-[360px] animate-pulse rounded-[30px] bg-white" />
      </div>
    </main>
  );
}
