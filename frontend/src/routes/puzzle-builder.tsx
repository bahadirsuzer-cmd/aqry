import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle-builder")({
  component: PuzzleBuilderPage,
});

type PuzzleKind = "count" | "geometry" | "math";

type GeometryPuzzle = {
  a: number;
  b: number;
  answer: number;
};

type MathPuzzle = {
  a: number;
  b: number;
  c: number;
  d: number;
  answer: string;
};

type CountPuzzle = {
  triangleCount: number;
  circleCount: number;
};

const SOCIAL_COPY: Record<PuzzleKind, string> = {
  count: "Gözlerine güveniyorsan cevapla 👀 Görselde kaç üçgen var? Cevabı yorumlara yaz.",
  geometry: "Bu problemi sadece yüksek IQ’lular çözebiliyor 😅 x kaç? Cevabı kalem kullanmadan bulabilir misin?",
  math: "Kalem kullanmadan çözebilir misin? Sonucu yorumlara yaz 👇",
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function makeGeometry(): GeometryPuzzle {
  const a = randomInt(3, 7) * 10;
  const maxB = Math.max(3, Math.min(8, Math.floor((150 - a) / 10)));
  const b = randomInt(3, maxB) * 10;
  return { a, b, answer: 180 - a - b };
}

function makeMath(): MathPuzzle {
  const b = randomInt(2, 9);
  const d = randomInt(2, 9);
  const a = randomInt(1, b - 1);
  const c = randomInt(1, d - 1);
  const numerator = a * d + c * b;
  const denominator = b * d;
  const divisor = gcd(numerator, denominator);
  return {
    a,
    b,
    c,
    d,
    answer: `${numerator / divisor}/${denominator / divisor}`,
  };
}

function makeCount(): CountPuzzle {
  return {
    triangleCount: randomInt(9, 15),
    circleCount: randomInt(4, 8),
  };
}

function PuzzleBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<PuzzleKind>("count");
  const [socialText, setSocialText] = useState(SOCIAL_COPY.count);
  const [geometry, setGeometry] = useState<GeometryPuzzle>(() => makeGeometry());
  const [math, setMath] = useState<MathPuzzle>(() => makeMath());
  const [count, setCount] = useState<CountPuzzle>(() => makeCount());
  const [copied, setCopied] = useState(false);
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
    if (kind === "geometry") return `${geometry.answer}°`;
    if (kind === "math") return math.answer;
    return String(count.triangleCount);
  }, [count.triangleCount, geometry.answer, kind, math.answer]);

  function selectKind(next: PuzzleKind) {
    setKind(next);
    setSocialText(SOCIAL_COPY[next]);
    setCopied(false);
  }

  function regenerate() {
    if (kind === "geometry") setGeometry(makeGeometry());
    else if (kind === "math") setMath(makeMath());
    else setCount(makeCount());
  }

  async function copyText() {
    await navigator.clipboard.writeText(socialText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadSvg() {
    if (!svgRef.current) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
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
              Ücretsiz SVG motoru
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
              1 · Tür seç
            </p>
            <h2 className="mt-2 text-[26px] font-black tracking-[-0.05em]">
              Üç format. Hepsi paylaşmalık.
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <PuzzleTypeButton
                active={kind === "count"}
                title="Kaç tane var?"
                description="Dikkat"
                onClick={() => selectKind("count")}
              />
              <PuzzleTypeButton
                active={kind === "geometry"}
                title="Geometri"
                description="x kaç?"
                onClick={() => selectKind("geometry")}
              />
              <PuzzleTypeButton
                active={kind === "math"}
                title="Matematik"
                description="Kesir problemi"
                onClick={() => selectKind("math")}
              />
            </div>

            <button
              type="button"
              onClick={regenerate}
              className="mt-4 h-11 rounded-full bg-black px-5 text-[10px] font-black text-white"
            >
              Yeni soru üret ↻
            </button>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">
              2 · Paylaşım metni
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              AQRYO bir öneri verir. İstersen tamamen değiştir. Cevaplar ve tartışma X’te gönderinin altında kalsın.
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
                onClick={() => void copyText()}
                className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-black"
              >
                {copied ? "Kopyalandı ✓" : "Metni kopyala"}
              </button>
              <button
                type="button"
                onClick={downloadSvg}
                className="h-11 rounded-full bg-violet-600 px-5 text-[10px] font-black text-white"
              >
                SVG indir
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-violet-100 bg-violet-50/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black text-violet-950">Cevap · sadece creator için</p>
                <p className="mt-1 text-[10px] text-violet-900/60">
                  Paylaşım görselinde cevap görünmez.
                </p>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-[14px] font-black text-violet-700">
                {answer}
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-dashed border-border bg-white p-5">
            <p className="text-[11px] font-black">AI görsel kullanmak istersen</p>
            <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
              Ücretsiz kota vermiyoruz. AI ile özel görsel üretimi krediyle açılacak; manuel görsel yükleme ücretsiz kalacak.
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
              geometry={geometry}
              math={math}
              count={count}
            />
          </div>

          <p className="mt-3 text-center text-[9px] leading-4 text-muted-foreground">
            Görsel AQRYO içinde ücretsiz SVG olarak üretilir. Süre, şık ve skor yok.
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
    geometry: GeometryPuzzle;
    math: MathPuzzle;
    count: CountPuzzle;
  }
>(function PuzzleSvg({ kind, geometry, math, count }, ref) {
  const shapes = Array.from({ length: count.triangleCount + count.circleCount }, (_, index) => ({
    triangle: index < count.triangleCount,
    x: 52 + (index % 5) * 58,
    y: 150 + Math.floor(index / 5) * 58,
  }));

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 480"
      className="w-full rounded-[22px]"
      role="img"
      aria-label="AQRYO puzzle"
    >
      <defs>
        <linearGradient id="aqryo-bg" x1="0" y1="0" x2="360" y2="480">
          <stop offset="0" stopColor="#f5f3ff" />
          <stop offset="1" stopColor="#fdf4ff" />
        </linearGradient>
      </defs>

      <rect width="360" height="480" rx="28" fill="url(#aqryo-bg)" />
      <circle cx="54" cy="52" r="24" fill="#74f0de" />
      <text x="54" y="60" textAnchor="middle" fontSize="22" fontWeight="900" fill="#17101f">Q</text>
      <text x="88" y="58" fontSize="16" fontWeight="900" fill="#17101f">AQRYO</text>

      {kind === "count" ? (
        <>
          <text x="28" y="112" fontSize="25" fontWeight="900" fill="#17101f">Kaç üçgen var?</text>
          {shapes.map((shape, index) =>
            shape.triangle ? (
              <path
                key={index}
                d={`M${shape.x} ${shape.y - 18}L${shape.x - 19} ${shape.y + 17}L${shape.x + 19} ${shape.y + 17}Z`}
                fill={index % 2 === 0 ? "#8b5cf6" : "#c4b5fd"}
              />
            ) : (
              <circle
                key={index}
                cx={shape.x}
                cy={shape.y}
                r="18"
                fill={index % 2 === 0 ? "#f0abfc" : "#fbcfe8"}
              />
            ),
          )}
          <text x="28" y="448" fontSize="14" fontWeight="800" fill="#6b7280">Cevabını gönderinin altına yaz 👇</text>
        </>
      ) : null}

      {kind === "geometry" ? (
        <>
          <text x="28" y="112" fontSize="24" fontWeight="900" fill="#17101f">x kaç?</text>
          <path d="M60 365L180 150L306 365Z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="7" strokeLinejoin="round" />
          <path d="M180 150L180 365" stroke="#c4b5fd" strokeWidth="3" strokeDasharray="8 8" />
          <text x="83" y="350" fontSize="20" fontWeight="900" fill="#17101f">{geometry.a}°</text>
          <text x="248" y="350" fontSize="20" fontWeight="900" fill="#17101f">{geometry.b}°</text>
          <text x="170" y="190" fontSize="24" fontWeight="900" fill="#7c3aed">x</text>
          <text x="28" y="448" fontSize="14" fontWeight="800" fill="#6b7280">Kalem kullanmadan çözebilir misin?</text>
        </>
      ) : null}

      {kind === "math" ? (
        <>
          <text x="28" y="112" fontSize="24" fontWeight="900" fill="#17101f">Kalem kullanmadan çöz.</text>
          <g transform="translate(36 180)">
            <text x="35" y="38" textAnchor="middle" fontSize="34" fontWeight="900" fill="#17101f">{math.a}</text>
            <line x1="10" y1="52" x2="60" y2="52" stroke="#17101f" strokeWidth="4" />
            <text x="35" y="91" textAnchor="middle" fontSize="34" fontWeight="900" fill="#17101f">{math.b}</text>

            <text x="92" y="64" fontSize="40" fontWeight="900" fill="#7c3aed">+</text>

            <text x="164" y="38" textAnchor="middle" fontSize="34" fontWeight="900" fill="#17101f">{math.c}</text>
            <line x1="139" y1="52" x2="189" y2="52" stroke="#17101f" strokeWidth="4" />
            <text x="164" y="91" textAnchor="middle" fontSize="34" fontWeight="900" fill="#17101f">{math.d}</text>

            <text x="218" y="64" fontSize="40" fontWeight="900" fill="#7c3aed">= ?</text>
          </g>
          <text x="28" y="448" fontSize="14" fontWeight="800" fill="#6b7280">Cevabı yorumlara yaz 👇</text>
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
