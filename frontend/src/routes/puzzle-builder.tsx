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
type Presentation = "clean" | "debate";
type Puzzle = ViralPuzzle & { id: string };

type PuzzleCopy = {
  descriptions: Record<PuzzleKind, string>;
  titles: Record<PuzzleKind, string>;
  subtitles: Record<PuzzleKind, string>;
  cleanDesc: string;
  debateDesc: string;
  debateQuestion: string;
};

const RECENT_LIMIT = 40;
const ROTATION_STORAGE_KEY = "aqryo-puzzle-rotation-v2";
type RecentFamilies = Record<PuzzleKind, string[]>;
const emptyRecent = (): RecentFamilies => ({math:[],geometry:[],count:[],algebra:[],area:[]});

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
      area: "Bileşik alanlar, eksik parçalar ve çok adımlı uzunluklar",
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
      count: "Hidden triangles and overlapping squares",
      algebra: "Symbols, identities and missing information",
      area: "Composite regions, missing pieces and two-step lengths",
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
    descriptions:{math:"Prioridad, paréntesis, porcentajes y potencias",geometry:"Ángulos, paralelas, opuestos y polígonos",count:"Triángulos ocultos y cuadrados superpuestos",algebra:"Símbolos, identidades e información insuficiente",area:"Área, perímetro, Pitágoras y figuras compuestas"},
    titles:{math:"¿Cuál es el resultado?",geometry:"Halla el ángulo x",count:"¿Cuántos hay en total?",algebra:"Halla x",area:"Halla el valor que falta"},
    subtitles:{math:"No hagas primero lo que ves primero 👀",geometry:"Mira el dibujo otra vez",count:"Las figuras pequeñas son solo el inicio",algebra:"Parece corto. Piénsalo bien.",area:"Elige la fórmula correcta"},
    cleanDesc:"Una pregunta · tarjeta limpia",debateDesc:"Dos respuestas · para debatir",debateQuestion:"¿Quién tiene razón?",
  },
  pt: {
    descriptions:{math:"Ordem, parênteses, porcentagens e potências",geometry:"Ângulos, paralelas, opostos e polígonos",count:"Triângulos ocultos e quadrados sobrepostos",algebra:"Símbolos, identidades e dados insuficientes",area:"Área, perímetro, Pitágoras e formas compostas"},
    titles:{math:"Qual é o resultado?",geometry:"Encontre o ângulo x",count:"Quantos há no total?",algebra:"Encontre x",area:"Encontre o valor que falta"},
    subtitles:{math:"Não faça primeiro o que aparece primeiro 👀",geometry:"Olhe o desenho mais uma vez",count:"As formas pequenas são só o começo",algebra:"Parece curto. Pense bem.",area:"Escolha a fórmula certa"},
    cleanDesc:"Uma pergunta · cartão limpo",debateDesc:"Duas respostas · feito para comentários",debateQuestion:"Quem está certo?",
  },
  fr: {
    descriptions:{math:"Priorités, parenthèses, pourcentages et puissances",geometry:"Angles, parallèles, opposés et polygones",count:"Triangles cachés et carrés superposés",algebra:"Symboles, identités et données insuffisantes",area:"Aire, périmètre, Pythagore et formes composées"},
    titles:{math:"Quel est le résultat ?",geometry:"Trouve l’angle x",count:"Combien au total ?",algebra:"Trouve x",area:"Trouve la valeur manquante"},
    subtitles:{math:"Ne fais pas d’abord ce que tu vois d’abord 👀",geometry:"Regarde encore une fois le schéma",count:"Les petites formes ne sont que le début",algebra:"Ça paraît court. Réfléchis bien.",area:"Choisis la bonne formule"},
    cleanDesc:"Une question · carte propre",debateDesc:"Deux réponses · pour débattre",debateQuestion:"Qui a raison ?",
  },
  de: {
    descriptions:{math:"Reihenfolge, Klammern, Prozent und Potenzen",geometry:"Winkel, Parallelen, Scheitelwinkel und Polygone",count:"Versteckte Dreiecke und überlappende Quadrate",algebra:"Symbole, Identitäten und fehlende Angaben",area:"Fläche, Umfang, Pythagoras und zusammengesetzte Formen"},
    titles:{math:"Was ist das Ergebnis?",geometry:"Finde den Winkel x",count:"Wie viele insgesamt?",algebra:"Löse nach x",area:"Finde den fehlenden Wert"},
    subtitles:{math:"Nicht einfach von links nach rechts 👀",geometry:"Schau noch einmal auf die Zeichnung",count:"Die kleinen Formen sind nur der Anfang",algebra:"Sieht kurz aus. Denk genau nach.",area:"Wähle die richtige Formel"},
    cleanDesc:"Eine Frage · saubere Karte",debateDesc:"Zwei Antworten · für Kommentare",debateQuestion:"Wer hat recht?",
  },
  it: {
    descriptions:{math:"Priorità, parentesi, percentuali e potenze",geometry:"Angoli, parallele, opposti e poligoni",count:"Triangoli nascosti e quadrati sovrapposti",algebra:"Simboli, identità e dati insufficienti",area:"Area, perimetro, Pitagora e figure composte"},
    titles:{math:"Qual è il risultato?",geometry:"Trova l’angolo x",count:"Quanti sono in totale?",algebra:"Trova x",area:"Trova il valore mancante"},
    subtitles:{math:"Non fare per prima l’operazione che vedi 👀",geometry:"Guarda il disegno ancora una volta",count:"Le forme piccole sono solo l’inizio",algebra:"Sembra breve. Pensaci bene.",area:"Scegli la formula giusta"},
    cleanDesc:"Una domanda · card pulita",debateDesc:"Due risposte · fatta per i commenti",debateQuestion:"Chi ha ragione?",
  },
  ar: {
    descriptions:{math:"ترتيب العمليات والأقواس والنسب والأسس",geometry:"الزوايا والمتوازيات والزوايا المتقابلة والمضلعات",count:"مثلثات مخفية ومربعات متداخلة",algebra:"رموز ومتطابقات ومعلومات ناقصة",area:"مساحة ومحيط وفيثاغورس وأشكال مركبة"},
    titles:{math:"ما النتيجة؟",geometry:"أوجد الزاوية x",count:"كم العدد الكلي؟",algebra:"أوجد x",area:"أوجد القيمة الناقصة"},
    subtitles:{math:"لا تبدأ بأول عملية تراها 👀",geometry:"انظر إلى الشكل مرة أخرى",count:"الأشكال الصغيرة ليست كل شيء",algebra:"يبدو قصيرًا. فكّر جيدًا.",area:"اختر القانون الصحيح"},
    cleanDesc:"سؤال واحد · بطاقة نظيفة",debateDesc:"إجابتان · للنقاش",debateQuestion:"من الصحيح؟",
  },
  hi: {
    descriptions:{math:"ऑपरेशन क्रम, ब्रैकेट, प्रतिशत और घात",geometry:"कोण, समानांतर रेखाएँ, विपरीत कोण और बहुभुज",count:"छिपे त्रिभुज और एक दूसरे पर बने वर्ग",algebra:"प्रतीक, सर्वसमिकाएँ और अधूरी जानकारी",area:"क्षेत्रफल, परिमाप, पाइथागोरस और संयुक्त आकृतियाँ"},
    titles:{math:"उत्तर क्या है?",geometry:"कोण x ज्ञात करें",count:"कुल कितने हैं?",algebra:"x ज्ञात करें",area:"लापता मान ज्ञात करें"},
    subtitles:{math:"जो पहले दिखे वही पहले मत करो 👀",geometry:"चित्र को एक बार फिर देखें",count:"छोटी आकृतियाँ सिर्फ शुरुआत हैं",algebra:"छोटा है, पर ध्यान चाहिए",area:"सही सूत्र चुनें"},
    cleanDesc:"एक सवाल · साफ कार्ड",debateDesc:"दो जवाब · चर्चा के लिए",debateQuestion:"कौन सही है?",
  },
  id: {
    descriptions:{math:"Urutan operasi, kurung, persen dan pangkat",geometry:"Sudut, garis sejajar, sudut berlawanan dan poligon",count:"Segitiga tersembunyi dan persegi bertumpuk",algebra:"Simbol, identitas dan informasi kurang",area:"Luas, keliling, Pythagoras dan bangun gabungan"},
    titles:{math:"Berapa hasilnya?",geometry:"Cari sudut x",count:"Berapa jumlah semuanya?",algebra:"Cari x",area:"Cari nilai yang hilang"},
    subtitles:{math:"Jangan kerjakan yang pertama terlihat 👀",geometry:"Lihat diagram sekali lagi",count:"Bangun kecil baru permulaan",algebra:"Terlihat singkat. Pikirkan baik-baik.",area:"Pilih rumus yang tepat"},
    cleanDesc:"Satu soal · kartu bersih",debateDesc:"Dua jawaban · untuk diskusi",debateQuestion:"Siapa yang benar?",
  },
  ru: {
    descriptions:{math:"Порядок действий, скобки, проценты и степени",geometry:"Углы, параллельные, вертикальные углы и многоугольники",count:"Скрытые треугольники и пересекающиеся квадраты",algebra:"Символы, тождества и неполные данные",area:"Площадь, периметр, Пифагор и составные фигуры"},
    titles:{math:"Какой результат?",geometry:"Найди угол x",count:"Сколько всего?",algebra:"Найди x",area:"Найди неизвестное"},
    subtitles:{math:"Не спеши считать слева направо 👀",geometry:"Посмотри на рисунок ещё раз",count:"Маленькие фигуры — только начало",algebra:"Коротко, но нужна внимательность",area:"Выбери правильную формулу"},
    cleanDesc:"Один вопрос · чистая карточка",debateDesc:"Два ответа · для обсуждения",debateQuestion:"Кто прав?",
  },
  bn: {
    descriptions:{math:"অপারেশন ক্রম, বন্ধনী, শতাংশ ও ঘাত",geometry:"কোণ, সমান্তরাল রেখা, বিপ্রতীপ কোণ ও বহুভুজ",count:"লুকানো ত্রিভুজ ও ছেদ করা বর্গ",algebra:"প্রতীক, অভেদ এবং অসম্পূর্ণ তথ্য",area:"ক্ষেত্রফল, পরিসীমা, পিথাগোরাস ও যৌগিক আকৃতি"},
    titles:{math:"ফল কত?",geometry:"x কোণ বের করুন",count:"মোট কতটি?",algebra:"x বের করুন",area:"অনুপস্থিত মান বের করুন"},
    subtitles:{math:"যেটা আগে দেখছেন সেটাই আগে করবেন না 👀",geometry:"চিত্রটি আরেকবার দেখুন",count:"ছোট আকৃতিগুলো শুধু শুরু",algebra:"ছোট দেখায়, মনোযোগ দরকার",area:"সঠিক সূত্র বেছে নিন"},
    cleanDesc:"একটি প্রশ্ন · পরিষ্কার কার্ড",debateDesc:"দুটি উত্তর · আলোচনার জন্য",debateQuestion:"কে ঠিক?",
  },
  ur: {
    descriptions:{math:"عملی ترتیب، قوسین، فیصد اور قوتیں",geometry:"زاویے، متوازی لکیریں، مقابل زاویے اور کثیرالاضلاع",count:"پوشیدہ مثلث اور ایک دوسرے پر بنے مربع",algebra:"علامتیں، شناختیں اور نامکمل معلومات",area:"رقبہ، محیط، فیثاغورث اور مرکب اشکال"},
    titles:{math:"نتیجہ کیا ہے؟",geometry:"زاویہ x معلوم کریں",count:"کل کتنے ہیں؟",algebra:"x معلوم کریں",area:"نامعلوم قدر معلوم کریں"},
    subtitles:{math:"جو پہلے نظر آئے اسے پہلے نہ کریں 👀",geometry:"شکل کو ایک بار پھر دیکھیں",count:"چھوٹی شکلیں صرف ابتدا ہیں",algebra:"مختصر ہے، مگر غور چاہیے",area:"درست فارمولا منتخب کریں"},
    cleanDesc:"ایک سوال · صاف کارڈ",debateDesc:"دو جواب · بحث کے لیے",debateQuestion:"کون درست ہے؟",
  },
  vi: {
    descriptions:{math:"Thứ tự phép tính, ngoặc, phần trăm và lũy thừa",geometry:"Góc, song song, góc đối đỉnh và đa giác",count:"Tam giác ẩn và hình vuông chồng lên nhau",algebra:"Biểu tượng, hằng đẳng thức và thiếu dữ kiện",area:"Diện tích, chu vi, Pythagore và hình ghép"},
    titles:{math:"Kết quả là bao nhiêu?",geometry:"Tìm góc x",count:"Tổng cộng có bao nhiêu?",algebra:"Tìm x",area:"Tìm giá trị còn thiếu"},
    subtitles:{math:"Đừng làm phép tính đầu tiên bạn thấy 👀",geometry:"Nhìn hình thêm một lần nữa",count:"Các hình nhỏ chỉ là khởi đầu",algebra:"Trông ngắn nhưng cần cẩn thận",area:"Chọn đúng công thức"},
    cleanDesc:"Một câu hỏi · thẻ sạch",debateDesc:"Hai đáp án · để tranh luận",debateQuestion:"Ai đúng?",
  },
  fil: {
    descriptions:{math:"Order of operations, brackets, percent at powers",geometry:"Angles, parallel lines, vertical angles at polygons",count:"Nakatagong tatsulok at magkapatong na parisukat",algebra:"Mga simbolo, identity at kulang na impormasyon",area:"Area, perimeter, Pythagoras at composite shapes"},
    titles:{math:"Ano ang sagot?",geometry:"Hanapin ang angle x",count:"Ilan lahat?",algebra:"Hanapin ang x",area:"Hanapin ang nawawalang value"},
    subtitles:{math:"Huwag unahin agad ang unang nakikita 👀",geometry:"Tingnan ulit ang diagram",count:"Simula pa lang ang maliliit na hugis",algebra:"Maikli pero kailangan ng ingat",area:"Piliin ang tamang formula"},
    cleanDesc:"Isang tanong · malinis na card",debateDesc:"Dalawang sagot · para sa comments",debateQuestion:"Sino ang tama?",
  },
};

const UNDETERMINED: Record<AqryoLocale, string> = {
  tr:"Belirlenemez", en:"Cannot be determined", es:"Indeterminado", pt:"Indeterminado",
  fr:"Indéterminé", de:"Nicht bestimmbar", it:"Indeterminato", ar:"لا يمكن تحديده",
  hi:"निर्धारित नहीं", id:"Tidak dapat ditentukan", ru:"Нельзя определить",
  bn:"নির্ধারণ করা যায় না", ur:"تعین نہیں کیا جا سکتا", vi:"Không xác định được", fil:"Hindi matukoy",
};
const UNDETERMINED_SHORT: Record<AqryoLocale, string> = {
  tr:"Belirsiz",en:"Unknown",es:"Indefinido",pt:"Indefinido",fr:"Indéfini",
  de:"Unklar",it:"Incerto",ar:"غير محدد",hi:"अज्ञात",id:"Tak pasti",
  ru:"Неизвестно",bn:"অনির্ণীত",ur:"نامعلوم",vi:"Không rõ",fil:"Di tiyak",
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

function headlineFor(locale:AqryoLocale,puzzle:Puzzle) {
  if(puzzle.kind==="count" && puzzle.countTarget) return COUNT_TITLES[locale][puzzle.countTarget];
  if(puzzle.kind==="area" && puzzle.areaTarget) return AREA_TITLES[locale][puzzle.areaTarget];
  return COPY[locale].titles[puzzle.kind];
}

function generate(kind: PuzzleKind, recent: string[]): Puzzle {
  const families = VIRAL_FAMILIES.filter((family) => family.kind === kind);
  const seen = recent.filter((family) => families.some((candidate) => candidate.id === family));
  // Exhaust every family before repeating; avoid the previous family at the cycle boundary.
  const excluded = seen.length >= families.length ? seen.slice(0, 1) : seen;
  return { id: crypto.randomUUID(), ...makeViralPuzzle(kind, excluded) };
}

function ctaFor(locale: AqryoLocale, puzzle: Puzzle) {
  const copy = COPY[locale] ?? COPY.en;
  return `${headlineFor(locale,puzzle)} · ${copy.subtitles[puzzle.kind]}`;
}

function PuzzleBuilderPage() {
  const { locale, t } = useAqryoLocale();
  const copy = COPY[locale] ?? COPY.en;
  const [loading,setLoading]=useState(true);
  const [kind,setKind]=useState<PuzzleKind>("math");
  const [presentation,setPresentation]=useState<Presentation>("clean");
  const [recent,setRecent]=useState<RecentFamilies>(readRecent);
  const [puzzle,setPuzzle]=useState<Puzzle>(()=>generate("math", []));
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

  useEffect(()=>{
    try { window.localStorage.setItem(ROTATION_STORAGE_KEY,JSON.stringify(recent)); } catch { /* Storage may be unavailable. */ }
  },[recent]);

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
    setPresentation("clean");
    remember(fresh);
  }

  function regenerate(){
    const fresh=generate(kind,recent[kind]);
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
                {locale === "tr" ? "Görseli değiştir" : t("newQuestion")} ↻
              </button>
              <div className="mx-auto max-w-[620px]">
                <PuzzleSvg ref={svgRef} puzzle={puzzle} presentation={presentation} copy={copy} locale={locale}/>
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

            <p className="mt-7 text-[14px] font-black">{t("presentation")}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Choice active={presentation==="clean"} title={t("clean")} description={copy.cleanDesc} onClick={()=>setPresentation("clean")}/>
              <Choice active={presentation==="debate"} title={t("debate")} description={copy.debateDesc} onClick={()=>setPresentation("debate")}/>
            </div>

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
              <button disabled={sharing} onClick={()=>void share()} className="rounded-full bg-violet-600 px-6 py-3.5 text-[14px] font-black text-white">{sharing?"...":t("share")} →</button>
              <button onClick={()=>void copyText()} className="rounded-full border border-border bg-white px-6 py-3.5 text-[14px] font-black">{copied?"✓":t("copyText")}</button>
              <button onClick={downloadSvg} className="rounded-full border border-border bg-white px-6 py-3.5 text-[14px] font-black">{t("downloadSvg")}</button>
            </div>
          </div>

          <div className="grid gap-3 rounded-[26px] border border-violet-100 bg-violet-50/70 p-5 sm:grid-cols-2 sm:p-6">
            <div><p className="text-[12px] font-black text-violet-950">{t("correctAnswer")}</p><p className="mt-2 text-[30px] font-black text-violet-800">{puzzle.answerKey ? UNDETERMINED[locale] : puzzle.answer}</p></div>
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
  {puzzle:Puzzle;presentation:Presentation;copy:PuzzleCopy;locale:AqryoLocale}
>(function PuzzleSvg({puzzle,presentation,copy,locale},ref){
  const answer = puzzle.answerKey ? UNDETERMINED_SHORT[locale] : puzzle.answer;
  const headline = headlineFor(locale,puzzle);
  const headlineSize = headline.length > 36 ? 13 : headline.length > 28 ? 16 : headline.length > 22 ? 18 : 20;
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
      ) : <text x="180" y="440" textAnchor="middle" fontSize="16" fontWeight="900" fill="#6b7280">{copy.subtitles[puzzle.kind]}</text>}
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
