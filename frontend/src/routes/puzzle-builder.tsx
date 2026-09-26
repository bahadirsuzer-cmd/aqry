import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { savePublishedExperience } from "@/services/experiences";
import { uploadExperienceImage } from "@/services/media";
import {
  generatePuzzle,
  puzzleFamilyIds,
  PUZZLE_CATEGORIES,
  PUZZLE_FAMILY_COUNT,
  type Puzzle,
  type PuzzleCategory,
} from "@/services/puzzleTemplates";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/puzzle-builder")({ component: PuzzleBuilder });
const SESSION_KEY = "aqry-puzzle-recent-families";

async function pngFromSvg(svg: string): Promise<File> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 720;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Görsel hazırlanamadı.");
    context.drawImage(image, 0, 0, 960, 720);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (output) => (output ? resolve(output) : reject(new Error("Görsel hazırlanamadı."))),
        "image/png",
      ),
    );
    return new File([blob], "puzzle.png", { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function PuzzleBuilder() {
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [category, setCategory] = useState<PuzzleCategory | "Tümü">("Tümü");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [duelMode, setDuelMode] = useState(false);

  useEffect(() => {
    let active = true;
    void getCurrentCreator().then((creator) => {
      if (!active) return;
      if (!creator) {
        window.location.href = "/creator-auth";
        return;
      }
      setCreatorId(creator.id);
      let history: string[] = [];
      try {
        history = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]") as string[];
      } catch {
        /* corrupt session history */
      }
      const next = generatePuzzle("Tümü", history);
      const updated = [...history.filter((id) => id !== next.family), next.family].slice(
        -PUZZLE_FAMILY_COUNT,
      );
      setPuzzle(next);
      setRecent(updated);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    });
    return () => {
      active = false;
    };
  }, []);

  function nextPuzzle(nextCategory = category) {
    const ids = puzzleFamilyIds(nextCategory);
    const relevant = recent.filter((id) => ids.includes(id));
    // When the pool is exhausted, start another pass, but avoid the immediately preceding family.
    const exhausted = relevant.length >= ids.length;
    const blocked = exhausted ? (puzzle && ids.length > 1 ? [puzzle.family] : []) : relevant;
    const next = generatePuzzle(nextCategory, blocked);
    const updated = [
      ...(exhausted ? [] : recent).filter((id) => id !== next.family),
      next.family,
    ].slice(-PUZZLE_FAMILY_COUNT);
    setPuzzle(next);
    setRecent(updated);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setPublishedUrl("");
    setShowAnswer(false);
    setDuelMode(false);
    setError("");
  }

  async function publish() {
    if (!puzzle || !creatorId || publishing) return;
    setPublishing(true);
    setError("");
    try {
      const image = await uploadExperienceImage(creatorId, await pngFromSvg(puzzle.svg));
      const id = crypto.randomUUID();
      await savePublishedExperience({
        id,
        creatorId,
        type: "guess",
        status: "published",
        publishedAt: new Date().toISOString(),
        title: puzzle.title,
        description: duelMode ? puzzle.duel : puzzle.cta,
        cover: { style: "purple", label: `Puzzle · ${puzzle.category}`, imageUrl: image.publicUrl },
        questions: [],
        results: [
          { id: "correct", title: `${puzzle.answer} · Doğru!`, description: puzzle.explanation },
        ],
        offer: { enabled: false, title: "", description: "", price: 0 },
        guess: {
          prompt: duelMode ? puzzle.duel : puzzle.question,
          acceptedAnswers: [String(puzzle.answer)],
          successTitle: `${puzzle.answer} · Doğru!`,
          successDescription: puzzle.explanation,
          retryEnabled: true,
        },
      });
      setPublishedUrl(`${window.location.origin}/experience/${id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Yayınlama başarısız oldu.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8fb] text-[#201932]">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-violet-600">
              AQRYO STUDIO / PUZZLE
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
              Bir soru. İki iddia. Bol yorum.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              {PUZZLE_FAMILY_COUNT} ayrı problem ailesinden gerçek sayma, geometri ve işlem
              bulmacaları. Her sorunun çözümü ve yaygın bir yanlış cevabı hazır.
            </p>
          </div>
          <Link
            to="/creator-studio"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold"
          >
            ← Stüdyoya dön
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" aria-label="Puzzle türü">
          {(["Tümü", ...PUZZLE_CATEGORIES] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCategory(item);
                nextPuzzle(item);
              }}
              aria-pressed={category === item}
              className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${category === item ? "bg-violet-700 text-white" : "border border-slate-200 bg-white hover:border-violet-400"}`}
            >
              {item}
            </button>
          ))}
        </div>
        {puzzle ? (
          <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">
            <section className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-xl shadow-violet-100/40">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-violet-600">
                    {puzzle.category}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{puzzle.title}</h2>
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-700">
                  ✓ Çözümü doğrulandı
                </span>
              </div>
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(puzzle.svg)}`}
                alt={`${puzzle.title} sorusunun işaretli geometrik veya matematiksel çizimi`}
                className="aspect-[4/3] w-full object-contain"
              />
              <div className="p-5">
                <p className="text-lg font-black">{duelMode ? puzzle.duel : puzzle.question}</p>
                <p className="mt-2 text-sm text-slate-600">{puzzle.cta}</p>
              </div>
            </section>
            <aside className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Paylaşım kurgusu
                </p>
                <button
                  type="button"
                  disabled={Boolean(publishedUrl)}
                  onClick={() => setDuelMode(!duelMode)}
                  aria-pressed={duelMode}
                  className={`mt-4 w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold disabled:opacity-60 ${duelMode ? "border-violet-500 bg-violet-50" : "border-slate-200"}`}
                >
                  ⚖ Kim haklı? versiyonu {duelMode ? "✓" : ""}
                </button>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{puzzle.duel}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-sm font-black text-violet-700"
                >
                  {showAnswer ? "Çözümü gizle ↑" : "Çözümü ve yaygın yanlışı göster ↓"}
                </button>
                {showAnswer ? (
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <b>Doğru cevap:</b> {puzzle.answer}
                    </p>
                    <p>
                      <b>Yaygın yanlış:</b> {puzzle.commonWrong}
                    </p>
                    <p className="leading-6 text-slate-600">{puzzle.explanation}</p>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => nextPuzzle()}
                className="w-full rounded-2xl border-2 border-violet-300 bg-white px-5 py-4 text-sm font-black text-violet-800 hover:bg-violet-50"
              >
                ↻ Yeni soru üret
              </button>
              <button
                type="button"
                disabled={!creatorId || publishing}
                onClick={() => void publish()}
                className="w-full rounded-2xl bg-[#211638] px-5 py-4 text-sm font-black text-white disabled:opacity-50"
              >
                {publishing ? "Görsel yükleniyor ve yayınlanıyor..." : "Puzzle'ı yayınla →"}
              </button>
              {error ? (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              {publishedUrl ? (
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
                  <b>Yayında!</b>
                  <a
                    href={publishedUrl}
                    className="mt-2 block break-all font-bold text-emerald-700 underline"
                  >
                    {publishedUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(publishedUrl)}
                    className="mt-3 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
                  >
                    Linki kopyala
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${duelMode ? puzzle.duel : puzzle.cta} ${publishedUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-emerald-300 px-4 py-2 text-xs font-bold"
                    >
                      X'te paylaş ↗
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publishedUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-emerald-300 px-4 py-2 text-xs font-bold"
                    >
                      Facebook'ta paylaş ↗
                    </a>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        ) : (
          <p className="mt-10">Puzzle hazırlanıyor...</p>
        )}
      </div>
    </main>
  );
}
