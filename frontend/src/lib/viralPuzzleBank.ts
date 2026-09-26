import { COUNT_SCENES, countSceneSvg, countVisibleShapeGroups } from "./countPuzzleBank";
import { GEOMETRY_FAMILIES } from "./viralGeometryBank";

export type ViralKind = "math" | "geometry" | "count" | "algebra" | "area";
export type ViralPuzzle = {
  family: string;
  kind: ViralKind;
  answer: string;
  commonWrong: string;
  diagram: string;
  steps: string[];
  answerKey?: "undetermined";
  countTarget?: "triangles" | "squares";
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
const svgPath = (d: string, fill = "#ddd3ff") =>
  `<path d="${d}" fill="${fill}" stroke="#211638" stroke-width="4" stroke-linejoin="round"/>`;
const rect = (x: number, y: number, w: number, h: number, fill = "#ddd3ff") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#211638" stroke-width="3"/>`;
const line = (x1: number, y1: number, x2: number, y2: number, color = "#211638") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3"/>`;
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

const area: Family[] = [
  {
    id: "corner_cut",
    kind: "area",
    make: (r) => {
      const w = choose(r, [10, 12, 14]),
        h = choose(r, [8, 10]),
        cw = choose(r, [3, 4]),
        ch = choose(r, [2, 3]);
      const sx = Math.min(245 / w, 190 / h),
        sy = sx,
        x = 55,
        y = 35;
      const diagram =
        svgPath(
          `M${x} ${y}H${x + w * sx}V${y + (h - ch) * sy}H${x + (w - cw) * sx}V${y + h * sy}H${x}Z`,
        ) +
        text(180, 20, `${w}`) +
        text(30, 135, `${h}`) +
        text(x + (w - cw / 2) * sx, y + (h - ch) * sy - 13, `${cw}`, 18) +
        text(320, y + (h - ch / 2) * sy, `${ch}`, 18);
      return value(w * h - cw * ch, w * h, diagram, [
        `${w}×${h}−${cw}×${ch}`,
        `${w * h}−${cw * ch}=${w * h - cw * ch}`,
      ]);
    },
  },
  {
    id: "uniform_frame",
    kind: "area",
    make: (r) => {
      const w = choose(r, [12, 14, 16]),
        h = choose(r, [10, 12]),
        t = choose(r, [2, 3]),
        s = Math.min(240 / w, 175 / h),
        x = 180 - (w * s) / 2,
        y = 35;
      const diagram =
        rect(x, y, w * s, h * s) +
        rect(x + t * s, y + t * s, (w - 2 * t) * s, (h - 2 * t) * s, "#fff") +
        text(180, 245, `${w} × ${h}; t=${t}`, 19);
      return value(w * h - (w - 2 * t) * (h - 2 * t), w * h - (w - t) * (h - t), diagram, [
        `${w}×${h}−(${w - 2 * t})×(${h - 2 * t})`,
        `${w * h}−${(w - 2 * t) * (h - 2 * t)}`,
      ]);
    },
  },
  {
    id: "overlap_union",
    kind: "area",
    make: (r) => {
      const a = choose(r, [6, 8, 10]),
        b = choose(r, [4, 5]),
        o = choose(r, [2, 3]),
        s = 16,
        x = 45 + (a - o) * s,
        y = 35 + (a - o) * s;
      const diagram =
        rect(45, 35, a * s, a * s, "#d8cbff") +
        rect(x, y, b * s, b * s, "#ffc9b4") +
        text(45 + (a * s) / 2, 55, `${a} × ${a}`, 16) +
        text(x + (b * s) / 2, y + (b * s) / 2, `${b} × ${b}`, 16) +
        text(180, 244, `∩: ${o} × ${o}`, 17);
      return value(a * a + b * b - o * o, a * a + b * b, diagram, [
        `${a}²+${b}²−${o}²`,
        `${a * a}+${b * b}−${o * o}=${a * a + b * b - o * o}`,
      ]);
    },
  },
  {
    id: "triangle_missing",
    kind: "area",
    make: (r) => {
      const w = choose(r, [10, 12, 14]),
        h = choose(r, [8, 10]),
        base = choose(r, [4, 6]);
      const scale = Math.min(250 / w, 185 / h),
        width = w * scale,
        height = h * scale,
        left = 180 - width / 2,
        bottom = 35 + height;
      const diagram =
        rect(left, 35, width, height) +
        svgPath(`M${left + width - base * scale} ${bottom}H${left + width}V35Z`, "#fff") +
        text(180, 247, `${w} × ${h}; △ ${base} × ${h}`, 17);
      return value(w * h - (base * h) / 2, w * h - base * h, diagram, [
        `${w}×${h}−(${base}×${h})÷2`,
        `${w * h}−${(base * h) / 2}`,
      ]);
    },
  },
  {
    id: "t_union",
    kind: "area",
    make: (r) => {
      const top = choose(r, [10, 12, 14]),
        bar = choose(r, [2, 3]),
        stem = choose(r, [3, 4]),
        down = choose(r, [6, 8]);
      const s = 16,
        x = 180 - (top * s) / 2;
      const diagram =
        rect(x, 35, top * s, bar * s) +
        rect(180 - (stem * s) / 2, 35 + bar * s, stem * s, down * s) +
        text(180, 23, `${top}`, 18) +
        text(x - 20, 55, `${bar}`, 18) +
        text(180, 255, `${stem} × ${down}`, 17);
      return value(top * bar + stem * down, top * (bar + down), diagram, [
        `${top}×${bar}+${stem}×${down}`,
        `${top * bar}+${stem * down}`,
      ]);
    },
  },
  {
    id: "staircase_perimeter",
    kind: "area",
    make: (r) => {
      const w = choose(r, [10, 12, 14]),
        h = choose(r, [8, 10]),
        cw = choose(r, [3, 4]),
        ch = choose(r, [2, 3]);
      const s = Math.min(230 / w, 175 / h),
        x = 55,
        y = 35;
      const diagram =
        svgPath(
          `M${x} ${y}H${x + w * s}V${y + (h - ch) * s}H${x + (w - cw) * s}V${y + h * s}H${x}Z`,
          "#d8f4ef",
        ) +
        text(180, 22, `${w}`, 18) +
        text(38, 130, `${h}`, 18) +
        text(180, 245, `P = ?`, 26);
      return value(2 * (w + h), 2 * (w + h) - 2 * (cw + ch), diagram, [
        `${w - cw}+${cw}=${w}`,
        `${h - ch}+${ch}=${h}`,
        `P=2(${w}+${h})=${2 * (w + h)}`,
      ]);
    },
  },
  {
    id: "pythagoras_extension",
    kind: "area",
    make: (r) => {
      const [a, b, c] = choose(r, [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
        ] as const),
        e = choose(r, [2, 4, 6]),
        s = Math.min(185 / a, 190 / b),
        w = b * s,
        h = a * s,
        x = 60,
        y = 230;
      const diagram =
        line(x, y, x, y - h) +
        line(x, y, x + w, y) +
        line(x, y - h, x + w, y) +
        line(x + w, y, x + w + 47, y) +
        `<path d="M${x + 13} ${y}v-13h-13" fill="none" stroke="#7c3aed" stroke-width="3"/>` +
        text(x - 20, y - h / 2, `${a}`, 20) +
        text(x + w / 2, y + 21, `${b}`, 20) +
        text(x + w + 25, y + 21, `${e}`, 20) +
        text(180, 25, "x = ?", 27, "#e0524d") +
        line(x, y - h, x + w, y, "#e0524d") +
        line(x + w, y, x + w + 47, y, "#e0524d");
      return value(c + e, a + b + e, diagram, [`√(${a}²+${b}²)=${c}`, `${c}+${e}=${c + e}`]);
    },
  },
  {
    id: "diagonal_remainder",
    kind: "area",
    make: (r) => {
      const [a, b, c] = choose(r, [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
        ] as const),
        k = choose(r, [1, 2, 3]),
        s = Math.min(210 / b, 170 / a),
        w = b * s,
        h = a * s,
        x = 180 - w / 2,
        y = 215;
      const diagram =
        rect(x, y - h, w, h, "none") +
        line(x, y, x + w, y - h) +
        text(x - 24, y - h / 2, `${a}`, 20) +
        text(180, 238, `${b}`, 20) +
        text(180, y - h / 2, `x + ${k}`, 23);
      return value(c - k, c + k, diagram, [`√(${a}²+${b}²)=${c}`, `x=${c}−${k}=${c - k}`]);
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
  ...area,
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
