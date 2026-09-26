export const PUZZLE_CATEGORIES = [
  "İşlem Önceliği",
  "Geometri",
  "Kaç Tane Var",
  "Mini Cebir",
  "Alan/Uzunluk",
] as const;

export type PuzzleCategory = (typeof PUZZLE_CATEGORIES)[number];
export type Puzzle = {
  family: string;
  category: PuzzleCategory;
  title: string;
  question: string;
  answer: number;
  commonWrong: number;
  explanation: string;
  cta: string;
  duel: string;
  svg: string;
};

type Template = { id: string; category: PuzzleCategory; make: (random: () => number) => Puzzle };
const pick = (r: () => number, values: number[]) => values[Math.floor(r() * values.length)];
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const txt = (x: number, y: number, value: string | number, size = 31, extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="700" ${extra.includes("fill=") ? "" : 'fill="#1e1835"'} ${extra}>${esc(String(value))}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#25203d" stroke-width="4" stroke-linecap="round" ${extra}/>`;
const card = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720"><rect width="960" height="720" rx="36" fill="#f8f6ff"/><rect x="36" y="36" width="888" height="648" rx="28" fill="white" stroke="#e9e4f3" stroke-width="3"/>${body}</svg>`;
const formula = (heading: string, rows: string[], footer = "?") =>
  card(
    txt(480, 115, heading, 34) +
      rows
        .map(
          (row, i) =>
            `<rect x="165" y="${175 + i * 105}" width="630" height="79" rx="17" fill="${i % 2 ? "#fff1ed" : "#f0ecff"}"/>` +
            txt(480, 215 + i * 105, row, 39),
        )
        .join("") +
      txt(480, 590, footer, 38, 'fill="#7c3aed"'),
  );
function result(base: Puzzle, svg = base.svg): Puzzle {
  if (
    !Number.isFinite(base.answer) ||
    !Number.isFinite(base.commonWrong) ||
    base.answer === base.commonWrong
  )
    throw new Error(`Invalid puzzle ${base.family}`);
  if (!svg.startsWith("<svg")) throw new Error(`Missing SVG for ${base.family}`);
  return { ...base, svg };
}

const templates: Template[] = [
  {
    id: "left-to-right",
    category: "İşlem Önceliği",
    make: (r) => {
      const b = pick(r, [2, 3, 4]),
        c = pick(r, [2, 3, 4]),
        a = b * c * pick(r, [2, 3, 4]),
        d = pick(r, [5, 7, 9]);
      const answer = (a / b) * c + d,
        wrong = a / (b * c) + d;
      return result(
        {
          family: "left-to-right",
          category: "İşlem Önceliği",
          title: "Soldan sağa tuzağı",
          question: "Sonuç kaç?",
          answer,
          commonWrong: wrong,
          explanation: `Bölme ve çarpma aynı öncelikte: soldan sağa ${a} ÷ ${b} = ${a / b}, sonra × ${c} ve + ${d}.`,
          cta: "Bölme mi çarpma mı önce? Yorumda işlemini göster.",
          duel: `Biri ${answer}, diğeri ${wrong} diyor. Kim haklı?`,
          svg: "",
        },
        formula("SIRA KİMDE?", [`${a} ÷ ${b} × ${c} + ${d} = ?`], "İşlemini yorumda göster"),
      );
    },
  },
  {
    id: "power-parentheses",
    category: "İşlem Önceliği",
    make: (r) => {
      const a = pick(r, [2, 3, 4]),
        b = pick(r, [3, 4, 5]),
        c = pick(r, [2, 3]),
        d = pick(r, [2, 3, 4]);
      const answer = a + b ** 2 * (c + d),
        wrong = (a + b) ** 2 * (c + d);
      return result(
        {
          family: "power-parentheses",
          category: "İşlem Önceliği",
          title: "Üs nereye ait?",
          question: "Sonuç kaç?",
          answer,
          commonWrong: wrong,
          explanation: `Önce (${c}+${d})=${c + d}, sonra ${b}²=${b * b}; çarpıp ${a} ekle.`,
          cta: "Parantezin dışındaki sayıyı nereye koydun?",
          duel: `A: ${answer}, B: ${wrong}. İşlem sırası kimin tarafında?`,
          svg: "",
        },
        formula("ÜS TUZAĞI", [`${a} + ${b}² × (${c} + ${d}) = ?`], "İlk adımın ne?"),
      );
    },
  },
  {
    id: "unary-square",
    category: "İşlem Önceliği",
    make: (r) => {
      const a = pick(r, [3, 4, 5]),
        b = pick(r, [4, 5, 6]),
        c = pick(r, [3, 4]);
      const answer = -a * a + b * c,
        wrong = a * a + b * c;
      return result(
        {
          family: "unary-square",
          category: "İşlem Önceliği",
          title: "Eksi işareti nerede?",
          question: "Sonuç kaç?",
          answer,
          commonWrong: wrong,
          explanation: `−${a}² = −${a * a}; eksi işareti üssün dışında. Sonra ${b} × ${c} eklenir.`,
          cta: "Eksi de kareye girer mi? İspatla.",
          duel: `${answer} diyen mi, ${wrong} diyen mi haklı?`,
          svg: "",
        },
        formula("EKSİ + ÜS", [`−${a}² + ${b} × ${c} = ?`], "Eksi işaretine dikkat"),
      );
    },
  },
  {
    id: "parallel-zigzag",
    category: "Geometri",
    make: (r) => {
      const a = pick(r, [30, 35, 40, 45]),
        b = pick(r, [25, 30, 35, 40]);
      const answer = a + b,
        wrong = 180 - a - b;
      // Both rays leave the kink to the right. Their inclinations are exactly a and b to the parallels.
      const cx = 300,
        cy = 355,
        rad = Math.PI / 180;
      const topX = cx + (cy - 150) / Math.tan(a * rad),
        topY = 150;
      const botX = cx + (565 - cy) / Math.tan(b * rad),
        botY = 565;
      const svg = card(
        line(120, 150, 840, 150) +
          line(120, 565, 840, 565) +
          line(cx, cy, topX, topY) +
          line(cx, cy, botX, botY) +
          `<path d="M 390 150 l 14 -9 m -14 9 l 14 9 M 390 565 l 14 -9 m -14 9 l 14 9" stroke="#7c3aed" stroke-width="4" fill="none"/>` +
          `<path d="M ${cx + 80 * Math.cos(a * rad)} ${cy - 80 * Math.sin(a * rad)} A 80 80 0 0 1 ${cx + 80 * Math.cos(b * rad)} ${cy + 80 * Math.sin(b * rad)}" fill="none" stroke="#ec4899" stroke-width="4"/>` +
          txt(topX - 90, 173, `${a}°`, 34) +
          txt(botX - 60, 522, `${b}°`, 34) +
          txt(408, 355, "x", 42, 'fill="#ec4899"') +
          txt(480, 635, "Paralel doğrular", 22),
      );
      return result({
        family: "parallel-zigzag",
        category: "Geometri",
        title: "Paralel zikzak",
        question: "Pembe yayla gösterilen x açısı kaç derece?",
        answer,
        commonWrong: wrong,
        explanation: `Köşeden paralellere bir doğru düşün: üstte ${a}°, altta ${b}° oluşur. Aradaki x = ${a}° + ${b}°.`,
        cta: "x kaç derece? Yardımcı çizgini tarif et.",
        duel: `A: ${answer}°, B: ${wrong}°. Paralellik kime hak veriyor?`,
        svg,
      });
    },
  },
  {
    id: "angle-bisector",
    category: "Geometri",
    make: (r) => {
      const a = pick(r, [50, 60, 70, 80]),
        answer = (180 - a) / 2,
        wrong = 180 - a;
      const cx = 480,
        cy = 460,
        rad = Math.PI / 180,
        radius = 230;
      // The marked ray splits the supplementary angle exactly in half.
      const upperAngle = 180 - a,
        half = upperAngle / 2;
      const rayX = cx + radius * Math.cos(upperAngle * rad),
        rayY = cy - radius * Math.sin(upperAngle * rad);
      const midX = cx + radius * Math.cos(half * rad),
        midY = cy - radius * Math.sin(half * rad);
      const arc = (start: number, end: number) => {
        const mid = ((start + end) / 2) * rad;
        return (
          `<path d="M ${cx + 75 * Math.cos(start * rad)} ${cy - 75 * Math.sin(start * rad)} A 75 75 0 0 0 ${cx + 75 * Math.cos(end * rad)} ${cy - 75 * Math.sin(end * rad)}" fill="none" stroke="#ec4899" stroke-width="4"/>` +
          `<line x1="${cx + 68 * Math.cos(mid)}" y1="${cy - 68 * Math.sin(mid)}" x2="${cx + 82 * Math.cos(mid)}" y2="${cy - 82 * Math.sin(mid)}" stroke="#ec4899" stroke-width="3"/>`
        );
      };
      const svg = card(
        line(130, cy, 830, cy) +
          line(cx, cy, rayX, rayY) +
          line(cx, cy, midX, midY) +
          arc(0, half) +
          arc(half, upperAngle) +
          txt(380, 415, `${a}°`, 34) +
          txt(570, 370, "x", 40, 'fill="#ec4899"') +
          txt(480, 105, "İşaretli iki açı eşit", 32) +
          txt(480, 625, "Açıortay", 23),
      );
      return result({
        family: "angle-bisector",
        category: "Geometri",
        title: "Açıortay tuzağı",
        question: "Pembe eş yayların sağındaki x kaç derece?",
        answer,
        commonWrong: wrong,
        explanation: `Doğru açıdan ${a}° çıkar: ${wrong}°. İki eş yay açıortayı gösterir; x = ${wrong}° ÷ 2 = ${answer}°.`,
        cta: "Açıortayı fark ettin mi?",
        duel: `${answer}° diyen mi, ${wrong}° diyen mi haklı?`,
        svg,
      });
    },
  },
  {
    id: "parallelogram-diagonal",
    category: "Geometri",
    make: (r) => {
      const obtuse = pick(r, [110, 120, 130]),
        phi = pick(r, [15, 20, 25]),
        theta = 180 - obtuse,
        answer = theta - phi,
        wrong = obtuse - phi;
      const rad = Math.PI / 180,
        ax = 230,
        ay = 535,
        width = 400;
      const height =
        (width * Math.tan(phi * rad)) / (1 - Math.tan(phi * rad) / Math.tan(theta * rad));
      const offset = height / Math.tan(theta * rad),
        bx = ax + width,
        dx = ax + offset,
        dy = ay - height,
        cx = bx + offset;
      const arc = (start: number, end: number, radius: number, color: string) =>
        `<path d="M ${ax + radius * Math.cos(start * rad)} ${ay - radius * Math.sin(start * rad)} A ${radius} ${radius} 0 0 0 ${ax + radius * Math.cos(end * rad)} ${ay - radius * Math.sin(end * rad)}" stroke="${color}" stroke-width="4" fill="none"/>`;
      const arrow = (x: number, y: number, ux: number, uy: number) => {
        const px = -uy,
          py = ux;
        return `<path d="M ${x - 14 * ux + 7 * px} ${y - 14 * uy + 7 * py} L ${x} ${y} L ${x - 14 * ux - 7 * px} ${y - 14 * uy - 7 * py}" stroke="#7c3aed" stroke-width="3" fill="none"/>`;
      };
      const sideLength = Math.hypot(offset, height),
        ux = offset / sideLength,
        uy = -height / sideLength;
      const svg = card(
        line(ax, ay, bx, ay) +
          line(bx, ay, cx, dy) +
          line(cx, dy, dx, dy) +
          line(dx, dy, ax, ay) +
          line(ax, ay, cx, dy) +
          arrow(ax + width / 2, ay, 1, 0) +
          arrow(dx + width / 2, dy, 1, 0) +
          arrow(ax + offset / 2, ay - height / 2, ux, uy) +
          arrow(ax + offset / 2 + 15 * ux, ay - height / 2 + 15 * uy, ux, uy) +
          arrow(bx + offset / 2, ay - height / 2, ux, uy) +
          arrow(bx + offset / 2 + 15 * ux, ay - height / 2 + 15 * uy, ux, uy) +
          arc(0, phi, 76, "#7c3aed") +
          arc(phi, theta, 96, "#ec4899") +
          `<path d="M ${bx - 72} ${ay} A 72 72 0 0 1 ${bx + 72 * Math.cos(theta * rad)} ${ay - 72 * Math.sin(theta * rad)}" stroke="#7c3aed" stroke-width="4" fill="none"/>` +
          txt(ax + 110, ay - 25, `${phi}°`, 31) +
          txt(
            ax + 105 * Math.cos(((phi + theta) / 2) * rad),
            ay - 155 * Math.sin(((phi + theta) / 2) * rad),
            "x",
            39,
            'fill="#ec4899"',
          ) +
          txt(bx - 55, ay - 105, `${obtuse}°`, 31) +
          txt(480, 95, "Karşı kenarlar paralel", 32) +
          txt(480, 645, "Pembe yay x açısı", 22),
      );
      return result({
        family: "parallelogram-diagonal",
        category: "Geometri",
        title: "Köşegen hangi açıyı böldü?",
        question: "Pembe yayla gösterilen x kaç derece?",
        answer,
        commonWrong: wrong,
        explanation: `Paralelkenarda komşu açılar bütünler: sol alt köşe ${theta}°. Köşegenin tabanla açısı ${phi}° olduğundan x = ${theta}° − ${phi}° = ${answer}°.`,
        cta: "Köşegen bütün açıyı mı böldü?",
        duel: `${answer}° mi, ${wrong}° mi? Komşu açıları kontrol et.`,
        svg,
      });
    },
  },
  {
    id: "all-squares",
    category: "Kaç Tane Var",
    make: (r) => {
      const n = pick(r, [3, 4, 5]),
        answer = Array.from({ length: n }, (_, i) => (n - i) ** 2).reduce((a, b) => a + b, 0),
        wrong = n * n;
      const s = 440 / n,
        x = 260,
        y = 160;
      const svg = card(
        Array.from(
          { length: n + 1 },
          (_, i) => line(x + i * s, y, x + i * s, y + 440) + line(x, y + i * s, x + 440, y + i * s),
        ).join("") +
          txt(480, 100, "Bütün kareleri say", 35) +
          txt(480, 645, "Büyük kareler de dahil", 23),
      );
      return result({
        family: "all-squares",
        category: "Kaç Tane Var",
        title: "Kare avı",
        question: "Şekilde toplam kaç kare var?",
        answer,
        commonWrong: wrong,
        explanation: `${n}×${n} küçük kareyle bitmez: boyutlara göre ${Array.from({ length: n }, (_, i) => (n - i) ** 2).join(" + ")} = ${answer}.`,
        cta: "Küçükleri sayıp durma; toplamı yaz.",
        duel: `${wrong} mü, ${answer} mi? Büyük kareleri kim gördü?`,
        svg,
      });
    },
  },
  {
    id: "all-rectangles",
    category: "Kaç Tane Var",
    make: (r) => {
      const cols = pick(r, [3, 4, 5]),
        rows = pick(r, [2, 3, 4]);
      const answer = ((cols * (cols + 1)) / 2) * ((rows * (rows + 1)) / 2),
        wrong = cols * rows;
      const sx = 540 / cols,
        sy = 390 / rows,
        x = 210,
        y = 175;
      const svg = card(
        Array.from({ length: cols + 1 }, (_, i) => line(x + i * sx, y, x + i * sx, y + 390)).join(
          "",
        ) +
          Array.from({ length: rows + 1 }, (_, i) => line(x, y + i * sy, x + 540, y + i * sy)).join(
            "",
          ) +
          txt(480, 105, "Kaç dikdörtgen?", 35) +
          txt(480, 625, "Kareler de dikdörtgendir", 22),
      );
      return result({
        family: "all-rectangles",
        category: "Kaç Tane Var",
        title: "Dikdörtgen avı",
        question: "Kareler dahil toplam kaç dikdörtgen var?",
        answer,
        commonWrong: wrong,
        explanation: `${cols + 1} dikey çizgiden ikisini ve ${rows + 1} yatay çizgiden ikisini seç: ${(cols * (cols + 1)) / 2} × ${(rows * (rows + 1)) / 2} = ${answer}.`,
        cta: "Kareleri de saydın mı?",
        duel: `${wrong} diyen mi, ${answer} diyen mi haklı?`,
        svg,
      });
    },
  },
  {
    id: "triangle-lattice",
    category: "Kaç Tane Var",
    make: (r) => {
      const n = pick(r, [3, 4, 5]),
        points: Array<[number, number]> = [];
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) points.push([i, j]);
      const edge = (p: [number, number], q: [number, number]) => {
        const di = p[0] - q[0],
          dj = p[1] - q[1];
        return di === 0 || dj === 0 || di + dj === 0;
      };
      let answer = 0;
      for (let i = 0; i < points.length; i++)
        for (let j = i + 1; j < points.length; j++)
          for (let k = j + 1; k < points.length; k++) {
            const [a, b, c] = [points[i], points[j], points[k]];
            const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
            if (area && edge(a, b) && edge(b, c) && edge(a, c)) answer++;
          }
      const step = 390 / n,
        xy = ([i, j]: [number, number]) => [
          480 + ((i - j) * step) / 2,
          150 + ((i + j) * step * Math.sqrt(3)) / 2,
        ];
      let body = "";
      for (const p of points)
        for (const q of points) {
          const d = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]);
          if (d === 1 || (d === 2 && p[0] + p[1] === q[0] + q[1] && Math.abs(p[0] - q[0]) === 1)) {
            const [x1, y1] = xy(p),
              [x2, y2] = xy(q);
            body += line(x1, y1, x2, y2);
          }
        }
      const wrong = n * n;
      return result(
        {
          family: "triangle-lattice",
          category: "Kaç Tane Var",
          title: "Üçgen piramidi",
          question: "Her boyuttaki üçgenleri say: toplam kaç?",
          answer,
          commonWrong: wrong,
          explanation: `Yukarı ve aşağı bakan tüm boyutları ayrı sayınca ${answer} üçgen bulunur. Tek sıradaki ${wrong} sayımı yeterli değil.`,
          cta: "Ters duran üçgenleri yakaladın mı?",
          duel: `${wrong} mü ${answer} mi? Ters üçgenleri işaretle.`,
          svg: "",
        },
        card(
          txt(480, 95, "Üçgenleri say", 35) +
            body +
            txt(480, 635, "Ters yönlü olanlar da dahil", 22),
        ),
      );
    },
  },
  {
    id: "symbol-system",
    category: "Mini Cebir",
    make: (r) => {
      const a = pick(r, [4, 5, 6, 7, 8]),
        b = pick(r, [2, 3, 4, 5]);
      const answer = a + 2 * b,
        wrong = a + b;
      return result(
        {
          family: "symbol-system",
          category: "Mini Cebir",
          title: "Sembol sistemi",
          question: "Son satırdaki değer kaç?",
          answer,
          commonWrong: wrong,
          explanation: `İkinci eşitlikten ★ = ${a}; ilkinden ● = ${b}. Sonda iki ● var: ${a} + 2 × ${b} = ${answer}.`,
          cta: "Son satırda kaç tane daire var?",
          duel: `A: ${answer}, B: ${wrong}. Kim haklı?`,
          svg: "",
        },
        formula(
          "SEMBOLLERİN DEĞERİ",
          [`★ + ● = ${a + b}`, `2★ + ● = ${2 * a + b}`, "★ + ● + ● = ?"],
          "Son satırı yeniden say",
        ),
      );
    },
  },
  {
    id: "square-identity",
    category: "Mini Cebir",
    make: (r) => {
      const a = pick(r, [3, 4, 5, 6]),
        b = pick(r, [2, 3, 4, 5]);
      const sum = a + b,
        product = a * b,
        answer = a * a + b * b,
        wrong = sum * sum;
      return result(
        {
          family: "square-identity",
          category: "Mini Cebir",
          title: "Karelerin sırrı",
          question: "A² + B² kaç?",
          answer,
          commonWrong: wrong,
          explanation: `(A+B)² = A²+B²+2AB. Yani ${sum}² − 2×${product} = ${answer}.`,
          cta: "İki kat çarpımı çıkardın mı?",
          duel: `${wrong} mü ${answer} mi? Kare açılımıyla kanıtla.`,
          svg: "",
        },
        formula(
          "İKİ BİLİNMEYEN",
          [`A + B = ${sum}`, `A × B = ${product}`, "A² + B² = ?"],
          "A ve B'yi tek tek bulmak şart mı?",
        ),
      );
    },
  },
  {
    id: "sum-difference",
    category: "Mini Cebir",
    make: (r) => {
      const a = pick(r, [9, 11, 13, 15]),
        b = pick(r, [2, 3, 4, 5]),
        sum = a + b,
        difference = a - b,
        answer = a * b,
        wrong = sum * difference;
      return result(
        {
          family: "sum-difference",
          category: "Mini Cebir",
          title: "Toplam ve fark",
          question: "A × B kaç?",
          answer,
          commonWrong: wrong,
          explanation: `İki eşitliği topla: 2A = ${2 * a}, A = ${a}. Sonra B = ${sum} − ${a} = ${b}; çarpımları ${answer}.`,
          cta: "Toplamı farkla mı çarptın?",
          duel: `${answer} diyen mi, ${wrong} diyen mi haklı?`,
          svg: "",
        },
        formula(
          "İKİ SAYI, İKİ İPUCU",
          [`A + B = ${sum}`, `A − B = ${difference}`, "A × B = ?"],
          "Önce A ve B'yi bul",
        ),
      );
    },
  },
  {
    id: "missing-corner",
    category: "Alan/Uzunluk",
    make: (r) => {
      const w = pick(r, [10, 12, 14, 16]),
        h = pick(r, [8, 10, 12]),
        cutW = pick(r, [3, 4, 5]),
        cutH = pick(r, [2, 3, 4]);
      const answer = w * h - cutW * cutH,
        wrong = w * h;
      const scale = Math.min(500 / w, 350 / h),
        x = 480 - (w * scale) / 2,
        y = 170,
        sx = scale,
        sy = scale;
      const path = `M ${x} ${y} H ${x + w * sx} V ${y + (h - cutH) * sy} H ${x + (w - cutW) * sx} V ${y + h * sy} H ${x} Z`;
      const svg = card(
        `<path d="${path}" fill="#ddd3ff" stroke="#25203d" stroke-width="5" stroke-linejoin="round"/>` +
          line(x + w * sx, y + (h - cutH) * sy, x + w * sx, y + h * sy, 'stroke-dasharray="8 8"') +
          line(x + (w - cutW) * sx, y + h * sy, x + w * sx, y + h * sy, 'stroke-dasharray="8 8"') +
          txt(480, 95, "Mor bölgenin alanı?", 35) +
          txt(480, 143, `${w} cm`, 27) +
          txt(x - 60, y + (h * scale) / 2, `${h} cm`, 29) +
          txt(x + (w - cutW / 2) * sx, y + (h - cutH) * sy - 25, `${cutW} cm`, 25) +
          txt(x + w * scale + 64, y + (h - cutH / 2) * sy, `${cutH} cm`, 25),
      );
      return result({
        family: "missing-corner",
        category: "Alan/Uzunluk",
        title: "Kesik köşe",
        question: "Mor alan kaç cm²?",
        answer,
        commonWrong: wrong,
        explanation: `Tam dikdörtgen ${w}×${h}=${wrong} cm². Kesilen ${cutW}×${cutH}=${cutW * cutH} cm². Fark ${answer} cm².`,
        cta: "Eksik parçayı çıkardın mı?",
        duel: `${wrong} cm² mi ${answer} cm² mi? Kim haklı?`,
        svg,
      });
    },
  },
  {
    id: "picture-frame",
    category: "Alan/Uzunluk",
    make: (r) => {
      const w = pick(r, [12, 14, 16]),
        h = pick(r, [10, 12, 14]),
        t = pick(r, [2, 3]);
      const answer = w * h - (w - 2 * t) * (h - 2 * t),
        wrong = w * h - (w - t) * (h - t);
      const scale = Math.min(520 / w, 390 / h),
        sw = w * scale,
        sh = h * scale,
        thick = t * scale,
        x = 480 - sw / 2,
        y = 165;
      const svg = card(
        `<path fill="#ffcfb8" fill-rule="evenodd" d="M ${x} ${y} h ${sw} v ${sh} h ${-sw} Z M ${x + thick} ${y + thick} v ${sh - 2 * thick} h ${sw - 2 * thick} v ${-sh + 2 * thick} Z" stroke="#25203d" stroke-width="4"/>` +
          txt(480, 105, "Çerçevenin alanı?", 35) +
          txt(480, y + sh + 35, `${w} cm`, 29) +
          txt(x - 60, y + sh / 2, `${h} cm`, 29) +
          txt(x + thick / 2, y + thick / 2, `${t} cm`, 20) +
          txt(480, 365, "BOŞ", 31, 'fill="#b7a9be"') +
          txt(480, 640, "Kalınlık her kenarda aynı", 22),
      );
      return result({
        family: "picture-frame",
        category: "Alan/Uzunluk",
        title: "Çerçeve alanı",
        question: "Turuncu çerçevenin alanı kaç cm²?",
        answer,
        commonWrong: wrong,
        explanation: `İç boşluğun iki yanından ${t} cm gider: (${w}−${2 * t})×(${h}−${2 * t}). Dış alan ${w * h} cm², fark ${answer} cm².`,
        cta: "Kalınlığı bir kez mi, iki kez mi çıkardın?",
        duel: `${answer} cm² mi, ${wrong} cm² mi? Kim haklı?`,
        svg,
      });
    },
  },
  {
    id: "notched-perimeter",
    category: "Alan/Uzunluk",
    make: (r) => {
      const w = pick(r, [11, 13, 15, 17]),
        h = pick(r, [8, 10, 12]),
        notchW = pick(r, [3, 4, 5]),
        notchH = pick(r, [2, 3, 4]);
      const answer = 2 * (w + h),
        wrong = answer - 2 * (notchW + notchH);
      const scale = Math.min(510 / w, 350 / h),
        x = 480 - (w * scale) / 2,
        y = 175,
        sx = scale,
        sy = scale;
      const svg = card(
        `<path d="M ${x} ${y} H ${x + w * sx} V ${y + (h - notchH) * sy} H ${x + (w - notchW) * sx} V ${y + h * sy} H ${x} Z" fill="#d9f4ee" stroke="#25203d" stroke-width="5" stroke-linejoin="round"/>` +
          line(
            x + w * sx,
            y + (h - notchH) * sy,
            x + w * sx,
            y + h * sy,
            'stroke-dasharray="8 8"',
          ) +
          line(
            x + (w - notchW) * sx,
            y + h * sy,
            x + w * sx,
            y + h * sy,
            'stroke-dasharray="8 8"',
          ) +
          txt(480, 95, "Bu şeklin çevresi?", 35) +
          txt(480, 145, `${w} cm`, 27) +
          txt(x - 60, y + (h * scale) / 2, `${h} cm`, 28) +
          txt(x + (w - notchW / 2) * sx, y + (h - notchH) * sy - 25, `${notchW} cm`, 25) +
          txt(x + w * scale + 64, y + (h - notchH / 2) * sy, `${notchH} cm`, 25) +
          txt(480, 635, "İç girintiyi de dolaş", 22),
      );
      return result({
        family: "notched-perimeter",
        category: "Alan/Uzunluk",
        title: "Girintinin çevresi",
        question: "Yeşil şeklin çevresi kaç cm?",
        answer,
        commonWrong: wrong,
        explanation: `Eksik kenarları önce tamamla: alt yatay ${w}−${notchW}, sağ dikey ${h}−${notchH}. Girintinin yatayı ${notchW}, dikeyi ${notchH} bunları tamamlar; çevre 2×(${w}+${h})=${answer} cm.`,
        cta: "Girinti çevreyi azaltıyor mu?",
        duel: `${answer} cm mi, ${wrong} cm mi? Kenarları tek tek topla.`,
        svg,
      });
    },
  },
];

export const PUZZLE_FAMILY_COUNT = templates.length;
export function generatePuzzle(
  category: PuzzleCategory | "Tümü",
  recentFamilies: string[] = [],
  random = Math.random,
): Puzzle {
  const eligible = templates.filter((t) => category === "Tümü" || t.category === category);
  // A family cannot reappear until every other family in the selected category has appeared.
  const available = eligible.filter((t) => !recentFamilies.includes(t.id));
  const pool = available.length ? available : eligible;
  return pool[Math.floor(random() * pool.length)].make(random);
}

export function puzzleFamilyIds(category: PuzzleCategory | "Tümü") {
  return templates.filter((t) => category === "Tümü" || t.category === category).map((t) => t.id);
}
