import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { useAqryoLocale, type AqryoLocale } from "@/lib/i18n";
import { makeViralPuzzle, VIRAL_FAMILIES, type ViralKind, type ViralPuzzle } from "@/lib/viralPuzzleBank";
import { localizedPuzzleSteps } from "@/lib/puzzleSolutionI18n";
import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle-builder")({
  component: PuzzleBuilderPage,
});

type PuzzleKind = ViralKind;
type BasePuzzleKind = Exclude<PuzzleKind, "pattern">;
type Presentation = "clean" | "debate";
type Puzzle = ViralPuzzle & { id: string };

const DISABLED_DEBATE_TEMPLATE_IDS = new Set([3, 12, 16, 19, 29]);
const DEBATE_TEMPLATE_IDS = Array.from({ length: 40 }, (_, index) => index + 1).filter((id) => !DISABLED_DEBATE_TEMPLATE_IDS.has(id));
const COMPACT_DEBATE_TEMPLATES = new Set(DEBATE_TEMPLATE_IDS);

function pickDebateTemplate(previous?: number) {
  const pool = DEBATE_TEMPLATE_IDS.filter((id) => id !== previous);
  return pool[Math.floor(Math.random() * pool.length)] ?? 1;
}

function debateSprite(templateId: number) {
  const zero = templateId - 1;
  return {
    src: `/puzzle/who-is-right/kim-hakli-set-${Math.floor(zero / 10) + 1}.webp`,
    column: zero % 10,
  };
}

async function loadDebateTemplate(templateId: number) {
  const { src, column } = debateSprite(templateId);
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Debate template could not be loaded"));
    image.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const frameWidth = image.naturalWidth / 10;
  const frameHeight = image.naturalHeight;
  if (!Number.isFinite(frameWidth) || frameWidth <= 0 || frameHeight <= 0) {
    throw new Error("Debate template has invalid dimensions");
  }
  context.drawImage(image, column * frameWidth, 0, frameWidth, frameHeight, 0, 0, 1080, 1350);
  return canvas.toDataURL("image/jpeg", 0.94);
}

const ALGEBRA_TEMPLATE_IDS = Array.from({ length: 10 }, (_, index) => index + 1);

function pickAlgebraTemplate(previous?: number) {
  const pool = ALGEBRA_TEMPLATE_IDS.filter((id) => id !== previous);
  return pool[Math.floor(Math.random() * pool.length)] ?? 1;
}

const ALGEBRA_CHALLENGE_IDS = Array.from({ length: 10 }, (_, index) => index);

function pickAlgebraChallenge(previous?: number) {
  const pool = ALGEBRA_CHALLENGE_IDS.filter((id) => id !== previous);
  return pool[Math.floor(Math.random() * pool.length)] ?? 0;
}

const ALGEBRA_CHALLENGES: Record<AqryoLocale, readonly string[]> = {
  tr: [
    "bunu 6 saniyede çözen çıkmadı",
    "Bu soruda çoğu kişi takılıyor",
    "Kalem kullanmadan çözebilir misin?",
    "İlk denemede çözen çıkmadı",
    "Çözemezsen kızma",
    "Yorumlara bakmadan çözebilir misin?",
    "Cevabı yorumlara yaz",
    "Matematikte ne kadar iyisin görelim",
    "Dürüst ol, kaç saniyede çözdün?",
    "bakalım ilk kim çözecek",
  ],
  en: [
    "No one has solved this in 6 seconds",
    "Most people get stuck on this question",
    "Can you solve it without using a pen?",
    "No one solved it on the first try",
    "Don't get mad if you can't solve it",
    "Can you solve it without looking at the comments?",
    "Write your answer in the comments",
    "Let's see how good you are at math",
    "Be honest, how many seconds did it take you?",
    "Let's see who solves it first",
  ],
  es: [
    "Nadie ha resuelto esto en 6 segundos",
    "La mayoría se atasca con esta pregunta",
    "¿Puedes resolverlo sin usar lápiz?",
    "Nadie lo resolvió en el primer intento",
    "No te enfades si no puedes resolverlo",
    "¿Puedes resolverlo sin mirar los comentarios?",
    "Escribe tu respuesta en los comentarios",
    "Veamos qué tan bueno eres en matemáticas",
    "Sé sincero, ¿cuántos segundos tardaste?",
    "Veamos quién lo resuelve primero",
  ],
  pt: [
    "Ninguém conseguiu resolver isto em 6 segundos",
    "A maioria das pessoas trava nesta pergunta",
    "Consegue resolver sem usar caneta?",
    "Ninguém resolveu na primeira tentativa",
    "Não fique bravo se não conseguir resolver",
    "Consegue resolver sem olhar os comentários?",
    "Escreva sua resposta nos comentários",
    "Vamos ver o quanto você é bom em matemática",
    "Seja sincero, quantos segundos você levou?",
    "Vamos ver quem resolve primeiro",
  ],
  fr: [
    "Personne n'a résolu ça en 6 secondes",
    "La plupart des gens bloquent sur cette question",
    "Peux-tu le résoudre sans utiliser de stylo ?",
    "Personne ne l'a résolu du premier coup",
    "Ne te fâche pas si tu n'y arrives pas",
    "Peux-tu le résoudre sans regarder les commentaires ?",
    "Écris ta réponse dans les commentaires",
    "Voyons à quel point tu es bon en maths",
    "Sois honnête, combien de secondes as-tu mis ?",
    "Voyons qui le résoudra en premier",
  ],
  de: [
    "Niemand hat das in 6 Sekunden gelöst",
    "Bei dieser Frage kommen die meisten ins Stocken",
    "Kannst du es ohne Stift lösen?",
    "Beim ersten Versuch hat es niemand gelöst",
    "Sei nicht sauer, wenn du es nicht lösen kannst",
    "Kannst du es lösen, ohne in die Kommentare zu schauen?",
    "Schreib deine Antwort in die Kommentare",
    "Mal sehen, wie gut du in Mathe bist",
    "Sei ehrlich, wie viele Sekunden hast du gebraucht?",
    "Mal sehen, wer es zuerst löst",
  ],
  it: [
    "Nessuno l'ha risolto in 6 secondi",
    "La maggior parte delle persone si blocca su questa domanda",
    "Riesci a risolverlo senza usare una penna?",
    "Nessuno l'ha risolto al primo tentativo",
    "Non arrabbiarti se non riesci a risolverlo",
    "Riesci a risolverlo senza guardare i commenti?",
    "Scrivi la risposta nei commenti",
    "Vediamo quanto sei bravo in matematica",
    "Sii onesto, quanti secondi ci hai messo?",
    "Vediamo chi lo risolve per primo",
  ],
  ar: [
    "لم يتمكن أحد من حلها خلال 6 ثوانٍ",
    "معظم الناس يتعثرون في هذا السؤال",
    "هل يمكنك حلها من دون استخدام قلم؟",
    "لم يحلها أحد من المحاولة الأولى",
    "لا تغضب إذا لم تستطع حلها",
    "هل يمكنك حلها من دون النظر إلى التعليقات؟",
    "اكتب إجابتك في التعليقات",
    "لنرَ مدى براعتك في الرياضيات",
    "كن صريحًا، كم ثانية استغرقت؟",
    "لنرَ من سيحلها أولًا",
  ],
  hi: [
    "इसे 6 सेकंड में कोई हल नहीं कर पाया",
    "इस सवाल पर ज्यादातर लोग अटक जाते हैं",
    "क्या तुम इसे बिना पेन के हल कर सकते हो?",
    "पहली कोशिश में कोई इसे हल नहीं कर पाया",
    "हल न हो तो गुस्सा मत होना",
    "क्या तुम कमेंट देखे बिना इसे हल कर सकते हो?",
    "अपना जवाब कमेंट में लिखो",
    "देखते हैं तुम गणित में कितने अच्छे हो",
    "ईमानदारी से बताओ, कितने सेकंड लगे?",
    "देखते हैं सबसे पहले कौन हल करेगा",
  ],
  id: [
    "Belum ada yang menyelesaikannya dalam 6 detik",
    "Kebanyakan orang terjebak di soal ini",
    "Bisakah kamu menyelesaikannya tanpa pena?",
    "Belum ada yang berhasil di percobaan pertama",
    "Jangan marah kalau kamu tidak bisa menyelesaikannya",
    "Bisakah kamu menyelesaikannya tanpa melihat komentar?",
    "Tulis jawabanmu di komentar",
    "Mari lihat seberapa jago kamu dalam matematika",
    "Jujur, berapa detik yang kamu butuhkan?",
    "Mari lihat siapa yang menyelesaikannya lebih dulu",
  ],
  ru: [
    "Никто не решил это за 6 секунд",
    "На этом вопросе большинство застревает",
    "Сможешь решить без ручки?",
    "С первой попытки никто не решил",
    "Не злись, если не сможешь решить",
    "Сможешь решить, не заглядывая в комментарии?",
    "Напиши ответ в комментариях",
    "Посмотрим, насколько ты хорош в математике",
    "Честно, за сколько секунд ты решил?",
    "Посмотрим, кто решит первым",
  ],
  bn: [
    "৬ সেকেন্ডে কেউ এটি সমাধান করতে পারেনি",
    "এই প্রশ্নে বেশিরভাগ মানুষ আটকে যায়",
    "কলম ব্যবহার না করে সমাধান করতে পারবে?",
    "প্রথম চেষ্টায় কেউ সমাধান করতে পারেনি",
    "সমাধান না হলে রাগ করো না",
    "কমেন্ট না দেখে সমাধান করতে পারবে?",
    "উত্তর কমেন্টে লেখো",
    "দেখি গণিতে তুমি কতটা ভালো",
    "সত্যি বলো, কত সেকেন্ড লেগেছে?",
    "দেখি সবার আগে কে সমাধান করে",
  ],
  ur: [
    "6 سیکنڈ میں کوئی اسے حل نہیں کر سکا",
    "اس سوال پر زیادہ تر لوگ اٹک جاتے ہیں",
    "کیا تم اسے قلم کے بغیر حل کر سکتے ہو؟",
    "پہلی کوشش میں کوئی حل نہیں کر سکا",
    "حل نہ ہو تو ناراض مت ہونا",
    "کیا تم تبصرے دیکھے بغیر اسے حل کر سکتے ہو؟",
    "اپنا جواب تبصروں میں لکھو",
    "دیکھتے ہیں تم ریاضی میں کتنے اچھے ہو",
    "سچ بتاؤ، کتنے سیکنڈ لگے؟",
    "دیکھتے ہیں سب سے پہلے کون حل کرتا ہے",
  ],
  vi: [
    "Chưa ai giải được bài này trong 6 giây",
    "Hầu hết mọi người đều mắc ở câu này",
    "Bạn có thể giải mà không dùng bút không?",
    "Chưa ai giải được ngay lần đầu",
    "Đừng giận nếu bạn không giải được",
    "Bạn có thể giải mà không xem bình luận không?",
    "Viết đáp án của bạn vào bình luận",
    "Hãy xem bạn giỏi toán đến mức nào",
    "Thành thật đi, bạn mất bao nhiêu giây?",
    "Xem ai sẽ giải được đầu tiên",
  ],
  fil: [
    "Wala pang nakalutas nito sa loob ng 6 na segundo",
    "Karamihan ay natitigil sa tanong na ito",
    "Kaya mo bang lutasin ito nang walang panulat?",
    "Walang nakalutas nito sa unang subok",
    "Huwag magalit kung hindi mo ito malutas",
    "Kaya mo bang lutasin ito nang hindi tumitingin sa comments?",
    "Isulat ang sagot mo sa comments",
    "Tingnan natin kung gaano ka kagaling sa math",
    "Maging tapat, ilang segundo ang inabot mo?",
    "Tingnan natin kung sino ang unang makakalutas",
  ],
};

function algebraSprite(templateId: number) {
  return {
    src: "/puzzle/algebra/algebra-set-1.webp",
    column: Math.max(0, Math.min(9, templateId - 1)),
  };
}

async function loadAlgebraTemplate(templateId: number) {
  const { src, column } = algebraSprite(templateId);
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Algebra template could not be loaded"));
    image.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, column * 432, 0, 432, 540, 0, 0, 1080, 1350);
  return canvas.toDataURL("image/jpeg", 0.94);
}

const SCENE_TEMPLATES = [
  "/puzzle/scenes/scene-01-cleopatra.webp",
  "/puzzle/scenes/scene-02-frida.webp",
  "/puzzle/scenes/scene-03-rooftop-woman.webp",
  "/puzzle/scenes/scene-04-aviator.webp",
  "/puzzle/scenes/scene-05-samurai.webp",
  "/puzzle/scenes/scene-06-athlete.webp",
  "/puzzle/scenes/scene-07-tesla.webp",
  "/puzzle/scenes/scene-08-van-gogh.webp",
  "/puzzle/scenes/scene-09-knight.webp",
  "/puzzle/scenes/scene-10-einstein.webp",
  "/puzzle/scenes/scene-11-gallery-woman.webp",
  "/puzzle/scenes/scene-12-architect.webp",
  "/puzzle/scenes/scene-13-racer.webp",
  "/puzzle/scenes/scene-14-chef.webp",
  "/puzzle/scenes/scene-15-ballerina.webp",
  "/puzzle/scenes/scene-16-pilot.webp",
  "/puzzle/scenes/scene-17-boxer.webp",
  "/puzzle/scenes/scene-18-guitarist.webp",
  "/puzzle/scenes/scene-19-photographer.webp",
  "/puzzle/scenes/scene-20-archaeologist.webp",
] as const;

function nextSceneTemplate(current?: number) {
  if (typeof current !== "number") return Math.floor(Math.random() * SCENE_TEMPLATES.length);
  return (current + 1) % SCENE_TEMPLATES.length;
}

async function loadSceneTemplate(templateIndex: number) {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Scene template could not be loaded"));
    image.src = SCENE_TEMPLATES[templateIndex] ?? SCENE_TEMPLATES[0];
  });
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, 0, 0, 1080, 1350);
  return canvas.toDataURL("image/jpeg", 0.94);
}

function wrapHeadline(value: string, maxChars = 20) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [value];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function puzzleQuestionRows(diagram: string) {
  const decode = (value: string) => value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"');
  return [...diagram.matchAll(/<text[^>]*>(.*?)<\/text>/g)]
    .map((match) => decode(match[1].replace(/<[^>]+>/g, "").trim()))
    .filter(Boolean)
    .slice(0, 4);
}

async function puzzlePng(
  source: string,
  name: string,
  fourByFive = false,
  backgroundDataUrl?: string | null,
): Promise<File> {
  const svgUrl = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Puzzle image could not be rendered"));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = fourByFive ? 1350 : 1440;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (backgroundDataUrl) {
      const background = new Image();
      await new Promise<void>((resolve, reject) => {
        background.onload = () => resolve();
        background.onerror = () => reject(new Error("Puzzle background could not be rendered"));
        background.src = backgroundDataUrl;
      });

      const sourceWidth = background.naturalWidth || background.width;
      const sourceHeight = background.naturalHeight || background.height;
      const sourceRatio = sourceWidth / sourceHeight;
      const targetRatio = canvas.width / canvas.height;

      let sx = 0;
      let sy = 0;
      let sw = sourceWidth;
      let sh = sourceHeight;

      if (sourceRatio > targetRatio) {
        sw = sourceHeight * targetRatio;
        sx = (sourceWidth - sw) / 2;
      } else if (sourceRatio < targetRatio) {
        sh = sourceWidth / targetRatio;
        sy = (sourceHeight - sh) / 2;
      }

      context.drawImage(
        background,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("PNG unavailable")), "image/png");
    });
    return new File([blob], name, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function downloadPng(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

type PuzzleCopy = {
  descriptions: Record<BasePuzzleKind, string>;
  titles: Record<BasePuzzleKind, string>;
  subtitles: Record<BasePuzzleKind, string>;
  cleanDesc: string;
  debateDesc: string;
  debateQuestion: string;
  changeVisual: string;
};

const RECENT_LIMIT = 40;
const ROTATION_STORAGE_KEY = "aqryo-puzzle-rotation-v2";
type RecentFamilies = Record<PuzzleKind, string[]>;
const emptyRecent = (): RecentFamilies => ({math:[],geometry:[],count:[],algebra:[],area:[],pattern:[]});

function readRecent(): RecentFamilies {
  if(typeof window==="undefined") return emptyRecent();
  try {
    const saved = JSON.parse(window.localStorage.getItem(ROTATION_STORAGE_KEY) ?? "null");
    const recent = emptyRecent();
    for(const kind of Object.keys(recent) as PuzzleKind[]) {
      const valid = new Set(VIRAL_FAMILIES.filter((family)=>family.kind===kind).map((family)=>family.id));
      if(Array.isArray(saved?.[kind])) recent[kind] = [...new Set(saved[kind].filter((id: unknown)=>typeof id==="string" && valid.has(id as string)))].slice(0,RECENT_LIMIT) as string[];
    }
    return recent;
  } catch { return emptyRecent(); }
}

const COPY: Record<AqryoLocale, PuzzleCopy> = {
  tr: {
    descriptions: {
      math: "İşlem önceliği, parantez, yüzde ve üs tuzakları",
      geometry: "Kontrollü şablonlardan üretilen çok adımlı açı problemleri",
      count: "Gizli üçgenler, kesişen kareler ve birleşik şekiller",
      algebra: "Semboller, özdeşlikler ve eksik bilgi tuzakları",
      area: "Çevre, Pisagor ve çok adımlı uzunluklar",
    },
    titles: {
      math: "Sonuç kaç?",
      geometry: "x açısını bul",
      count: "Toplam kaç tane?",
      algebra: "x kaç?",
      area: "Eksik değeri bul",
    },
    subtitles: {
      math: "İlk gördüğün işlemi yapma 👀",
      geometry: "Şekle bir kez daha bak",
      count: "Küçük parçalar sadece başlangıç",
      algebra: "Kısa görünüyor, dikkat istiyor",
      area: "Doğru formülü seç",
    },
    cleanDesc: "Tek soru · temiz kart",
    debateDesc: "İki cevap · yorumlarda tartışma",
    debateQuestion: "Kim haklı?",
    changeVisual: "Görseli değiştir",
  },
  en: {
    descriptions: {
      math: "Order of operations, brackets, percentages and powers",
      geometry: "Angles, parallel lines, vertical angles and polygons",
      count: "Hidden triangles and overlapping squares",
      algebra: "Symbols, identities and missing information",
      area: "Perimeter, Pythagoras and multi-step lengths",
    },
    titles: {
      math: "What is the result?",
      geometry: "Find angle x",
      count: "How many in total?",
      algebra: "Solve for x",
      area: "Find the missing value",
    },
    subtitles: {
      math: "Don’t do the first operation you see 👀",
      geometry: "Look at the diagram one more time",
      count: "The small shapes are only the start",
      algebra: "Looks short. Think carefully.",
      area: "Choose the right formula",
    },
    cleanDesc: "One question · clean card",
    debateDesc: "Two answers · built for comments",
    debateQuestion: "Who is right?",
    changeVisual: "Change visual",
  },
  es: {
    descriptions:{math:"Prioridad, paréntesis, porcentajes y potencias",geometry:"Ángulos, paralelas, opuestos y polígonos",count:"Triángulos ocultos y cuadrados superpuestos",algebra:"Símbolos, identidades e información insuficiente",area:"Área, perímetro, Pitágoras y figuras compuestas"},
    titles:{math:"¿Cuál es el resultado?",geometry:"Halla el ángulo x",count:"¿Cuántos hay en total?",algebra:"Halla x",area:"Halla el valor que falta"},
    subtitles:{math:"No hagas primero lo que ves primero 👀",geometry:"Mira el dibujo otra vez",count:"Las figuras pequeñas son solo el inicio",algebra:"Parece corto. Piénsalo bien.",area:"Elige la fórmula correcta"},
    cleanDesc:"Una pregunta · tarjeta limpia",debateDesc:"Dos respuestas · para debatir",debateQuestion:"¿Quién tiene razón?",changeVisual:"Cambiar imagen",
  },
  pt: {
    descriptions:{math:"Ordem, parênteses, porcentagens e potências",geometry:"Ângulos, paralelas, opostos e polígonos",count:"Triângulos ocultos e quadrados sobrepostos",algebra:"Símbolos, identidades e dados insuficientes",area:"Área, perímetro, Pitágoras e formas compostas"},
    titles:{math:"Qual é o resultado?",geometry:"Encontre o ângulo x",count:"Quantos há no total?",algebra:"Encontre x",area:"Encontre o valor que falta"},
    subtitles:{math:"Não faça primeiro o que aparece primeiro 👀",geometry:"Olhe o desenho mais uma vez",count:"As formas pequenas são só o começo",algebra:"Parece curto. Pense bem.",area:"Escolha a fórmula certa"},
    cleanDesc:"Uma pergunta · cartão limpo",debateDesc:"Duas respostas · feito para comentários",debateQuestion:"Quem está certo?",changeVisual:"Mudar imagem",
  },
  fr: {
    descriptions:{math:"Priorités, parenthèses, pourcentages et puissances",geometry:"Angles, parallèles, opposés et polygones",count:"Triangles cachés et carrés superposés",algebra:"Symboles, identités et données insuffisantes",area:"Aire, périmètre, Pythagore et formes composées"},
    titles:{math:"Quel est le résultat ?",geometry:"Trouve l’angle x",count:"Combien au total ?",algebra:"Trouve x",area:"Trouve la valeur manquante"},
    subtitles:{math:"Ne fais pas d’abord ce que tu vois d’abord 👀",geometry:"Regarde encore une fois le schéma",count:"Les petites formes ne sont que le début",algebra:"Ça paraît court. Réfléchis bien.",area:"Choisis la bonne formule"},
    cleanDesc:"Une question · carte propre",debateDesc:"Deux réponses · pour débattre",debateQuestion:"Qui a raison ?",changeVisual:"Changer l’image",
  },
  de: {
    descriptions:{math:"Reihenfolge, Klammern, Prozent und Potenzen",geometry:"Winkel, Parallelen, Scheitelwinkel und Polygone",count:"Versteckte Dreiecke und überlappende Quadrate",algebra:"Symbole, Identitäten und fehlende Angaben",area:"Fläche, Umfang, Pythagoras und zusammengesetzte Formen"},
    titles:{math:"Was ist das Ergebnis?",geometry:"Finde den Winkel x",count:"Wie viele insgesamt?",algebra:"Löse nach x",area:"Finde den fehlenden Wert"},
    subtitles:{math:"Nicht einfach von links nach rechts 👀",geometry:"Schau noch einmal auf die Zeichnung",count:"Die kleinen Formen sind nur der Anfang",algebra:"Sieht kurz aus. Denk genau nach.",area:"Wähle die richtige Formel"},
    cleanDesc:"Eine Frage · saubere Karte",debateDesc:"Zwei Antworten · für Kommentare",debateQuestion:"Wer hat recht?",changeVisual:"Bild ändern",
  },
  it: {
    descriptions:{math:"Priorità, parentesi, percentuali e potenze",geometry:"Angoli, parallele, opposti e poligoni",count:"Triangoli nascosti e quadrati sovrapposti",algebra:"Simboli, identità e dati insufficienti",area:"Area, perimetro, Pitagora e figure composte"},
    titles:{math:"Qual è il risultato?",geometry:"Trova l’angolo x",count:"Quanti sono in totale?",algebra:"Trova x",area:"Trova il valore mancante"},
    subtitles:{math:"Non fare per prima l’operazione che vedi 👀",geometry:"Guarda il disegno ancora una volta",count:"Le forme piccole sono solo l’inizio",algebra:"Sembra breve. Pensaci bene.",area:"Scegli la formula giusta"},
    cleanDesc:"Una domanda · card pulita",debateDesc:"Due risposte · fatta per i commenti",debateQuestion:"Chi ha ragione?",changeVisual:"Cambia immagine",
  },
  ar: {
    descriptions:{math:"ترتيب العمليات والأقواس والنسب والأسس",geometry:"الزوايا والمتوازيات والزوايا المتقابلة والمضلعات",count:"مثلثات مخفية ومربعات متداخلة",algebra:"رموز ومتطابقات ومعلومات ناقصة",area:"مساحة ومحيط وفيثاغورس وأشكال مركبة"},
    titles:{math:"ما النتيجة؟",geometry:"أوجد الزاوية x",count:"كم العدد الكلي؟",algebra:"أوجد x",area:"أوجد القيمة الناقصة"},
    subtitles:{math:"لا تبدأ بأول عملية تراها 👀",geometry:"انظر إلى الشكل مرة أخرى",count:"الأشكال الصغيرة ليست كل شيء",algebra:"يبدو قصيرًا. فكّر جيدًا.",area:"اختر القانون الصحيح"},
    cleanDesc:"سؤال واحد · بطاقة نظيفة",debateDesc:"إجابتان · للنقاش",debateQuestion:"من الصحيح؟",changeVisual:"تغيير الصورة",
  },
  hi: {
    descriptions:{math:"ऑपरेशन क्रम, ब्रैकेट, प्रतिशत और घात",geometry:"कोण, समानांतर रेखाएँ, विपरीत कोण और बहुभुज",count:"छिपे त्रिभुज और एक दूसरे पर बने वर्ग",algebra:"प्रतीक, सर्वसमिकाएँ और अधूरी जानकारी",area:"क्षेत्रफल, परिमाप, पाइथागोरस और संयुक्त आकृतियाँ"},
    titles:{math:"उत्तर क्या है?",geometry:"कोण x ज्ञात करें",count:"कुल कितने हैं?",algebra:"x ज्ञात करें",area:"लापता मान ज्ञात करें"},
    subtitles:{math:"जो पहले दिखे वही पहले मत करो 👀",geometry:"चित्र को एक बार फिर देखें",count:"छोटी आकृतियाँ सिर्फ शुरुआत हैं",algebra:"छोटा है, पर ध्यान चाहिए",area:"सही सूत्र चुनें"},
    cleanDesc:"एक सवाल · साफ कार्ड",debateDesc:"दो जवाब · चर्चा के लिए",debateQuestion:"कौन सही है?",changeVisual:"चित्र बदलें",
  },
  id: {
    descriptions:{math:"Urutan operasi, kurung, persen dan pangkat",geometry:"Sudut, garis sejajar, sudut berlawanan dan poligon",count:"Segitiga tersembunyi dan persegi bertumpuk",algebra:"Simbol, identitas dan informasi kurang",area:"Luas, keliling, Pythagoras dan bangun gabungan"},
    titles:{math:"Berapa hasilnya?",geometry:"Cari sudut x",count:"Berapa jumlah semuanya?",algebra:"Cari x",area:"Cari nilai yang hilang"},
    subtitles:{math:"Jangan kerjakan yang pertama terlihat 👀",geometry:"Lihat diagram sekali lagi",count:"Bangun kecil baru permulaan",algebra:"Terlihat singkat. Pikirkan baik-baik.",area:"Pilih rumus yang tepat"},
    cleanDesc:"Satu soal · kartu bersih",debateDesc:"Dua jawaban · untuk diskusi",debateQuestion:"Siapa yang benar?",changeVisual:"Ganti gambar",
  },
  ru: {
    descriptions:{math:"Порядок действий, скобки, проценты и степени",geometry:"Углы, параллельные, вертикальные углы и многоугольники",count:"Скрытые треугольники и пересекающиеся квадраты",algebra:"Символы, тождества и неполные данные",area:"Площадь, периметр, Пифагор и составные фигуры"},
    titles:{math:"Какой результат?",geometry:"Найди угол x",count:"Сколько всего?",algebra:"Найди x",area:"Найди неизвестное"},
    subtitles:{math:"Не спеши считать слева направо 👀",geometry:"Посмотри на рисунок ещё раз",count:"Маленькие фигуры — только начало",algebra:"Коротко, но нужна внимательность",area:"Выбери правильную формулу"},
    cleanDesc:"Один вопрос · чистая карточка",debateDesc:"Два ответа · для обсуждения",debateQuestion:"Кто прав?",changeVisual:"Сменить изображение",
  },
  bn: {
    descriptions:{math:"অপারেশন ক্রম, বন্ধনী, শতাংশ ও ঘাত",geometry:"কোণ, সমান্তরাল রেখা, বিপ্রতীপ কোণ ও বহুভুজ",count:"লুকানো ত্রিভুজ ও ছেদ করা বর্গ",algebra:"প্রতীক, অভেদ এবং অসম্পূর্ণ তথ্য",area:"ক্ষেত্রফল, পরিসীমা, পিথাগোরাস ও যৌগিক আকৃতি"},
    titles:{math:"ফল কত?",geometry:"x কোণ বের করুন",count:"মোট কতটি?",algebra:"x বের করুন",area:"অনুপস্থিত মান বের করুন"},
    subtitles:{math:"যেটা আগে দেখছেন সেটাই আগে করবেন না 👀",geometry:"চিত্রটি আরেকবার দেখুন",count:"ছোট আকৃতিগুলো শুধু শুরু",algebra:"ছোট দেখায়, মনোযোগ দরকার",area:"সঠিক সূত্র বেছে নিন"},
    cleanDesc:"একটি প্রশ্ন · পরিষ্কার কার্ড",debateDesc:"দুটি উত্তর · আলোচনার জন্য",debateQuestion:"কে ঠিক?",changeVisual:"ছবি বদলান",
  },
  ur: {
    descriptions:{math:"عملی ترتیب، قوسین، فیصد اور قوتیں",geometry:"زاویے، متوازی لکیریں، مقابل زاویے اور کثیرالاضلاع",count:"پوشیدہ مثلث اور ایک دوسرے پر بنے مربع",algebra:"علامتیں، شناختیں اور نامکمل معلومات",area:"رقبہ، محیط، فیثاغورث اور مرکب اشکال"},
    titles:{math:"نتیجہ کیا ہے؟",geometry:"زاویہ x معلوم کریں",count:"کل کتنے ہیں؟",algebra:"x معلوم کریں",area:"نامعلوم قدر معلوم کریں"},
    subtitles:{math:"جو پہلے نظر آئے اسے پہلے نہ کریں 👀",geometry:"شکل کو ایک بار پھر دیکھیں",count:"چھوٹی شکلیں صرف ابتدا ہیں",algebra:"مختصر ہے، مگر غور چاہیے",area:"درست فارمولا منتخب کریں"},
    cleanDesc:"ایک سوال · صاف کارڈ",debateDesc:"دو جواب · بحث کے لیے",debateQuestion:"کون درست ہے؟",changeVisual:"تصویر بدلیں",
  },
  vi: {
    descriptions:{math:"Thứ tự phép tính, ngoặc, phần trăm và lũy thừa",geometry:"Góc, song song, góc đối đỉnh và đa giác",count:"Tam giác ẩn và hình vuông chồng lên nhau",algebra:"Biểu tượng, hằng đẳng thức và thiếu dữ kiện",area:"Diện tích, chu vi, Pythagore và hình ghép"},
    titles:{math:"Kết quả là bao nhiêu?",geometry:"Tìm góc x",count:"Tổng cộng có bao nhiêu?",algebra:"Tìm x",area:"Tìm giá trị còn thiếu"},
    subtitles:{math:"Đừng làm phép tính đầu tiên bạn thấy 👀",geometry:"Nhìn hình thêm một lần nữa",count:"Các hình nhỏ chỉ là khởi đầu",algebra:"Trông ngắn nhưng cần cẩn thận",area:"Chọn đúng công thức"},
    cleanDesc:"Một câu hỏi · thẻ sạch",debateDesc:"Hai đáp án · để tranh luận",debateQuestion:"Ai đúng?",changeVisual:"Đổi hình ảnh",
  },
  fil: {
    descriptions:{math:"Order of operations, brackets, percent at powers",geometry:"Angles, parallel lines, vertical angles at polygons",count:"Nakatagong tatsulok at magkapatong na parisukat",algebra:"Mga simbolo, identity at kulang na impormasyon",area:"Area, perimeter, Pythagoras at composite shapes"},
    titles:{math:"Ano ang sagot?",geometry:"Hanapin ang angle x",count:"Ilan lahat?",algebra:"Hanapin ang x",area:"Hanapin ang nawawalang value"},
    subtitles:{math:"Huwag unahin agad ang unang nakikita 👀",geometry:"Tingnan ulit ang diagram",count:"Simula pa lang ang maliliit na hugis",algebra:"Maikli pero kailangan ng ingat",area:"Piliin ang tamang formula"},
    cleanDesc:"Isang tanong · malinis na card",debateDesc:"Dalawang sagot · para sa comments",debateQuestion:"Sino ang tama?",changeVisual:"Palitan ang larawan",
  },
};

const SOLUTION_TITLE: Record<AqryoLocale,string> = {
  tr:"Çözümü göster",en:"Show solution",es:"Ver solución",pt:"Ver solução",
  fr:"Voir la solution",de:"Lösung zeigen",it:"Mostra la soluzione",ar:"عرض الحل",
  hi:"समाधान देखें",id:"Lihat solusi",ru:"Показать решение",bn:"সমাধান দেখুন",
  ur:"حل دیکھیں",vi:"Xem lời giải",fil:"Tingnan ang solusyon",
};
const COUNT_TITLES: Record<AqryoLocale, {triangles:string;squares:string}> = {
  tr:{triangles:"Kaç üçgen var?",squares:"Kaç kare var?"},
  en:{triangles:"How many triangles?",squares:"How many squares?"},
  es:{triangles:"¿Cuántos triángulos?",squares:"¿Cuántos cuadrados?"},
  pt:{triangles:"Quantos triângulos?",squares:"Quantos quadrados?"},
  fr:{triangles:"Combien de triangles ?",squares:"Combien de carrés ?"},
  de:{triangles:"Wie viele Dreiecke?",squares:"Wie viele Quadrate?"},
  it:{triangles:"Quanti triangoli?",squares:"Quanti quadrati?"},
  ar:{triangles:"كم مثلثًا؟",squares:"كم مربعًا؟"},
  hi:{triangles:"कितने त्रिभुज?",squares:"कितने वर्ग?"},
  id:{triangles:"Berapa segitiga?",squares:"Berapa persegi?"},
  ru:{triangles:"Сколько треугольников?",squares:"Сколько квадратов?"},
  bn:{triangles:"কয়টি ত্রিভুজ?",squares:"কয়টি বর্গ?"},
  ur:{triangles:"کتنے مثلث؟",squares:"کتنے مربع؟"},
  vi:{triangles:"Có bao nhiêu tam giác?",squares:"Có bao nhiêu hình vuông?"},
  fil:{triangles:"Ilang tatsulok?",squares:"Ilang parisukat?"},
};

const AREA_TITLES: Record<AqryoLocale, {area:string;perimeter:string;length:string}> = {
  tr:{area:"Taralı alan kaç birimkare?",perimeter:"Şeklin çevresi kaç birim?",length:"x uzunluğu kaç birim?"},
  en:{area:"What is the shaded area?",perimeter:"What is the perimeter?",length:"What is the value of x?"},
  es:{area:"¿Cuánto mide el área sombreada?",perimeter:"¿Cuál es el perímetro?",length:"¿Cuánto vale x?"},
  pt:{area:"Qual é a área sombreada?",perimeter:"Qual é o perímetro?",length:"Quanto mede x?"},
  fr:{area:"Quelle est l’aire colorée ?",perimeter:"Quel est le périmètre ?",length:"Quelle est la longueur x ?"},
  de:{area:"Wie groß ist die gefärbte Fläche?",perimeter:"Wie groß ist der Umfang?",length:"Wie lang ist x?"},
  it:{area:"Quanto misura l’area colorata?",perimeter:"Qual è il perimetro?",length:"Quanto misura x?"},
  ar:{area:"ما مساحة المنطقة المظللة؟",perimeter:"ما محيط الشكل؟",length:"ما طول x؟"},
  hi:{area:"रंगे हुए भाग का क्षेत्रफल कितना है?",perimeter:"आकृति का परिमाप कितना है?",length:"x की लंबाई कितनी है?"},
  id:{area:"Berapa luas daerah berwarna?",perimeter:"Berapa keliling bangun ini?",length:"Berapa panjang x?"},
  ru:{area:"Какова площадь закрашенной части?",perimeter:"Каков периметр фигуры?",length:"Чему равна длина x?"},
  bn:{area:"রঙিন অংশের ক্ষেত্রফল কত?",perimeter:"আকৃতির পরিসীমা কত?",length:"x-এর দৈর্ঘ্য কত?"},
  ur:{area:"رنگین حصے کا رقبہ کتنا ہے؟",perimeter:"شکل کا محیط کتنا ہے؟",length:"x کی لمبائی کتنی ہے؟"},
  vi:{area:"Diện tích phần tô màu là bao nhiêu?",perimeter:"Chu vi hình này là bao nhiêu?",length:"Độ dài x là bao nhiêu?"},
  fil:{area:"Ano ang lawak ng may kulay?",perimeter:"Ano ang perimeter ng hugis?",length:"Gaano kahaba ang x?"},
};


const PATTERN_COPY: Partial<Record<AqryoLocale, {label:string;description:string;title:string;mappingTitle:string;subtitle:string}>> = {
  tr: { label:"Örüntü", description:"Sayı dizileri, girdi-çıktı ilişkileri ve gizli kurallar", title:"Sıradaki sayı kaç?", mappingTitle:"Kuralı bul", subtitle:"Gizli kuralı yakala 👀" },
  en: { label:"Pattern", description:"Number sequences, input-output relations and hidden rules", title:"What comes next?", mappingTitle:"Find the rule", subtitle:"Spot the hidden rule 👀" },
};

function patternCopy(locale:AqryoLocale) {
  return PATTERN_COPY[locale] ?? PATTERN_COPY.en!;
}

function subtitleFor(locale:AqryoLocale, kind:PuzzleKind, copy:PuzzleCopy) {
  return kind==="pattern" ? patternCopy(locale).subtitle : copy.subtitles[kind];
}

function headlineFor(locale:AqryoLocale,puzzle:Puzzle) {
  if(puzzle.kind==="algebra") {
    const diagramText = String(puzzle.diagram ?? "").replace(/<[^>]*>/g," ");
    const hasX = /(^|[^a-zA-Z])x([^a-zA-Z]|$)/i.test(diagramText);
    if(!hasX) return COPY[locale].titles.math;
  }
  if(puzzle.kind==="pattern") return puzzle.patternMode==="mapping" ? patternCopy(locale).mappingTitle : patternCopy(locale).title;
  if(puzzle.kind==="count" && puzzle.countTarget) return COUNT_TITLES[locale][puzzle.countTarget];
  if(puzzle.kind==="area" && puzzle.areaTarget) return AREA_TITLES[locale][puzzle.areaTarget];
  return COPY[locale].titles[puzzle.kind];
}

function isInvalidGeneratedPuzzle(puzzle: ViralPuzzle) {
  if (puzzle.kind !== "algebra") return false;
  const answer = String(puzzle.answer ?? "").trim().toLowerCase();
  const wrong = String(puzzle.commonWrong ?? "").trim().toLowerCase();
  return Boolean(
    puzzle.answerKey ||
    !answer ||
    answer === "?" ||
    answer.includes("unknown") ||
    answer.includes("belirsiz") ||
    wrong.includes("unknown") ||
    wrong.includes("belirsiz")
  );
}

function generate(kind: PuzzleKind, recent: string[]): Puzzle {
  const families = VIRAL_FAMILIES.filter((family) => family.kind === kind);
  const seen = recent.filter((family) => families.some((candidate) => candidate.id === family));
  const excluded = seen.length >= families.length ? [] : seen;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const next = { id: crypto.randomUUID(), ...makeViralPuzzle(kind, excluded) };
      if (isInvalidGeneratedPuzzle(next)) continue;
      return next;
    } catch (error) {
      console.error("Puzzle generation retry", error);
    }
  }

  const safeFamilies = VIRAL_FAMILIES.filter(
    (family) => family.kind === kind && family.id !== "missing_information",
  );
  for (const family of safeFamilies) {
    const next = { id: crypto.randomUUID(), family: family.id, kind: family.kind, ...family.make(Math.random) };
    if (!isInvalidGeneratedPuzzle(next)) return next;
  }

  throw new Error(`No valid puzzle could be generated for ${kind}`);
}

function ctaFor(locale: AqryoLocale, puzzle: Puzzle) {
  const copy = COPY[locale] ?? COPY.en;
  return `${headlineFor(locale,puzzle)} · ${subtitleFor(locale,puzzle.kind,copy)}`;
}

function PuzzleBuilderPage() {
  const { locale, t } = useAqryoLocale();
  const copy = COPY[locale] ?? COPY.en;
  const [loading,setLoading]=useState(true);
  const [kind,setKind]=useState<PuzzleKind>("math");
  const [presentation,setPresentation]=useState<Presentation>("debate");
  const [recent,setRecent]=useState<RecentFamilies>(readRecent);
  const [puzzle,setPuzzle]=useState<Puzzle>(()=>generate("math", []));
  const [socialText,setSocialText]=useState("");
  const [copied,setCopied]=useState(false);
  const [sharing,setSharing]=useState(false);
  const [shareImage,setShareImage]=useState<{key:string;file:File}|null>(null);
  const [debateTemplate,setDebateTemplate]=useState(()=>pickDebateTemplate());
  const [debateImage,setDebateImage]=useState<{template:number;dataUrl:string}|null>(null);
  const [algebraTemplate,setAlgebraTemplate]=useState(()=>pickAlgebraTemplate());
  const [algebraChallenge,setAlgebraChallenge]=useState(()=>pickAlgebraChallenge());
  const [algebraImage,setAlgebraImage]=useState<{template:number;dataUrl:string}|null>(null);
  const [sceneTemplate,setSceneTemplate]=useState(()=>nextSceneTemplate());
  const [sceneImage,setSceneImage]=useState<{template:number;dataUrl:string}|null>(null);
  const previewRef=useRef<HTMLDivElement|null>(null);
  const svgRef=useRef<SVGSVGElement|null>(null);

  useEffect(()=>{
    let cancelled=false;
    void getCurrentCreator()
      .then((creator)=>{
        if(!creator){ window.location.href="/creator-auth"; return; }
        if(!cancelled) setLoading(false);
      })
      .catch((error)=>{
        console.error(error);
        if(!cancelled) setLoading(false);
      });
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{
    setSocialText(ctaFor(locale,puzzle));
  },[locale,puzzle]);

  useEffect(()=>{
    try { window.localStorage.setItem(ROTATION_STORAGE_KEY,JSON.stringify(recent)); } catch { /* Storage may be unavailable. */ }
  },[recent]);

  useEffect(()=>{
    if(presentation!=="debate" || kind!=="math"){
      setDebateImage(null);
      return;
    }
    let cancelled=false;
    void loadDebateTemplate(debateTemplate)
      .then((dataUrl)=>{ if(!cancelled) setDebateImage({template:debateTemplate,dataUrl}); })
      .catch((error)=>{ if(!cancelled) console.error(error); });
    return()=>{cancelled=true};
  },[presentation,kind,debateTemplate]);

  useEffect(()=>{
    if(kind!=="algebra"){
      setAlgebraImage(null);
      return;
    }
    let cancelled=false;
    void loadAlgebraTemplate(algebraTemplate)
      .then((dataUrl)=>{ if(!cancelled) setAlgebraImage({template:algebraTemplate,dataUrl}); })
      .catch((error)=>{ if(!cancelled) console.error(error); });
    return()=>{cancelled=true};
  },[kind,algebraTemplate]);

  useEffect(()=>{
    let cancelled=false;
    void loadSceneTemplate(sceneTemplate)
      .then((dataUrl)=>{ if(!cancelled) setSceneImage({template:sceneTemplate,dataUrl}); })
      .catch((error)=>{ if(!cancelled) console.error(error); });
    return()=>{cancelled=true};
  },[kind,sceneTemplate]);

  function remember(next:Puzzle){
    setRecent((old)=>{
      const familyCount=VIRAL_FAMILIES.filter((family)=>family.kind===next.kind).length;
      const prior=old[next.kind];
      const cycle=prior.length>=familyCount ? [] : prior;
      return {...old,[next.kind]:[next.family,...cycle.filter((value)=>value!==next.family)].slice(0,RECENT_LIMIT)};
    });
  }

  function chooseKind(next:PuzzleKind){
    setKind(next);
    const fresh=generate(next,recent[next]);
    setPuzzle(fresh);
    setPresentation(next==="math" ? "debate" : "clean");
    if(next==="math") setDebateTemplate((current)=>pickDebateTemplate(current));
    if(next==="algebra") {
      setAlgebraTemplate((current)=>pickAlgebraTemplate(current));
      setAlgebraChallenge((current)=>pickAlgebraChallenge(current));
    }
    setSceneTemplate((current)=>nextSceneTemplate(current));
    remember(fresh);
  }

  function regenerate(){
    const fresh=generate(kind,recent[kind]);
    if(kind==="math") setDebateTemplate((current)=>pickDebateTemplate(current));
    if(kind==="algebra") {
      setAlgebraTemplate((current)=>pickAlgebraTemplate(current));
      setAlgebraChallenge((current)=>pickAlgebraChallenge(current));
    }
    setSceneTemplate((current)=>nextSceneTemplate(current));
    setPuzzle(fresh);
    remember(fresh);
    setCopied(false);
    window.setTimeout(()=>previewRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }

  function serializeSvg(){
    if(!svgRef.current) return null;
    return new XMLSerializer().serializeToString(svgRef.current);
  }

  const debateImageReady = debateImage?.template === debateTemplate;
  const algebraImageReady = algebraImage?.template === algebraTemplate;
  const sceneImageReady = sceneImage?.template === sceneTemplate;
  const shareImageKey = `${puzzle.id}:${presentation}:${locale}:${presentation==="debate"?debateTemplate:0}:${debateImageReady?"ready":"loading"}:${algebraTemplate}:${algebraChallenge}:${algebraImageReady?"algebra-ready":"algebra-loading"}:${sceneTemplate}:${sceneImageReady?"scene-ready":"scene-loading"}`;
  useEffect(() => {
    let cancelled = false;
    if(presentation==="debate" && !debateImageReady) return;
    if(presentation==="debate" && puzzle.kind==="algebra" && !algebraImageReady) return;
    if(presentation!=="debate" && !sceneImageReady) return;
    const source = serializeSvg();
    if (source) {
      const backgroundDataUrl =
        puzzle.kind === "math"
          ? (presentation==="debate" ? (debateImageReady ? debateImage?.dataUrl : null) : (sceneImageReady ? sceneImage?.dataUrl : null))
          : puzzle.kind === "algebra"
            ? (presentation==="debate" ? (algebraImageReady ? algebraImage?.dataUrl : null) : (sceneImageReady ? sceneImage?.dataUrl : null))
            : (sceneImageReady ? sceneImage?.dataUrl : null);

      const exportSource = backgroundDataUrl
        ? source.replace(/<image\b[^>]*\/>/i, "")
        : source;

      void puzzlePng(
        exportSource,
        `aqryo-${puzzle.kind}-${puzzle.family}.png`,
        true,
        backgroundDataUrl,
      )
        .then((file) => { if (!cancelled) setShareImage({key:shareImageKey,file}); })
        .catch((error) => { if (!cancelled) console.error(error); });
    }
    return () => { cancelled = true; };
  }, [shareImageKey]);

  function downloadSvg(){
    const source=serializeSvg();
    if(!source) return;
    const blob=new Blob([source],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");
    anchor.href=url;
    anchor.download=`aqryo-${puzzle.kind}-${puzzle.family}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function copyText(){
    await navigator.clipboard.writeText(socialText);
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1200);
  }

  async function share(){
    if(sharing) return;
    try{
      setSharing(true);
      const file = shareImage?.key === shareImageKey ? shareImage.file : null;
      if(!file) throw new Error("Visual unavailable");
      const canShareFile =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({
          files: [file],
          text: socialText,
          title: "AQRYO",
        });
      } else {
        downloadPng(file);
        const x=new URL("https://x.com/intent/tweet");
        x.searchParams.set("text",`${socialText}\n\n#AQRYO`);
        window.open(x.toString(),"_blank","noopener,noreferrer");
      }
    }catch(error){
      if(!(error instanceof DOMException && error.name==="AbortError")) console.error(error);
    }finally{
      setSharing(false);
    }
  }

  if(loading) return <LoadingScreen/>;

  const kinds:Array<[PuzzleKind,string,string]> = [
    ["math",t("math"),copy.descriptions.math],
    ["geometry",t("geometry"),copy.descriptions.geometry],
    ["count",t("count"),copy.descriptions.count],
    ["algebra",t("algebra"),copy.descriptions.algebra],
    ["pattern",patternCopy(locale).label,patternCopy(locale).description],
  ];

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation onSignOut={async()=>{await signOutCreator();window.location.href="/creator-auth";}}/>

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-600">{t("puzzleEngine")}</p>
            <h1 className="mt-1 text-[30px] font-black tracking-[-0.055em]">{t("puzzle")}</h1>
          </div>
          <Link to="/creator-studio" className="rounded-full border border-border bg-white px-5 py-3 text-[12px] font-black text-muted-foreground">{t("backToStudio")}</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 lg:py-9">
        <section className="space-y-5">
          <div ref={previewRef} className="scroll-mt-32">
            <p className="mb-3 text-[12px] font-black uppercase tracking-[0.16em] text-muted-foreground">{t("shareVisual")}</p>
            <div className="relative overflow-hidden rounded-[34px] border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(56,27,90,0.11)] sm:p-4">
              <button
                type="button"
                onClick={regenerate}
                className="absolute left-6 top-6 z-20 rounded-full bg-black/88 px-4 py-2 text-[12px] font-black text-white shadow-lg backdrop-blur transition hover:bg-violet-700 sm:left-7 sm:top-7 sm:text-[13px]"
              >
                {copy.changeVisual} ↻
              </button>
              <div className="mx-auto max-w-[620px]">
                <PuzzleSvg ref={svgRef} puzzle={puzzle} presentation={presentation} copy={copy} locale={locale} debateImage={debateImageReady ? debateImage?.dataUrl ?? null : null} debateTemplate={debateTemplate} algebraChallenge={algebraChallenge} algebraImage={algebraImage} sceneImage={sceneImageReady ? sceneImage?.dataUrl ?? SCENE_TEMPLATES[sceneTemplate] : SCENE_TEMPLATES[sceneTemplate]}/>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-white p-5 sm:p-8">
            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-violet-600">1 · {t("questionType")}</p>
            <h2 className="mt-3 text-[34px] font-black leading-tight tracking-[-0.055em] sm:text-[42px]">{t("viralInFive")}</h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {kinds.map(([value,title,description])=>(
                <PuzzleTypeButton key={value} active={kind===value} title={title} description={description} onClick={()=>chooseKind(value)}/>
              ))}
            </div>

            {kind==="math" ? (
              <div className="mt-7 rounded-[18px] border border-violet-200 bg-violet-50 px-4 py-3 text-[12px] font-black text-violet-800">
                {locale==="tr" ? "Bu kategoride görsel formatı: Kim Haklı" : "Visual format: Who is right"}
              </div>
            ) : kind==="algebra" ? (
              <div className="mt-7 rounded-[18px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-[12px] font-black text-cyan-900">
                {locale==="tr" ? "Cebir görseli: iki düşünen kişi + beyaz tahta" : "Algebra visual: two thinkers + whiteboard"}
              </div>
            ) : null}

            <button type="button" onClick={regenerate} className="mt-6 rounded-full bg-black px-7 py-4 text-[15px] font-black text-white">
              {t("newQuestion")} ↻
            </button>
          </div>

          <div className="rounded-[30px] border border-border bg-white p-5 sm:p-8">
            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-violet-600">2 · {t("cta")}</p>
            <h3 className="mt-2 text-[24px] font-black tracking-[-0.04em]">{locale === "tr" ? "Paylaşım metni" : t("cta")}</h3>
            <textarea
              rows={4}
              value={socialText}
              onChange={(event)=>setSocialText(event.target.value)}
              className="mt-4 w-full resize-none rounded-[20px] border border-border bg-background px-5 py-5 text-[17px] font-bold leading-8 outline-none focus:border-violet-400 sm:text-[18px]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={sharing || shareImage?.key !== shareImageKey} onClick={()=>void share()} className="rounded-full bg-violet-600 px-6 py-3.5 text-[14px] font-black text-white disabled:opacity-50">{sharing?"...":t("share")} →</button>
              <button onClick={()=>void copyText()} className="rounded-full border border-border bg-white px-6 py-3.5 text-[14px] font-black">{copied?"✓":t("copyText")}</button>
              <button onClick={downloadSvg} className="rounded-full border border-border bg-white px-6 py-3.5 text-[14px] font-black">{t("downloadSvg")}</button>
            </div>
          </div>

          <div className="grid gap-3 rounded-[26px] border border-violet-100 bg-violet-50/70 p-5 sm:grid-cols-2 sm:p-6">
            <div><p className="text-[12px] font-black text-violet-950">{t("correctAnswer")}</p><p className="mt-2 text-[30px] font-black text-violet-800">{puzzle.answer}</p></div>
            <div><p className="text-[12px] font-black text-violet-950">{t("commonWrong")}</p><p className="mt-2 text-[30px] font-black text-rose-600">{puzzle.commonWrong}</p></div>
          </div>
          <details className="rounded-[24px] border border-border bg-white p-5 text-[15px] font-semibold leading-7 sm:p-6">
            <summary className="cursor-pointer text-[16px] font-black">{SOLUTION_TITLE[locale]}</summary>
            <ol className="mt-3 list-inside list-decimal space-y-1">{localizedPuzzleSteps(locale,puzzle).map((step,index)=><li key={`${puzzle.id}-${index}`}>{step}</li>)}</ol>
          </details>
        </section>
      </div>
    </main>
  );
}

const PuzzleSvg=React.forwardRef<
  SVGSVGElement,
  {puzzle:Puzzle;presentation:Presentation;copy:PuzzleCopy;locale:AqryoLocale;debateImage:string|null;debateTemplate:number;sceneImage:string|null}
>(function PuzzleSvg({puzzle,presentation,copy,locale,debateImage,debateTemplate,sceneImage},ref){
  const cleanDebateValue = (value: string) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && !Number.isInteger(numeric)
      ? String(Number(numeric.toFixed(2)))
      : value;
  };
  const answer = puzzle.answerKey ? UNDETERMINED_SHORT[locale] : cleanDebateValue(puzzle.answer);
  const headline = headlineFor(locale,puzzle);
  const headlineSize = headline.length > 36 ? 13 : headline.length > 28 ? 16 : headline.length > 22 ? 18 : 20;
  const questionRows = puzzleQuestionRows(puzzle.diagram);
  const compactDebate = COMPACT_DEBATE_TEMPLATES.has(debateTemplate);
  if (sceneImage && presentation!=="debate") {
    const safeX = 160;
    const safeY = 34;
    const safeW = 186;
    const safeH = 318;
    const rows = (puzzle.patternRows?.length ? puzzle.patternRows : questionRows).slice(0, 7);
    const colors = ["#2563eb","#dc2626","#7c3aed","#0f766e","#db2777","#ea580c","#f59e0b"];

    if (puzzle.kind==="pattern") {
      const gap = rows.length >= 6 ? 45 : 54;
      const startY = safeY + 58;
      return (
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 450" className="w-full rounded-[24px]">
          <image href={sceneImage} x="0" y="0" width="360" height="450" preserveAspectRatio="none"/>
          <text x={safeX+safeW/2} y={safeY+20} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#17101f">{headline}</text>
          {rows.map((row,index)=>(
            <text
              key={`${puzzle.id}-pattern-${index}`}
              x={safeX+safeW/2}
              y={startY + index*gap}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Arial,sans-serif"
              fontSize={row.length>12?20:row.length>8?23:row.length>5?27:34}
              fontWeight="900"
              fill={row.includes("?")?"#f59e0b":colors[index % colors.length]}
              stroke="rgba(255,255,255,.92)"
              strokeWidth="2.2"
              paintOrder="stroke"
            >
              {row}
            </text>
          ))}
        </svg>
      );
    }

    return (
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 450" className="w-full rounded-[24px]">
        <image href={sceneImage} x="0" y="0" width="360" height="450" preserveAspectRatio="none"/>
        <text x={safeX+safeW/2} y={safeY+20} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={headlineSize>16?14:12} fontWeight="900" fill="#17101f">{headline}</text>
        <svg x={safeX} y={safeY+30} width={safeW} height={safeH-35} viewBox="0 0 360 270" preserveAspectRatio="xMidYMid meet">
          <g transform={puzzle.kind==="geometry" ? "translate(-72 -54) scale(1.4)" : undefined} dangerouslySetInnerHTML={{__html:puzzle.diagram}} />
        </svg>
      </svg>
    );
  }
  if (presentation==="debate" && debateImage && puzzle.kind==="math") {
    const longest = Math.max(...questionRows.map((row)=>row.length), 1);
    const questionSize = longest > 28 ? 18 : longest > 20 ? 21 : 24;
    const debateColors = ["#2563eb","#dc2626","#7c3aed","#0f766e","#db2777","#ea580c"];
    const colorSeed = Array.from(puzzle.id).reduce((sum,char)=>sum+char.charCodeAt(0),0);
    const questionY = compactDebate ? 106 : 184;
    const answerY = compactDebate ? 157 : 118;
    const expressionTokens = questionRows.join(" ").split(/(\s+)/).filter(Boolean);
    return (
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 450" className="w-full rounded-[24px]">
        <image href={debateImage} x="0" y="0" width="360" height="450" preserveAspectRatio="none"/>
        <text x="180" y={questionY} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize={questionSize} fontWeight="900">
          {expressionTokens.map((token,index)=>(
            <tspan key={index} fill={debateColors[(colorSeed+index)%debateColors.length]}>{token}</tspan>
          ))}
        </text>
        <text x="78" y={answerY} textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontSize={answer.length>10?11:20} fontWeight="900" fill="#2563eb">{answer}</text>
        <text x="282" y={answerY} textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fontSize={cleanDebateValue(puzzle.commonWrong).length>10?11:20} fontWeight="900" fill="#dc2626">{cleanDebateValue(puzzle.commonWrong)}</text>
      </svg>
    );
  }
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" className="w-full rounded-[24px]">
      <rect width="360" height="480" rx="28" fill="#fbfafc"/>
      <circle cx="48" cy="45" r="20" fill="#74f0de"/>
      <text x="48" y="52" textAnchor="middle" fontSize="19" fontWeight="900" fill="#17101f">Q</text>
      <text x="78" y="51" fontSize="14" fontWeight="900" fill="#17101f">AQRYO</text>
      <text x="180" y="95" textAnchor="middle" fontSize={headlineSize} fontWeight="900" fill="#17101f">{headline}</text>
      <g transform="translate(0 120)" dangerouslySetInnerHTML={{__html:puzzle.diagram}} />
      {presentation==="debate" ? (
        <>
          <rect x="24" y="370" width="146" height="66" rx="22" fill="#ede9fe"/>
          <circle cx="49" cy="403" r="14" fill="#7c3aed"/>
          <text x="49" y="409" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">A</text>
          <text x="75" y="410" fontSize={answer.length>9?11:20} fontWeight="900" fill="#17101f">{answer}</text>
          <rect x="190" y="370" width="146" height="66" rx="22" fill="#ffe4e6"/>
          <circle cx="215" cy="403" r="14" fill="#e11d48"/>
          <text x="215" y="409" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">B</text>
          <text x="241" y="410" fontSize="20" fontWeight="900" fill="#17101f">{puzzle.commonWrong}</text>
          <text x="180" y="462" textAnchor="middle" fontSize="18" fontWeight="900" fill="#6d28d9">{copy.debateQuestion}</text>
        </>
      ) : <text x="180" y="440" textAnchor="middle" fontSize="16" fontWeight="900" fill="#6b7280">{subtitleFor(locale,puzzle.kind,copy)}</text>}
    </svg>
  );
});

function PuzzleTypeButton({
  active,title,description,onClick,
}:{
  active:boolean;
  title:string;
  description:string;
  onClick:()=>void;
}){
  return (
    <button type="button" onClick={onClick} className={`rounded-[22px] border p-4 text-left transition ${active?"border-violet-500 bg-violet-50 shadow-[0_12px_30px_rgba(124,58,237,.1)]":"border-border bg-white"}`}>
      <p className="text-[17px] font-black">{title}</p>
      <p className="mt-1 text-[14px] font-semibold leading-6 text-muted-foreground">{description}</p>
    </button>
  );
}

function Choice({
  active,title,description,onClick,
}:{
  active:boolean;
  title:string;
  description:string;
  onClick:()=>void;
}){
  return (
    <button type="button" onClick={onClick} className={`rounded-[20px] border px-4 py-4 text-left ${active?"border-violet-500 bg-violet-50":"border-border bg-white"}`}>
      <p className="text-[16px] font-black">{title}</p>
      <p className="mt-1 text-[13px] font-semibold leading-5 text-muted-foreground">{description}</p>
    </button>
  );
}

function LoadingScreen(){
  return <main className="min-h-screen bg-[#f7f5fb]"><div className="mx-auto max-w-[1280px] px-4 py-10"><div className="h-[360px] animate-pulse rounded-[30px] bg-white"/></div></main>;
}
