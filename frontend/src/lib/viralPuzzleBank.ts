import { COUNT_SCENES, countSceneSvg, countVisibleShapeGroups } from "./countPuzzleBank";
import { GEOMETRY_FAMILIES } from "./viralGeometryBank";
import { AREA_FAMILIES } from "./viralAreaBank";

export type ViralKind = "math" | "geometry" | "count" | "algebra" | "area" | "pattern";
export type ViralPuzzle = {
  family: string;
  kind: ViralKind;
  answer: string;
  commonWrong: string;
  diagram: string;
  steps: string[];
  answerKey?: "undetermined";
  countTarget?: "triangles" | "squares";
  areaTarget?: "area" | "perimeter" | "length";
  patternRows?: string[];
};
export type Family = {
  id: string;
  kind: ViralKind;
  make: (random: () => number) => Omit<ViralPuzzle, "family" | "kind">;
};
const choose = <T>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length)];
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = (x: number, y: number, s: string | number, size = 26, color = "#211638") =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" font-weight="700">${esc(String(s))}</text>`;
const rowDiagram = (...rows: string[]) =>
  rows
    .map(
      (s, i) =>
        `<rect x="28" y="${28 + i * 65}" width="304" height="53" rx="15" fill="${i % 2 ? "#fff0e9" : "#f1edff"}"/>${text(180, 54 + i * 65, s, s.length > 23 ? 18 : s.length > 17 ? 22 : 27)}`,
    )
    .join("");
const value = (
  answer: number | string,
  wrong: number | string,
  diagram: string,
  steps: string[],
  more: Partial<ViralPuzzle> = {},
) => ({ answer: String(answer), commonWrong: String(wrong), diagram, steps, ...more });

const math: Family[] = [
  {
    id: "left_associative_division",
    kind: "math",
    make: (r) => {
      const b = choose(r, [2, 3, 4]),
        c = choose(r, [2, 3, 4]),
        d = choose(r, [3, 5, 7]),
        a = b * c * choose(r, [2, 3, 4]);
      return value((a / b) * c + d, a / (b * c) + d, rowDiagram(`${a} ÷ ${b} × ${c} + ${d} = ?`), [
        `${a}÷${b}=${a / b}`,
        `${a / b}×${c}+${d}=${(a / b) * c + d}`,
      ]);
    },
  },
  {
    id: "outside_negative_square",
    kind: "math",
    make: (r) => {
      const a = choose(r, [3, 4, 5]),
        b = choose(r, [4, 5, 6]),
        c = choose(r, [2, 3, 4]);
      return value(-a * a + b * c, a * a + b * c, rowDiagram(`−${a}² + ${b} × ${c} = ?`), [
        `−${a}²=−${a * a}`,
        `${b}×${c}−${a * a}=${b * c - a * a}`,
      ]);
    },
  },
  {
    id: "nested_brackets",
    kind: "math",
    make: (r) => {
      const a = choose(r, [5, 7, 9]),
        b = choose(r, [3, 4]),
        c = choose(r, [2, 3]),
        d = choose(r, [4, 5]);
      return value(
        (a + b * c) * d,
        (a + b) * c * d,
        rowDiagram(`(${a} + ${b} × ${c}) × ${d} = ?`),
        [`${b}×${c}=${b * c}`, `(${a}+${b * c})×${d}=${(a + b * c) * d}`],
      );
    },
  },
  {
    id: "power_vs_group",
    kind: "math",
    make: (r) => {
      const a = choose(r, [2, 3, 4]),
        b = choose(r, [3, 4, 5]),
        c = choose(r, [2, 3, 4]);
      return value(a + b * b * c, (a + b) * (a + b) * c, rowDiagram(`${a} + ${b}² × ${c} = ?`), [
        `${b}²=${b * b}`,
        `${a}+${b * b}×${c}=${a + b * b * c}`,
      ]);
    },
  },
  {
    id: "fraction_of_remaining",
    kind: "math",
    make: (r) => {
      const b = choose(r, [3, 4, 5]),
        a = b * choose(r, [6, 8, 10]),
        c = choose(r, [2, 3]),
        d = choose(r, [4, 6]);
      return value(
        a - (a / b) * c + d,
        (a - a / b) * (c + d),
        rowDiagram(`${a} − (${a} ÷ ${b}) × ${c} + ${d} = ?`),
        [`${a}÷${b}=${a / b}`, `${a}−${(a / b) * c}+${d}=${a - (a / b) * c + d}`],
      );
    },
  },
  {
    id: "absolute_value_after_product",
    kind: "math",
    make: (r) => {
      const a = choose(r, [5, 7, 9]),
        b = choose(r, [4, 5]),
        c = choose(r, [3, 4]),
        d = choose(r, [2, 3]);
      const z = Math.abs(a - b * c) + d * d;
      return value(z, Math.abs(a - b) * c + d * d, rowDiagram(`|${a} − ${b} × ${c}| + ${d}² = ?`), [
        `${b}×${c}=${b * c}`,
        `|${a - b * c}|+${d * d}=${z}`,
      ]);
    },
  },
  {
    id: "factorial_then_divide",
    kind: "math",
    make: (r) => {
      const n = choose(r, [4, 5]),
        f = n === 4 ? 24 : 120,
        d = choose(r, [2, 3, 4]),
        a = choose(r, [3, 5, 7]);
      return value(f / d + a, f / (d + a), rowDiagram(`${n}! ÷ ${d} + ${a} = ?`), [
        `${n}!=${f}`,
        `${f}÷${d}+${a}=${f / d + a}`,
      ]);
    },
  },
  {
    id: "percent_after_brackets",
    kind: "math",
    make: (r) => {
      const p = choose(r, [20, 25, 50]),
        b = choose(r, [40, 60, 80]),
        c = choose(r, [20, 40]),
        d = choose(r, [5, 10]);
      const ans = ((b + c) * p) / 100 - d;
      return value(ans, (b * p) / 100 + c - d, rowDiagram(`${p}% × (${b} + ${c}) − ${d} = ?`), [
        `${b}+${c}=${b + c}`,
        `${p}%×${b + c}−${d}=${ans}`,
      ]);
    },
  },
];

const algebra: Family[] = [
  {
    id: "symbol_balance",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [4, 6, 8]),
        b = choose(r, [2, 3, 5]);
      return value(
        a + 2 * b,
        a + b,
        rowDiagram(`◆ + ● = ${a + b}`, `2◆ + ● = ${2 * a + b}`, `◆ + 2● = ?`),
        [`◆=${a}`, `●=${b}`, `◆+2●=${a + 2 * b}`],
      );
    },
  },
  {
    id: "square_sum_identity",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [3, 5, 7]),
        b = choose(r, [2, 4, 6]),
        s = a + b,
        p = a * b;
      return value(a * a + b * b, s * s, rowDiagram(`a + b = ${s}`, `ab = ${p}`, `a² + b² = ?`), [
        `(a+b)²−2ab`,
        `(${s})²−2×${p}=${a * a + b * b}`,
      ]);
    },
  },
  {
    id: "cube_sum_identity",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [2, 3, 4]),
        b = choose(r, [3, 4, 5]),
        s = a + b,
        p = a * b;
      return value(
        a ** 3 + b ** 3,
        s ** 3,
        rowDiagram(`a + b = ${s}`, `ab = ${p}`, `a³ + b³ = ?`),
        [`(a+b)³−3ab(a+b)`, `${s}³−3×${p}×${s}=${a ** 3 + b ** 3}`],
      );
    },
  },
  {
    id: "sum_difference_product",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [9, 11, 13]),
        b = choose(r, [2, 4, 6]);
      return value(
        a * b,
        (a + b) * (a - b),
        rowDiagram(`a + b = ${a + b}`, `a − b = ${a - b}`, `ab = ?`),
        [`a=(${a + b}+${a - b})÷2=${a}`, `b=${b}; ab=${a * b}`],
      );
    },
  },
  {
    id: "three_icon_chain",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [3, 5, 7]),
        b = choose(r, [2, 4]),
        c = choose(r, [1, 3]);
      return value(
        a + 2 * c,
        a + c,
        rowDiagram(
          `2★ + ◆ = ${2 * a + b}`,
          `◆ + 2● = ${b + 2 * c}`,
          `★ + ◆ = ${a + b}`,
          `★ + 2● = ?`,
        ),
        [`★=${a}; ◆=${b}; ●=${c}`, `★+2●=${a + 2 * c}`],
      );
    },
  },
  {
    id: "missing_information",
    kind: "algebra",
    make: (r) => {
      const s = choose(r, [9, 11, 13, 15]),
        p = choose(r, [3, 5, 7]);
      return value(
        "?",
        s - p,
        rowDiagram(`a + b = ${s}`, `a − c = ${p}`, `b − c = ?`),
        [`b=${s}−a; c=a−${p}`, `b−c=${s + p}−2a`],
        { answerKey: "undetermined" },
      );
    },
  },
  {
    id: "difference_of_squares",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [8, 10, 12]),
        b = choose(r, [2, 4, 6]),
        d = a - b,
        s = a + b;
      return value(
        s,
        a * a - b * b,
        rowDiagram(`a − b = ${d}`, `a² − b² = ${a * a - b * b}`, `a + b = ?`),
        [`a²−b²=(a−b)(a+b)`, `${a * a - b * b}÷${d}=${s}`],
      );
    },
  },
  {
    id: "symbol_product_switch",
    kind: "algebra",
    make: (r) => {
      const a = choose(r, [2, 3, 4]),
        b = choose(r, [3, 5, 7]);
      return value(
        a * a + b,
        a + b,
        rowDiagram(`▲ × ▲ = ${a * a}`, `▲ + ● = ${a + b}`, `▲ × ▲ + ● = ?`),
        [`▲=${a}; ●=${b}`, `${a * a}+${b}=${a * a + b}`],
      );
    },
  },
];


const pattern: Family[] = [
  {
    id: "pattern_double_plus_one",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [1, 2, 3]);
      const rows = [start];
      for (let i = 0; i < 5; i += 1) rows.push(rows[rows.length - 1] * 2 + 1);
      const shown = rows.slice(0, 5).map(String);
      return value(rows[5], rows[4] * 2, rowDiagram(...shown, "?"), [
        `Her adımda sayı 2 ile çarpılıp 1 ekleniyor`,
        `${rows[4]}×2+1=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_squares",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [1, 2, 3]);
      const rows = Array.from({ length: 6 }, (_, i) => (start + i) ** 2);
      const shown = rows.slice(0, 5).map(String);
      return value(rows[5], rows[4] + (start + 5), rowDiagram(...shown, "?"), [
        `Terimler ardışık sayıların kareleri`,
        `${start + 5}²=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_triangular",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [1, 2, 3]);
      const rows = [start];
      let gap = start + 1;
      for (let i = 0; i < 5; i += 1) { rows.push(rows[rows.length - 1] + gap); gap += 1; }
      const shown = rows.slice(0, 5).map(String);
      return value(rows[5], rows[4] + gap, rowDiagram(...shown, "?"), [
        `Farklar her adımda 1 artıyor`,
        `${rows[4]}+${start + 5}=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_n_nplus1",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [1, 2, 3]);
      const rows = Array.from({ length: 6 }, (_, i) => {
        const n = start + i;
        return n * (n + 1);
      });
      const shown = rows.slice(0, 5).map(String);
      const n = start + 5;
      return value(rows[5], n * n, rowDiagram(...shown, "?"), [
        `Her terim n×(n+1) biçiminde ilerliyor`,
        `${n}×${n + 1}=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_doubling",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [2, 3, 5, 7]);
      const rows = Array.from({ length: 6 }, (_, i) => start * (2 ** i));
      const shown = rows.slice(0, 5).map(String);
      return value(rows[5], rows[4] + start, rowDiagram(...shown, "?"), [
        `Her terim bir öncekinin 2 katı`,
        `${rows[4]}×2=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_increasing_gap",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [2, 4, 6]);
      const firstGap = choose(r, [2, 3]);
      const rows = [start];
      let gap = firstGap;
      for (let i = 0; i < 5; i += 1) { rows.push(rows[rows.length - 1] + gap); gap += 2; }
      const shown = rows.slice(0, 5).map(String);
      const nextGap = firstGap + 8;
      return value(rows[5], rows[4] + nextGap + 2, rowDiagram(...shown, "?"), [
        `Artış miktarı her adımda 2 büyüyor`,
        `${rows[4]}+${nextGap}=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_cubes",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [1, 2]);
      const rows = Array.from({ length: 5 }, (_, i) => (start + i) ** 3);
      const shown = rows.slice(0, 4).map(String);
      const n = start + 4;
      return value(rows[4], n * n, rowDiagram(...shown, "?"), [
        `Terimler ardışık sayıların küpleri`,
        `${n}³=${rows[4]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_fibonacci",
    kind: "pattern",
    make: (r) => {
      const a = choose(r, [1, 2, 3]);
      const b = choose(r, [1, 2, 3]);
      const rows = [a, b];
      while (rows.length < 7) rows.push(rows[rows.length - 1] + rows[rows.length - 2]);
      const shown = rows.slice(0, 6).map(String);
      return value(rows[6], rows[5] * 2, rowDiagram(...shown.slice(0,5), "?"), [
        `Her terim önceki iki terimin toplamı`,
        `${rows[4]}+${rows[5]}=${rows[6]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_alternating",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [2, 3, 4]);
      const rows = [start];
      for (let i = 0; i < 6; i += 1) {
        rows.push(i % 2 === 0 ? rows[rows.length - 1] * 2 : rows[rows.length - 1] + 3);
      }
      const shown = rows.slice(0, 6).map(String);
      return value(rows[6], rows[5] + 4, rowDiagram(...shown.slice(0,5), "?"), [
        `Kural sırayla ×2 ve +3 olarak tekrar ediyor`,
        `${rows[5]}×2=${rows[6]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
  {
    id: "pattern_descending_gap",
    kind: "pattern",
    make: (r) => {
      const start = choose(r, [48, 54, 60]);
      const rows = [start];
      let gap = 7;
      for (let i = 0; i < 5; i += 1) { rows.push(rows[rows.length - 1] - gap); gap -= 1; }
      const shown = rows.slice(0, 5).map(String);
      return value(rows[5], rows[4] - 4, rowDiagram(...shown, "?"), [
        `Çıkarılan sayı 7, 6, 5, 4, 3 diye azalıyor`,
        `${rows[4]}−3=${rows[5]}`,
      ], { patternRows: [...shown, "?"] });
    },
  },
];

const count: Family[] = COUNT_SCENES.map((scene) => ({
  id: scene.id,
  kind: "count" as const,
  make: (r) => {
    const groups = countVisibleShapeGroups(scene),
      answer = groups.reduce((sum, n) => sum + n, 0);
    const flipX = choose(r, [false, true]),
      flipY = choose(r, [false, true]);
    const diagram = `<g transform="translate(${flipX ? 360 : 0} ${flipY ? 270 : 0}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1})">${countSceneSvg(scene)}</g>`;
    return value(
      answer,
      Math.max(1, answer - 1),
      diagram,
      [`∑ (${groups.join(" + ")}) = ${answer}`],
      { countTarget: scene.target },
    );
  },
}));

export const VIRAL_FAMILIES: Family[] = [
  ...math,
  ...GEOMETRY_FAMILIES,
  ...count,
  ...algebra,
  ...pattern,
  ...AREA_FAMILIES,
];
export function makeViralPuzzle(
  kind: ViralKind,
  recent: readonly string[] = [],
  random = Math.random,
): ViralPuzzle {
  const all = VIRAL_FAMILIES.filter((f) => f.kind === kind);
  const remaining = all.filter((f) => !recent.includes(f.id));
  const picked = choose(random, remaining.length ? remaining : all);
  const puzzle: ViralPuzzle = { family: picked.id, kind, ...picked.make(random) };
  if (!puzzle.diagram || puzzle.answer === puzzle.commonWrong || !puzzle.steps.length)
    throw new Error(`Invalid family: ${picked.id}`);
  return puzzle;
}
