import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { useAqryoLocale, type AqryoLocale } from "@/lib/i18n";
import { makeVettedGeometryPuzzle } from "@/lib/geometryPuzzleTemplates";
import { GeometryTemplateVisual } from "@/components/puzzle/GeometryTemplateVisual";
import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle-builder")({
  component: PuzzleBuilderPage,
});

type PuzzleKind = "math" | "geometry" | "count" | "algebra" | "area";
type Presentation = "clean" | "debate";

type Puzzle = {
  id: string;
  kind: PuzzleKind;
  family: string;
  answer: string;
  commonWrong: string;
  data: Record<string, number | string>;
};

type PuzzleCopy = {
  descriptions: Record<PuzzleKind, string>;
  titles: Record<PuzzleKind, string>;
  subtitles: Record<PuzzleKind, string>;
  cleanDesc: string;
  debateDesc: string;
  debateQuestion: string;
};

const RECENT_LIMIT = 30;
const RECENT_FAMILY_WINDOW = 5;

const COPY: Record<AqryoLocale, PuzzleCopy> = {
  tr: {
    descriptions: {
      math: "İşlem önceliği, parantez, yüzde ve üs tuzakları",
      geometry: "Açı, paralel, ters açı ve çokgen soruları",
      count: "Kare, dikdörtgen, çizgi ve üçgen sayma",
      algebra: "Lineer denklem, oran, sistem ve ardışık sayılar",
      area: "Alan, çevre, Pisagor ve bileşik şekiller",
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
  },
  en: {
    descriptions: {
      math: "Order of operations, brackets, percentages and powers",
      geometry: "Angles, parallel lines, vertical angles and polygons",
      count: "Count squares, rectangles, segments and triangles",
      algebra: "Linear equations, ratios, systems and sequences",
      area: "Area, perimeter, Pythagoras and composite shapes",
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
  },
  es: {
    descriptions:{math:"Prioridad, paréntesis, porcentajes y potencias",geometry:"Ángulos, paralelas, opuestos y polígonos",count:"Cuenta cuadrados, rectángulos, segmentos y triángulos",algebra:"Ecuaciones, razones, sistemas y consecutivos",area:"Área, perímetro, Pitágoras y figuras compuestas"},
    titles:{math:"¿Cuál es el resultado?",geometry:"Halla el ángulo x",count:"¿Cuántos hay en total?",algebra:"Halla x",area:"Halla el valor que falta"},
    subtitles:{math:"No hagas primero lo que ves primero 👀",geometry:"Mira el dibujo otra vez",count:"Las figuras pequeñas son solo el inicio",algebra:"Parece corto. Piénsalo bien.",area:"Elige la fórmula correcta"},
    cleanDesc:"Una pregunta · tarjeta limpia",debateDesc:"Dos respuestas · para debatir",debateQuestion:"¿Quién tiene razón?",
  },
  pt: {
    descriptions:{math:"Ordem, parênteses, porcentagens e potências",geometry:"Ângulos, paralelas, opostos e polígonos",count:"Conte quadrados, retângulos, segmentos e triângulos",algebra:"Equações, razões, sistemas e consecutivos",area:"Área, perímetro, Pitágoras e formas compostas"},
    titles:{math:"Qual é o resultado?",geometry:"Encontre o ângulo x",count:"Quantos há no total?",algebra:"Encontre x",area:"Encontre o valor que falta"},
    subtitles:{math:"Não faça primeiro o que aparece primeiro 👀",geometry:"Olhe o desenho mais uma vez",count:"As formas pequenas são só o começo",algebra:"Parece curto. Pense bem.",area:"Escolha a fórmula certa"},
    cleanDesc:"Uma pergunta · cartão limpo",debateDesc:"Duas respostas · feito para comentários",debateQuestion:"Quem está certo?",
  },
  fr: {
    descriptions:{math:"Priorités, parenthèses, pourcentages et puissances",geometry:"Angles, parallèles, opposés et polygones",count:"Compter carrés, rectangles, segments et triangles",algebra:"Équations, rapports, systèmes et nombres consécutifs",area:"Aire, périmètre, Pythagore et formes composées"},
    titles:{math:"Quel est le résultat ?",geometry:"Trouve l’angle x",count:"Combien au total ?",algebra:"Trouve x",area:"Trouve la valeur manquante"},
    subtitles:{math:"Ne fais pas d’abord ce que tu vois d’abord 👀",geometry:"Regarde encore une fois le schéma",count:"Les petites formes ne sont que le début",algebra:"Ça paraît court. Réfléchis bien.",area:"Choisis la bonne formule"},
    cleanDesc:"Une question · carte propre",debateDesc:"Deux réponses · pour débattre",debateQuestion:"Qui a raison ?",
  },
  de: {
    descriptions:{math:"Reihenfolge, Klammern, Prozent und Potenzen",geometry:"Winkel, Parallelen, Scheitelwinkel und Polygone",count:"Quadrate, Rechtecke, Strecken und Dreiecke zählen",algebra:"Gleichungen, Verhältnisse, Systeme und Folgen",area:"Fläche, Umfang, Pythagoras und zusammengesetzte Formen"},
    titles:{math:"Was ist das Ergebnis?",geometry:"Finde den Winkel x",count:"Wie viele insgesamt?",algebra:"Löse nach x",area:"Finde den fehlenden Wert"},
    subtitles:{math:"Nicht einfach von links nach rechts 👀",geometry:"Schau noch einmal auf die Zeichnung",count:"Die kleinen Formen sind nur der Anfang",algebra:"Sieht kurz aus. Denk genau nach.",area:"Wähle die richtige Formel"},
    cleanDesc:"Eine Frage · saubere Karte",debateDesc:"Zwei Antworten · für Kommentare",debateQuestion:"Wer hat recht?",
  },
  it: {
    descriptions:{math:"Priorità, parentesi, percentuali e potenze",geometry:"Angoli, parallele, opposti e poligoni",count:"Conta quadrati, rettangoli, segmenti e triangoli",algebra:"Equazioni, rapporti, sistemi e consecutivi",area:"Area, perimetro, Pitagora e figure composte"},
    titles:{math:"Qual è il risultato?",geometry:"Trova l’angolo x",count:"Quanti sono in totale?",algebra:"Trova x",area:"Trova il valore mancante"},
    subtitles:{math:"Non fare per prima l’operazione che vedi 👀",geometry:"Guarda il disegno ancora una volta",count:"Le forme piccole sono solo l’inizio",algebra:"Sembra breve. Pensaci bene.",area:"Scegli la formula giusta"},
    cleanDesc:"Una domanda · card pulita",debateDesc:"Due risposte · fatta per i commenti",debateQuestion:"Chi ha ragione?",
  },
  ar: {
    descriptions:{math:"ترتيب العمليات والأقواس والنسب والأسس",geometry:"الزوايا والمتوازيات والزوايا المتقابلة والمضلعات",count:"عد المربعات والمستطيلات والقطع والمثلثات",algebra:"معادلات ونسب وأنظمة وأعداد متتالية",area:"مساحة ومحيط وفيثاغورس وأشكال مركبة"},
    titles:{math:"ما النتيجة؟",geometry:"أوجد الزاوية x",count:"كم العدد الكلي؟",algebra:"أوجد x",area:"أوجد القيمة الناقصة"},
    subtitles:{math:"لا تبدأ بأول عملية تراها 👀",geometry:"انظر إلى الشكل مرة أخرى",count:"الأشكال الصغيرة ليست كل شيء",algebra:"يبدو قصيرًا. فكّر جيدًا.",area:"اختر القانون الصحيح"},
    cleanDesc:"سؤال واحد · بطاقة نظيفة",debateDesc:"إجابتان · للنقاش",debateQuestion:"من الصحيح؟",
  },
  hi: {
    descriptions:{math:"ऑपरेशन क्रम, ब्रैकेट, प्रतिशत और घात",geometry:"कोण, समानांतर रेखाएँ, विपरीत कोण और बहुभुज",count:"वर्ग, आयत, रेखाखंड और त्रिभुज गिनें",algebra:"रेखीय समीकरण, अनुपात, सिस्टम और क्रमिक संख्याएँ",area:"क्षेत्रफल, परिमाप, पाइथागोरस और संयुक्त आकृतियाँ"},
    titles:{math:"उत्तर क्या है?",geometry:"कोण x ज्ञात करें",count:"कुल कितने हैं?",algebra:"x ज्ञात करें",area:"लापता मान ज्ञात करें"},
    subtitles:{math:"जो पहले दिखे वही पहले मत करो 👀",geometry:"चित्र को एक बार फिर देखें",count:"छोटी आकृतियाँ सिर्फ शुरुआत हैं",algebra:"छोटा है, पर ध्यान चाहिए",area:"सही सूत्र चुनें"},
    cleanDesc:"एक सवाल · साफ कार्ड",debateDesc:"दो जवाब · चर्चा के लिए",debateQuestion:"कौन सही है?",
  },
  id: {
    descriptions:{math:"Urutan operasi, kurung, persen dan pangkat",geometry:"Sudut, garis sejajar, sudut berlawanan dan poligon",count:"Hitung persegi, persegi panjang, ruas dan segitiga",algebra:"Persamaan linear, rasio, sistem dan bilangan berurutan",area:"Luas, keliling, Pythagoras dan bangun gabungan"},
    titles:{math:"Berapa hasilnya?",geometry:"Cari sudut x",count:"Berapa jumlah semuanya?",algebra:"Cari x",area:"Cari nilai yang hilang"},
    subtitles:{math:"Jangan kerjakan yang pertama terlihat 👀",geometry:"Lihat diagram sekali lagi",count:"Bangun kecil baru permulaan",algebra:"Terlihat singkat. Pikirkan baik-baik.",area:"Pilih rumus yang tepat"},
    cleanDesc:"Satu soal · kartu bersih",debateDesc:"Dua jawaban · untuk diskusi",debateQuestion:"Siapa yang benar?",
  },
  ru: {
    descriptions:{math:"Порядок действий, скобки, проценты и степени",geometry:"Углы, параллельные, вертикальные углы и многоугольники",count:"Считай квадраты, прямоугольники, отрезки и треугольники",algebra:"Уравнения, отношения, системы и последовательные числа",area:"Площадь, периметр, Пифагор и составные фигуры"},
    titles:{math:"Какой результат?",geometry:"Найди угол x",count:"Сколько всего?",algebra:"Найди x",area:"Найди неизвестное"},
    subtitles:{math:"Не спеши считать слева направо 👀",geometry:"Посмотри на рисунок ещё раз",count:"Маленькие фигуры — только начало",algebra:"Коротко, но нужна внимательность",area:"Выбери правильную формулу"},
    cleanDesc:"Один вопрос · чистая карточка",debateDesc:"Два ответа · для обсуждения",debateQuestion:"Кто прав?",
  },
  bn: {
    descriptions:{math:"অপারেশন ক্রম, বন্ধনী, শতাংশ ও ঘাত",geometry:"কোণ, সমান্তরাল রেখা, বিপ্রতীপ কোণ ও বহুভুজ",count:"বর্গ, আয়তক্ষেত্র, রেখাংশ ও ত্রিভুজ গুনুন",algebra:"সমীকরণ, অনুপাত, সিস্টেম ও ধারাবাহিক সংখ্যা",area:"ক্ষেত্রফল, পরিসীমা, পিথাগোরাস ও যৌগিক আকৃতি"},
    titles:{math:"ফল কত?",geometry:"x কোণ বের করুন",count:"মোট কতটি?",algebra:"x বের করুন",area:"অনুপস্থিত মান বের করুন"},
    subtitles:{math:"যেটা আগে দেখছেন সেটাই আগে করবেন না 👀",geometry:"চিত্রটি আরেকবার দেখুন",count:"ছোট আকৃতিগুলো শুধু শুরু",algebra:"ছোট দেখায়, মনোযোগ দরকার",area:"সঠিক সূত্র বেছে নিন"},
    cleanDesc:"একটি প্রশ্ন · পরিষ্কার কার্ড",debateDesc:"দুটি উত্তর · আলোচনার জন্য",debateQuestion:"কে ঠিক?",
  },
  ur: {
    descriptions:{math:"عملی ترتیب، قوسین، فیصد اور قوتیں",geometry:"زاویے، متوازی لکیریں، مقابل زاویے اور کثیرالاضلاع",count:"مربع، مستطیل، خط اور مثلث گنیں",algebra:"مساوات، نسبت، نظام اور متواتر اعداد",area:"رقبہ، محیط، فیثاغورث اور مرکب اشکال"},
    titles:{math:"نتیجہ کیا ہے؟",geometry:"زاویہ x معلوم کریں",count:"کل کتنے ہیں؟",algebra:"x معلوم کریں",area:"نامعلوم قدر معلوم کریں"},
    subtitles:{math:"جو پہلے نظر آئے اسے پہلے نہ کریں 👀",geometry:"شکل کو ایک بار پھر دیکھیں",count:"چھوٹی شکلیں صرف ابتدا ہیں",algebra:"مختصر ہے، مگر غور چاہیے",area:"درست فارمولا منتخب کریں"},
    cleanDesc:"ایک سوال · صاف کارڈ",debateDesc:"دو جواب · بحث کے لیے",debateQuestion:"کون درست ہے؟",
  },
  vi: {
    descriptions:{math:"Thứ tự phép tính, ngoặc, phần trăm và lũy thừa",geometry:"Góc, song song, góc đối đỉnh và đa giác",count:"Đếm hình vuông, chữ nhật, đoạn thẳng và tam giác",algebra:"Phương trình, tỉ lệ, hệ và số liên tiếp",area:"Diện tích, chu vi, Pythagore và hình ghép"},
    titles:{math:"Kết quả là bao nhiêu?",geometry:"Tìm góc x",count:"Tổng cộng có bao nhiêu?",algebra:"Tìm x",area:"Tìm giá trị còn thiếu"},
    subtitles:{math:"Đừng làm phép tính đầu tiên bạn thấy 👀",geometry:"Nhìn hình thêm một lần nữa",count:"Các hình nhỏ chỉ là khởi đầu",algebra:"Trông ngắn nhưng cần cẩn thận",area:"Chọn đúng công thức"},
    cleanDesc:"Một câu hỏi · thẻ sạch",debateDesc:"Hai đáp án · để tranh luận",debateQuestion:"Ai đúng?",
  },
  fil: {
    descriptions:{math:"Order of operations, brackets, percent at powers",geometry:"Angles, parallel lines, vertical angles at polygons",count:"Bilangin ang squares, rectangles, segments at triangles",algebra:"Equations, ratios, systems at consecutive numbers",area:"Area, perimeter, Pythagoras at composite shapes"},
    titles:{math:"Ano ang sagot?",geometry:"Hanapin ang angle x",count:"Ilan lahat?",algebra:"Hanapin ang x",area:"Hanapin ang nawawalang value"},
    subtitles:{math:"Huwag unahin agad ang unang nakikita 👀",geometry:"Tingnan ulit ang diagram",count:"Simula pa lang ang maliliit na hugis",algebra:"Maikli pero kailangan ng ingat",area:"Piliin ang tamang formula"},
    cleanDesc:"Isang tanong · malinis na card",debateDesc:"Dalawang sagot · para sa comments",debateQuestion:"Sino ang tama?",
  },
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function signature(puzzle: Puzzle) {
  return `${puzzle.kind}:${puzzle.family}:${Object.entries(puzzle.data)
    .map(([key, value]) => `${key}=${value}`)
    .join("|")}`;
}

function squareCount(rows: number, cols: number) {
  let total = 0;
  for (let size = 1; size <= Math.min(rows, cols); size += 1) {
    total += (rows - size + 1) * (cols - size + 1);
  }
  return total;
}

function rectangleCount(rows: number, cols: number) {
  return ((rows * (rows + 1)) / 2) * ((cols * (cols + 1)) / 2);
}

function makeMath(): Puzzle {
  const family = pick([
    "priority",
    "division",
    "bracket",
    "nested",
    "percentage",
    "negative",
    "powers",
    "fraction",
  ]);

  if (family === "priority") {
    const a = randomInt(12, 48);
    const b = randomInt(2, 9);
    const c = randomInt(2, 8);
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String(a + b * c),
      commonWrong: String((a + b) * c),
      data: { expression: `${a} + ${b} × ${c}` },
    };
  }

  if (family === "division") {
    const d = pick([2, 3, 4, 5, 6]);
    const q = randomInt(3, 9);
    const a = d * q;
    const b = randomInt(4, 12);
    const c = randomInt(2, 5);
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String(q + b * c),
      commonWrong: String(Math.round(((a + b) * c) / d)),
      data: { expression: `${a} ÷ ${d} + ${b} × ${c}` },
    };
  }

  if (family === "bracket") {
    const a = randomInt(2, 9);
    const b = randomInt(3, 12);
    const c = randomInt(2, 7);
    const d = randomInt(2, 12);
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String((a + b) * c - d),
      commonWrong: String(a + b * c - d),
      data: { expression: `(${a} + ${b}) × ${c} − ${d}` },
    };
  }

  if (family === "nested") {
    const a = randomInt(10, 30);
    const b = randomInt(7, 14);
    const c = randomInt(2, b - 1);
    const d = randomInt(2, 6);
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String(a + (b - c) * d),
      commonWrong: String((a + b - c) * d),
      data: { expression: `${a} + (${b} − ${c}) × ${d}` },
    };
  }

  if (family === "percentage") {
    const percent = pick([10, 20, 25, 50, 75]);
    const base = pick([40, 60, 80, 100, 120, 160, 200]);
    const extra = randomInt(3, 20);
    const value = (base * percent) / 100;
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String(value + extra),
      commonWrong: String((base + extra) * percent / 100),
      data: { expression: `${percent}% of ${base} + ${extra}` },
    };
  }

  if (family === "negative") {
    const a = randomInt(20, 45);
    const b = randomInt(4, 9);
    const c = randomInt(2, 8);
    const d = randomInt(2, 5);
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String(a - (b + c) * d),
      commonWrong: String((a - b + c) * d),
      data: { expression: `${a} − (${b} + ${c}) × ${d}` },
    };
  }

  if (family === "powers") {
    const a = randomInt(2, 8);
    const b = randomInt(2, 7);
    const c = randomInt(2, 6);
    return {
      id: crypto.randomUUID(),
      kind: "math",
      family,
      answer: String(a * a + b * c),
      commonWrong: String((a + b) * c),
      data: { expression: `${a}² + ${b} × ${c}` },
    };
  }

  const leftDen = pick([2, 3, 4]);
  const rightDen = pick([2, 3, 5]);
  const leftQ = randomInt(2, 8);
  const rightQ = randomInt(2, 8);
  const left = leftDen * leftQ;
  const right = rightDen * rightQ;
  return {
    id: crypto.randomUUID(),
    kind: "math",
    family,
    answer: String(leftQ + rightQ),
    commonWrong: String(Math.round((left + right) / (leftDen + rightDen))),
    data: { expression: `${left} ÷ ${leftDen} + ${right} ÷ ${rightDen}` },
  };
}

function makeGeometry(recentFamilies: string[] = []): Puzzle {
  const vetted = makeVettedGeometryPuzzle(recentFamilies);
  return {
    id: crypto.randomUUID(),
    kind: "geometry",
    family: vetted.family,
    answer: vetted.answer,
    commonWrong: vetted.commonWrong,
    data: vetted.data,
  };
}

function makeCount(): Puzzle {
  const family = pick([
    "square-grid",
    "rectangle-grid",
    "nested",
    "segments",
    "triangle-fan",
    "triangle-nested",
  ]);

  if (family === "square-grid") {
    const rows = pick([3,4,5]);
    const cols = pick([3,4,5,6]);
    return {
      id:crypto.randomUUID(),kind:"count",family,
      answer:String(squareCount(rows,cols)),
      commonWrong:String(rows*cols),
      data:{rows,cols},
    };
  }

  if (family === "rectangle-grid") {
    const rows = pick([2,3,4]);
    const cols = pick([3,4,5]);
    return {
      id:crypto.randomUUID(),kind:"count",family,
      answer:String(rectangleCount(rows,cols)),
      commonWrong:String(rows*cols),
      data:{rows,cols},
    };
  }

  if (family === "nested") {
    const levels = pick([4,5,6,7]);
    return { id:crypto.randomUUID(),kind:"count",family,answer:String(levels),commonWrong:String(levels-1),data:{levels} };
  }

  if (family === "segments") {
    const points = pick([5,6,7,8]);
    const answer = (points * (points - 1)) / 2;
    return { id:crypto.randomUUID(),kind:"count",family,answer:String(answer),commonWrong:String(points-1),data:{points} };
  }

  if (family === "triangle-fan") {
    const basePoints = pick([4,5,6]);
    const answer = (basePoints * (basePoints - 1)) / 2;
    return { id:crypto.randomUUID(),kind:"count",family,answer:String(answer),commonWrong:String(basePoints-1),data:{basePoints} };
  }

  const levels = pick([3,4,5,6]);
  return { id:crypto.randomUUID(),kind:"count",family,answer:String(levels),commonWrong:String(levels+1),data:{levels} };
}

function makeAlgebra(): Puzzle {
  const family = pick([
    "linear-plus",
    "linear-minus",
    "distributive",
    "ratio",
    "sum-product",
    "system",
    "consecutive",
    "fraction",
  ]);

  if (family === "linear-plus") {
    const x = randomInt(3,18);
    const a = randomInt(2,8);
    const b = randomInt(3,20);
    const rhs = a*x+b;
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String(Math.round(rhs/a)),data:{a,b,rhs} };
  }

  if (family === "linear-minus") {
    const x = randomInt(4,18);
    const a = randomInt(2,7);
    const b = randomInt(2,15);
    const rhs = a*x-b;
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String(Math.round(rhs/a)),data:{a,b,rhs} };
  }

  if (family === "distributive") {
    const x = randomInt(2,12);
    const a = randomInt(2,6);
    const b = randomInt(2,8);
    const rhs = a*(x+b);
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String(rhs/a),data:{a,b,rhs} };
  }

  if (family === "ratio") {
    const factor = randomInt(3,8);
    const ratioA = pick([2,3,4,5]);
    const ratioB = pick([2,3,4,5]);
    const x = ratioA*factor;
    const y = ratioB*factor;
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String(y),data:{ratioA,ratioB,total:x+y} };
  }

  if (family === "sum-product") {
    const x = randomInt(3,9);
    const y = randomInt(2,8);
    const sum = x+y;
    const product = x*y;
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x*x+y*y),commonWrong:String(sum*sum),data:{sum,product} };
  }

  if (family === "system") {
    const x = randomInt(4,15);
    const y = randomInt(2,10);
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String(y),data:{sum:x+y,diff:x-y} };
  }

  if (family === "consecutive") {
    const x = randomInt(4,20);
    const sum = x + (x+1);
    return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String(Math.round(sum/2)),data:{sum} };
  }

  const divisor = pick([2,3,4,5]);
  const x = divisor * randomInt(3,12);
  const add = randomInt(2,10);
  const rhs = x/divisor + add;
  return { id:crypto.randomUUID(),kind:"algebra",family,answer:String(x),commonWrong:String((rhs-add)*2),data:{divisor,add,rhs} };
}

function makeArea(): Puzzle {
  const family = pick([
    "rectangle-side",
    "triangle-area",
    "shaded",
    "perimeter",
    "pythagoras",
    "l-shape",
    "trapezoid",
    "circle",
  ]);

  if (family === "rectangle-side") {
    const w = randomInt(4,12);
    const h = randomInt(3,10);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(w),commonWrong:String(h),data:{area:w*h,h,w} };
  }

  if (family === "triangle-area") {
    const base = pick([6,8,10,12,14]);
    const height = pick([4,6,8,10]);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(base*height/2),commonWrong:String(base*height),data:{base,height} };
  }

  if (family === "shaded") {
    const a = pick([5,6,7,8,9]);
    const b = pick([2,3,4]);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(a*a-b*b),commonWrong:String(a*a+b*b),data:{a,b} };
  }

  if (family === "perimeter") {
    const w = randomInt(5,14);
    const h = randomInt(3,10);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(2*(w+h)),commonWrong:String(w*h),data:{w,h} };
  }

  if (family === "pythagoras") {
    const triple = pick([[3,4,5],[5,12,13],[6,8,10],[8,15,17]] as const);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(triple[2]),commonWrong:String(triple[0]+triple[1]),data:{a:triple[0],b:triple[1],c:triple[2]} };
  }

  if (family === "l-shape") {
    const bigW = randomInt(8,12);
    const bigH = randomInt(7,11);
    const cutW = randomInt(2,4);
    const cutH = randomInt(2,4);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(bigW*bigH-cutW*cutH),commonWrong:String(bigW*bigH),data:{bigW,bigH,cutW,cutH} };
  }

  if (family === "trapezoid") {
    const a = pick([6,8,10,12]);
    const b = pick([10,12,14,16]);
    const h = pick([4,6,8]);
    return { id:crypto.randomUUID(),kind:"area",family,answer:String(((a+b)*h)/2),commonWrong:String((a+b)*h),data:{a,b,h} };
  }

  const radius = pick([3,4,5,6,7]);
  return { id:crypto.randomUUID(),kind:"area",family,answer:`${2*radius}π`,commonWrong:`${radius*radius}π`,data:{radius} };
}

function generate(kind: PuzzleKind, recent: string[]): Puzzle {
  const recentFamilyIds = recent
    .slice(0, RECENT_FAMILY_WINDOW)
    .filter((item) => item.startsWith(`${kind}:`))
    .map((item) => item.split(":")[1]);

  if (kind === "geometry") {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const next = makeGeometry(recentFamilyIds);
      if (!recent.includes(signature(next))) return next;
    }
    return makeGeometry([]);
  }

  const maker =
    kind === "math" ? makeMath :
    kind === "count" ? makeCount :
    kind === "algebra" ? makeAlgebra :
    makeArea;

  const recentFamilies = new Set(
    recent.slice(0, RECENT_FAMILY_WINDOW).map((item) => item.split(":").slice(0,2).join(":")),
  );

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const next = maker();
    const sig = signature(next);
    const familyKey = `${next.kind}:${next.family}`;
    if (!recent.includes(sig) && !recentFamilies.has(familyKey)) {
      return next;
    }
  }

  return maker();
}

function ctaFor(locale: AqryoLocale, puzzle: Puzzle) {
  const copy = COPY[locale] ?? COPY.en;
  const variants: Record<PuzzleKind, string[]> = {
    math: [copy.subtitles.math, copy.titles.math, `${copy.titles.math} 👇`],
    geometry: [copy.subtitles.geometry, copy.titles.geometry, `${copy.titles.geometry} 👇`],
    count: [copy.subtitles.count, copy.titles.count, `${copy.titles.count} 👀`],
    algebra: [copy.subtitles.algebra, copy.titles.algebra, `${copy.titles.algebra} 👇`],
    area: [copy.subtitles.area, copy.titles.area, `${copy.titles.area} 👇`],
  };
  return pick(variants[puzzle.kind]);
}

function PuzzleBuilderPage() {
  const { locale, t } = useAqryoLocale();
  const copy = COPY[locale] ?? COPY.en;
  const [loading,setLoading]=useState(true);
  const [kind,setKind]=useState<PuzzleKind>("math");
  const [presentation,setPresentation]=useState<Presentation>("clean");
  const [recent,setRecent]=useState<string[]>([]);
  const [puzzle,setPuzzle]=useState<Puzzle>(()=>makeMath());
  const [socialText,setSocialText]=useState("");
  const [copied,setCopied]=useState(false);
  const [sharing,setSharing]=useState(false);
  const previewRef=useRef<HTMLDivElement|null>(null);
  const svgRef=useRef<SVGSVGElement|null>(null);

  useEffect(()=>{
    let cancelled=false;
    void getCurrentCreator().then((creator)=>{
      if(!creator){ window.location.href="/creator-auth"; return; }
      if(!cancelled) setLoading(false);
    });
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{
    setSocialText(ctaFor(locale,puzzle));
  },[locale,puzzle]);

  function remember(next:Puzzle){
    const sig=signature(next);
    setRecent((old)=>[sig,...old.filter((value)=>value!==sig)].slice(0,RECENT_LIMIT));
  }

  function chooseKind(next:PuzzleKind){
    setKind(next);
    const fresh=generate(next,recent);
    setPuzzle(fresh);
    setPresentation("clean");
    remember(fresh);
  }

  function regenerate(){
    const fresh=generate(kind,recent);
    setPuzzle(fresh);
    remember(fresh);
    setCopied(false);
    window.setTimeout(()=>previewRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }

  function serializeSvg(){
    if(!svgRef.current) return null;
    return new XMLSerializer().serializeToString(svgRef.current);
  }

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
      const source=serializeSvg();
      if(!source) throw new Error("Visual unavailable");
      const blob=new Blob([source],{type:"image/svg+xml"});
      const file=new File([blob],`aqryo-${puzzle.kind}.svg`,{type:"image/svg+xml"});
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        await navigator.share({files:[file],text:socialText,title:"AQRYO"});
      } else {
        downloadSvg();
        const x=new URL("https://twitter.com/intent/tweet");
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
    ["area",t("area"),copy.descriptions.area],
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

      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-9">
        <section className="space-y-5">
          <div className="rounded-[30px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-violet-600">1 · {t("questionType")}</p>
            <h2 className="mt-3 text-[31px] font-black leading-tight tracking-[-0.055em]">{t("viralInFive")}</h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {kinds.map(([value,title,description])=>(
                <PuzzleTypeButton key={value} active={kind===value} title={title} description={description} onClick={()=>chooseKind(value)}/>
              ))}
            </div>

            <p className="mt-6 text-[12px] font-black">{t("presentation")}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Choice active={presentation==="clean"} title={t("clean")} description={copy.cleanDesc} onClick={()=>setPresentation("clean")}/>
              <Choice active={presentation==="debate"} title={t("debate")} description={copy.debateDesc} onClick={()=>setPresentation("debate")}/>
            </div>

            <button type="button" onClick={regenerate} className="mt-6 h-13 rounded-full bg-black px-7 py-3.5 text-[13px] font-black text-white">
              {t("newQuestion")} ↻
            </button>
          </div>

          <div className="rounded-[30px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-violet-600">2 · {t("cta")}</p>
            <textarea
              rows={4}
              value={socialText}
              onChange={(event)=>setSocialText(event.target.value)}
              className="mt-4 w-full resize-none rounded-[20px] border border-border bg-background px-5 py-4 text-[15px] font-bold leading-7 outline-none focus:border-violet-400"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={sharing} onClick={()=>void share()} className="rounded-full bg-violet-600 px-6 py-3 text-[13px] font-black text-white">{sharing?"...":t("share")} →</button>
              <button onClick={()=>void copyText()} className="rounded-full border border-border bg-white px-6 py-3 text-[13px] font-black">{copied?"✓":t("copyText")}</button>
              <button onClick={downloadSvg} className="rounded-full border border-border bg-white px-6 py-3 text-[13px] font-black">{t("downloadSvg")}</button>
            </div>
          </div>

          <div className="grid gap-3 rounded-[26px] border border-violet-100 bg-violet-50/70 p-5 sm:grid-cols-2">
            <div><p className="text-[11px] font-black text-violet-950">{t("correctAnswer")}</p><p className="mt-2 text-[28px] font-black text-violet-800">{puzzle.answer}</p></div>
            <div><p className="text-[11px] font-black text-violet-950">{t("commonWrong")}</p><p className="mt-2 text-[28px] font-black text-rose-600">{puzzle.commonWrong}</p></div>
          </div>
        </section>

        <aside ref={previewRef} className="scroll-mt-40 lg:sticky lg:top-[110px] lg:self-start">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{t("shareVisual")}</p>
          <div className="overflow-hidden rounded-[32px] border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(56,27,90,0.11)]">
            <PuzzleSvg ref={svgRef} puzzle={puzzle} presentation={presentation} copy={copy}/>
          </div>
        </aside>
      </div>
    </main>
  );
}

const PuzzleSvg=React.forwardRef<
  SVGSVGElement,
  {puzzle:Puzzle;presentation:Presentation;copy:PuzzleCopy}
>(function PuzzleSvg({puzzle,presentation,copy},ref){
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" className="w-full rounded-[24px]">
      <rect width="360" height="480" rx="28" fill="#fbfafc"/>
      <circle cx="48" cy="45" r="20" fill="#74f0de"/>
      <text x="48" y="52" textAnchor="middle" fontSize="19" fontWeight="900" fill="#17101f">Q</text>
      <text x="78" y="51" fontSize="14" fontWeight="900" fill="#17101f">AQRYO</text>
      <text x="180" y="95" textAnchor="middle" fontSize="20" fontWeight="900" fill="#17101f">{copy.titles[puzzle.kind]}</text>

      <PuzzleBody puzzle={puzzle}/>

      {presentation==="debate" ? (
        <>
          <rect x="24" y="370" width="146" height="66" rx="22" fill="#ede9fe"/>
          <circle cx="49" cy="403" r="14" fill="#7c3aed"/>
          <text x="49" y="409" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">A</text>
          <text x="75" y="410" fontSize="20" fontWeight="900" fill="#17101f">{puzzle.answer}</text>

          <rect x="190" y="370" width="146" height="66" rx="22" fill="#ffe4e6"/>
          <circle cx="215" cy="403" r="14" fill="#e11d48"/>
          <text x="215" y="409" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">B</text>
          <text x="241" y="410" fontSize="20" fontWeight="900" fill="#17101f">{puzzle.commonWrong}</text>
          <text x="180" y="462" textAnchor="middle" fontSize="18" fontWeight="900" fill="#6d28d9">{copy.debateQuestion}</text>
        </>
      ) : (
        <text x="180" y="440" textAnchor="middle" fontSize="17" fontWeight="900" fill="#6b7280">{copy.subtitles[puzzle.kind]}</text>
      )}
    </svg>
  );
});

function PuzzleBody({puzzle}:{puzzle:Puzzle}){
  const d=puzzle.data;

  if(puzzle.kind==="math"){
    return <text x="180" y="245" textAnchor="middle" fontSize="38" fontWeight="900" fill="#17101f">{String(d.expression)}</text>;
  }

  if(puzzle.kind==="geometry"){
    return <GeometryTemplateVisual family={puzzle.family} data={d} />;
  }

  if(puzzle.kind==="count"){
    if(puzzle.family==="nested"){
      const levels=Number(d.levels);
      return <>{Array.from({length:levels},(_,i)=><rect key={i} x={70+i*12} y={140+i*12} width={220-i*24} height={220-i*24} fill="none" stroke="#17101f" strokeWidth="4"/>)}</>;
    }

    if(puzzle.family==="segments"){
      const points=Number(d.points);
      return <>
        <line x1="55" y1="250" x2="305" y2="250" stroke="#17101f" strokeWidth="5"/>
        {Array.from({length:points},(_,i)=>{
          const x=65+i*(230/(points-1));
          return <g key={i}><circle cx={x} cy="250" r="7" fill="#7c3aed"/><text x={x} y="285" textAnchor="middle" fontSize="14" fontWeight="900">{String.fromCharCode(65+i)}</text></g>;
        })}
      </>;
    }

    if(puzzle.family==="triangle-fan"){
      const points=Number(d.basePoints);
      const xs=Array.from({length:points},(_,i)=>70+i*(220/(points-1)));
      return <>
        <line x1="70" y1="330" x2="290" y2="330" stroke="#17101f" strokeWidth="6"/>
        {xs.map((x,i)=><line key={i} x1="180" y1="135" x2={x} y2="330" stroke="#17101f" strokeWidth={i===0||i===points-1?6:3}/>)}
      </>;
    }

    if(puzzle.family==="triangle-nested"){
      const levels=Number(d.levels);
      return <>{Array.from({length:levels},(_,i)=>{
        const inset=i*16;
        return <path key={i} d={`M${70+inset} ${330-inset/2}L180 ${135+inset}L${290-inset} ${330-inset/2}Z`} fill="none" stroke="#17101f" strokeWidth="4"/>;
      })}</>;
    }

    const rows=Number(d.rows);
    const cols=Number(d.cols);
    const x0=55,y0=145,w=250,h=200,cellW=w/cols,cellH=h/rows;
    return <>
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#17101f" strokeWidth="6"/>
      {Array.from({length:cols-1},(_,i)=><line key={"v"+i} x1={x0+(i+1)*cellW} y1={y0} x2={x0+(i+1)*cellW} y2={y0+h} stroke="#17101f" strokeWidth="4"/>)}
      {Array.from({length:rows-1},(_,i)=><line key={"h"+i} x1={x0} y1={y0+(i+1)*cellH} x2={x0+w} y2={y0+(i+1)*cellH} stroke="#17101f" strokeWidth="4"/>)}
    </>;
  }

  if(puzzle.kind==="algebra"){
    if(puzzle.family==="linear-plus") return <>
      <text x="180" y="220" textAnchor="middle" fontSize="39" fontWeight="900">{String(d.a)}x + {String(d.b)} = {String(d.rhs)}</text>
      <text x="180" y="290" textAnchor="middle" fontSize="36" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;

    if(puzzle.family==="linear-minus") return <>
      <text x="180" y="220" textAnchor="middle" fontSize="39" fontWeight="900">{String(d.a)}x − {String(d.b)} = {String(d.rhs)}</text>
      <text x="180" y="290" textAnchor="middle" fontSize="36" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;

    if(puzzle.family==="distributive") return <>
      <text x="180" y="220" textAnchor="middle" fontSize="36" fontWeight="900">{String(d.a)}(x + {String(d.b)}) = {String(d.rhs)}</text>
      <text x="180" y="290" textAnchor="middle" fontSize="36" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;

    if(puzzle.family==="ratio") return <>
      <text x="180" y="205" textAnchor="middle" fontSize="30" fontWeight="900">x : y = {String(d.ratioA)} : {String(d.ratioB)}</text>
      <text x="180" y="255" textAnchor="middle" fontSize="28" fontWeight="900">x + y = {String(d.total)}</text>
      <text x="180" y="310" textAnchor="middle" fontSize="34" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;

    if(puzzle.family==="sum-product") return <>
      <text x="180" y="190" textAnchor="middle" fontSize="29" fontWeight="900">a + b = {String(d.sum)}</text>
      <text x="180" y="235" textAnchor="middle" fontSize="29" fontWeight="900">ab = {String(d.product)}</text>
      <text x="180" y="300" textAnchor="middle" fontSize="34" fontWeight="900" fill="#7c3aed">a² + b² = ?</text>
    </>;

    if(puzzle.family==="system") return <>
      <text x="180" y="195" textAnchor="middle" fontSize="31" fontWeight="900">x + y = {String(d.sum)}</text>
      <text x="180" y="245" textAnchor="middle" fontSize="31" fontWeight="900">x − y = {String(d.diff)}</text>
      <text x="180" y="305" textAnchor="middle" fontSize="34" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;

    if(puzzle.family==="consecutive") return <>
      <text x="180" y="215" textAnchor="middle" fontSize="34" fontWeight="900">x + (x + 1) = {String(d.sum)}</text>
      <text x="180" y="290" textAnchor="middle" fontSize="36" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;

    return <>
      <text x="180" y="215" textAnchor="middle" fontSize="33" fontWeight="900">x ÷ {String(d.divisor)} + {String(d.add)} = {String(d.rhs)}</text>
      <text x="180" y="290" textAnchor="middle" fontSize="36" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;
  }

  if(puzzle.family==="rectangle-side"){
    return <>
      <rect x="80" y="155" width="200" height="150" fill="none" stroke="#17101f" strokeWidth="7"/>
      <text x="180" y="235" textAnchor="middle" fontSize="32" fontWeight="900">{String(d.area)} m²</text>
      <text x="48" y="235" fontSize="22" fontWeight="900">{String(d.h)}m</text>
      <text x="165" y="340" fontSize="27" fontWeight="900" fill="#7c3aed">x</text>
    </>;
  }

  if(puzzle.family==="triangle-area"){
    return <>
      <path d="M75 325L180 145L290 325Z" fill="none" stroke="#17101f" strokeWidth="7"/>
      <line x1="180" y1="145" x2="180" y2="325" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 8"/>
      <text x="160" y="350" fontSize="20" fontWeight="900">{String(d.base)}m</text>
      <text x="190" y="240" fontSize="20" fontWeight="900">{String(d.height)}m</text>
    </>;
  }

  if(puzzle.family==="shaded"){
    return <>
      <rect x="75" y="145" width="210" height="210" fill="#ede9fe" stroke="#17101f" strokeWidth="7"/>
      <rect x="155" y="225" width="90" height="90" fill="#fbfafc" stroke="#17101f" strokeWidth="5"/>
      <text x="82" y="135" fontSize="19" fontWeight="900">{String(d.a)}m</text>
      <text x="162" y="218" fontSize="18" fontWeight="900">{String(d.b)}m</text>
    </>;
  }

  if(puzzle.family==="perimeter"){
    return <>
      <rect x="75" y="165" width="210" height="145" fill="none" stroke="#17101f" strokeWidth="7"/>
      <text x="160" y="342" fontSize="20" fontWeight="900">{String(d.w)}m</text>
      <text x="38" y="245" fontSize="20" fontWeight="900">{String(d.h)}m</text>
      <text x="180" y="240" textAnchor="middle" fontSize="26" fontWeight="900" fill="#7c3aed">P = ?</text>
    </>;
  }

  if(puzzle.family==="pythagoras"){
    return <>
      <path d="M75 325L75 145L290 325Z" fill="none" stroke="#17101f" strokeWidth="7"/>
      <path d="M75 300H100V325" fill="none" stroke="#7c3aed" strokeWidth="4"/>
      <text x="38" y="245" fontSize="20" fontWeight="900">{String(d.a)}</text>
      <text x="165" y="350" fontSize="20" fontWeight="900">{String(d.b)}</text>
      <text x="190" y="220" fontSize="28" fontWeight="900" fill="#7c3aed">x</text>
    </>;
  }

  if(puzzle.family==="l-shape"){
    return <>
      <path d="M70 145H290V250H220V340H70Z" fill="#ede9fe" stroke="#17101f" strokeWidth="7" strokeLinejoin="round"/>
      <text x="155" y="130" fontSize="18" fontWeight="900">{String(d.bigW)}m</text>
      <text x="35" y="250" fontSize="18" fontWeight="900">{String(d.bigH)}m</text>
      <text x="225" y="275" fontSize="16" fontWeight="900">{String(d.cutW)}m</text>
      <text x="245" y="330" fontSize="16" fontWeight="900">{String(d.cutH)}m</text>
    </>;
  }

  if(puzzle.family==="trapezoid"){
    return <>
      <path d="M105 155H255L300 330H60Z" fill="none" stroke="#17101f" strokeWidth="7" strokeLinejoin="round"/>
      <line x1="180" y1="155" x2="180" y2="330" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 8"/>
      <text x="170" y="140" fontSize="18" fontWeight="900">{String(d.a)}m</text>
      <text x="168" y="355" fontSize="18" fontWeight="900">{String(d.b)}m</text>
      <text x="190" y="245" fontSize="18" fontWeight="900">{String(d.h)}m</text>
    </>;
  }

  return <>
    <circle cx="180" cy="245" r="95" fill="none" stroke="#17101f" strokeWidth="7"/>
    <line x1="180" y1="245" x2="275" y2="245" stroke="#7c3aed" strokeWidth="5"/>
    <text x="215" y="230" fontSize="20" fontWeight="900">r = {String(d.radius)}</text>
    <text x="180" y="385" textAnchor="middle" fontSize="24" fontWeight="900" fill="#7c3aed">C = ?</text>
  </>;
}

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
      <p className="text-[15px] font-black">{title}</p>
      <p className="mt-1 text-[12px] font-semibold leading-5 text-muted-foreground">{description}</p>
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
      <p className="text-[14px] font-black">{title}</p>
      <p className="mt-1 text-[12px] font-semibold text-muted-foreground">{description}</p>
    </button>
  );
}

function LoadingScreen(){
  return <main className="min-h-screen bg-[#f7f5fb]"><div className="mx-auto max-w-[1280px] px-4 py-10"><div className="h-[360px] animate-pulse rounded-[30px] bg-white"/></div></main>;
}
