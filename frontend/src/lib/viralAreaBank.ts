import type { Family, ViralPuzzle } from "./viralPuzzleBank";

const pick = <T>(r: () => number, values: readonly T[]): T => values[Math.floor(r() * values.length)];
const label = (x: number, y: number, value: string | number, size = 18, color = "#211638") =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" font-weight="700">${value}</text>`;
const path = (d: string, fill = "#ded5ff") =>
  `<path d="${d}" fill="${fill}" stroke="#211638" stroke-width="3.5" stroke-linejoin="round"/>`;
const rect = (x: number, y: number, w: number, h: number, fill = "#ded5ff") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#211638" stroke-width="3.5"/>`;
const line = (x1: number, y1: number, x2: number, y2: number, dash = false) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7c3aed" stroke-width="2" ${dash ? 'stroke-dasharray="5 5"' : ""}/>`;
const result = (
  answer: number,
  wrong: number,
  diagram: string,
  steps: string[],
  areaTarget: NonNullable<ViralPuzzle["areaTarget"]>,
) => ({ answer: String(answer), commonWrong: String(wrong), diagram, steps, areaTarget });

export const AREA_FAMILIES: Family[] = [
  {
    id: "corner_cut", kind: "area", make: (r) => {
      const w = pick(r, [12, 14, 16]), h = pick(r, [10, 12]),
        a = pick(r, [2, 3]), b = pick(r, [3, 4]);
      const s = Math.min(230 / w, 170 / h), x = 65, y = 40;
      const d = `M${x} ${y}H${x + (w - a) * s}V${y + a * s}H${x + w * s}V${y + h * s}H${x + b * s}V${y + (h - b) * s}H${x}Z`;
      const diagram = path(d)
        + line(x, y - 16, x + w * s, y - 16, true) + label(x + w * s / 2, y - 28, w)
        + line(x - 17, y, x - 17, y + h * s, true) + label(x - 31, y + h * s / 2, h)
        + label(x + (w - a / 2) * s, y + a * s / 2, `${a}×${a}`, 12)
        + label(x + b * s / 2, y + (h - b / 2) * s, `${b}×${b}`, 12);
      return result(w * h - a * a - b * b, w * h - a * a, diagram,
        [`${w}×${h}=${w * h}`, `${w * h}−${a}²−${b}²=${w * h - a * a - b * b}`], "area");
    },
  },
  {
    id: "uniform_frame", kind: "area", make: (r) => {
      const w = pick(r, [14, 16, 18]), h = pick(r, [10, 12]),
        side = pick(r, [2, 3]), top = pick(r, [1, 2]);
      const s = Math.min(235 / w, 165 / h), x = 180 - w * s / 2, y = 40;
      const diagram = rect(x, y, w * s, h * s)
        + rect(x + side * s, y + top * s, (w - 2 * side) * s, (h - 2 * top) * s, "#fff")
        + label(180, 25, w) + label(x - 20, y + h * s / 2, h)
        + label(x + side * s / 2, y + h * s / 2, side, 15)
        + label(x + (w - side / 2) * s, y + h * s / 2, side, 15)
        + label(180, y + top * s / 2, top, 15)
        + label(180, y + (h - top / 2) * s, top, 15);
      const inner = (w - 2 * side) * (h - 2 * top);
      return result(w * h - inner, w * h - (w - side) * (h - top), diagram,
        [`(${w}−2×${side})×(${h}−2×${top})=${inner}`, `${w}×${h}−${inner}=${w * h - inner}`], "area");
    },
  },
  {
    id: "overlap_union", kind: "area", make: (r) => {
      const a = pick(r, [7, 8, 9]), b = pick(r, [5, 6]), overlap = pick(r, [2, 3]);
      const s = Math.min(215 / (a + b - overlap), 185 / (a + b - overlap));
      const x = 180 - (a + b - overlap) * s / 2, y = 28;
      const bx = x + (a - overlap) * s, by = y + (a - overlap) * s;
      const diagram = rect(x, y, a * s, a * s, "#ded5ff")
        + rect(bx, by, b * s, b * s, "#ffcfbb")
        + `<rect x="${bx}" y="${by}" width="${overlap * s}" height="${overlap * s}" fill="#a8e8d9" stroke="#211638" stroke-width="2" stroke-dasharray="5 4"/>`
        + label(x + a * s / 2, y + 19, `${a} × ${a}`, 16)
        + label(bx + b * s / 2, by + b * s - 17, `${b} × ${b}`, 16)
        + label(bx + overlap * s / 2, by + overlap * s / 2, `${overlap} × ${overlap}`, 12);
      return result(a * a + b * b - overlap * overlap, a * a + b * b, diagram,
        [`${a}²+${b}²=${a * a + b * b}`, `${a * a + b * b}−${overlap}²=${a * a + b * b - overlap * overlap}`], "area");
    },
  },
  {
    id: "triangle_missing", kind: "area", make: (r) => {
      const w = pick(r, [12, 14, 16]), h = pick(r, [8, 10]),
        cut = pick(r, [4, 6]), square = pick(r, [2, 3]);
      const s = Math.min(230 / w, 165 / h), x = 180 - w * s / 2, y = 36;
      const diagram = path(`M${x} ${y}H${x + (w - cut) * s}L${x + w * s} ${y + h * s}H${x + square * s}V${y + (h - square) * s}H${x}Z`)
        + line(x, y - 21, x + w * s, y - 21, true) + label(180, y - 30, w)
        + line(x - 16, y, x - 16, y + h * s, true) + label(x - 30, y + h * s / 2, h)
        + line(x + (w - cut) * s, y, x + w * s, y, true)
        + label(x + (w - cut / 2) * s, y + 13, cut, 15)
        + label(x + square * s / 2, y + (h - square / 2) * s, `${square}×${square}`, 13);
      const answer = w * h - cut * h / 2 - square * square;
      return result(answer, w * h - cut * h / 2, diagram,
        [`${w}×${h}−(${cut}×${h})÷2=${w * h - cut * h / 2}`, `${w * h - cut * h / 2}−${square}²=${answer}`], "area");
    },
  },
  {
    id: "t_union", kind: "area", make: (r) => {
      const w = pick(r, [12, 14, 16]), h = pick(r, [10, 12]),
        bar = pick(r, [2, 3]), stem = pick(r, [3, 4]);
      const s = Math.min(235 / w, 180 / h), x = 180 - w * s / 2, y = 32;
      const vx = 180 - stem * s / 2;
      const diagram = rect(x, y + (h - bar) * s / 2, w * s, bar * s)
        + rect(vx, y, stem * s, h * s, "#c2f3e8")
        + `<rect x="${vx}" y="${y + (h - bar) * s / 2}" width="${stem * s}" height="${bar * s}" fill="#9575db"/>`
        + label(180, y - 13, stem) + label(x - 15, y + h * s / 2, bar)
        + line(x + w * s + 10, y, x + w * s + 10, y + h * s)
        + label(x + w * s + 24, y + h * s / 2, h, 16)
        + line(x, y + h * s + 12, x + w * s, y + h * s + 12)
        + label(180, y + h * s + 27, w, 16);
      const answer = w * bar + h * stem - bar * stem;
      return result(answer, w * bar + h * stem, diagram,
        [`${w}×${bar}+${h}×${stem}=${w * bar + h * stem}`, `${w * bar + h * stem}−${bar}×${stem}=${answer}`], "area");
    },
  },
  {
    id: "staircase_perimeter", kind: "area", make: (r) => {
      const w = pick(r, [12, 14, 16]), h = pick(r, [8, 10]),
        cutW = pick(r, [3, 4]), cutH = pick(r, [2, 3]);
      const s = Math.min(230 / w, 180 / h), x = 60, y = 35;
      const diagram = path(`M${x} ${y}H${x + w * s}V${y + (h - cutH) * s}H${x + (w - cutW) * s}V${y + h * s}H${x}Z`, "#d8f4ef")
        + label(x + w * s / 2, 22, w) + label(x - 22, y + h * s / 2, h);
      return result(2 * (w + h), 2 * (w + h) - 2 * (cutW + cutH), diagram,
        [`${w}−${cutW}+${cutW}=${w}`, `${h}−${cutH}+${cutH}=${h}`, `P=2×(${w}+${h})=${2 * (w + h)}`], "perimeter");
    },
  },
  {
    id: "pythagoras_extension", kind: "area", make: (r) => {
      const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17]] as const);
      const extension = pick(r, [2, 4, 6]), s = Math.min(175 / a, 175 / b);
      const x = 55, y = 220, end = x + b * s, top = y - a * s;
      const diagram = line(x, top, x, y) + line(x, y, end + 48, y)
        + line(x, top, end, y) + `<path d="M${x + 13} ${y}v-13h-13" fill="none" stroke="#7c3aed" stroke-width="3"/>`
        + `<path d="M${x} ${top}L${end} ${y}h48" fill="none" stroke="#e0524d" stroke-width="5"/>`
        + label(x - 20, (top + y) / 2, a) + label((x + end) / 2, y + 22, b)
        + label(end + 24, y + 22, extension) + label((x + end) / 2 + 20, (top + y) / 2 - 20, "x = ?", 23, "#e0524d");
      return result(c + extension, a + b + extension, diagram,
        [`√(${a}²+${b}²)=${c}`, `${c}+${extension}=${c + extension}`], "length");
    },
  },
  {
    id: "diagonal_remainder", kind: "area", make: (r) => {
      const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17]] as const),
        known = pick(r, [1, 2, 3]);
      const s = Math.min(210 / b, 165 / a), x = 180 - b * s / 2, y = 220;
      const diagram = rect(x, y - a * s, b * s, a * s, "#fff")
        + `<path d="M${x} ${y}L${x + b * s} ${y - a * s}" fill="none" stroke="#e0524d" stroke-width="5"/>`
        + label(x - 20, y - a * s / 2, a) + label(180, y + 20, b)
        + label(180, y - a * s / 2 - 12, `x + ${known}`, 21, "#e0524d");
      return result(c - known, c + known, diagram,
        [`√(${a}²+${b}²)=${c}`, `x=${c}−${known}=${c - known}`], "length");
    },
  },
  {
    id: "corridor_difference", kind: "area", make: (r) => {
      const w = pick(r, [12, 14, 16]), h = pick(r, [8, 10]),
        left = pick(r, [2, 3]), top = pick(r, [2, 3]);
      const s = Math.min(230 / w, 170 / h), x = 180 - w * s / 2, y = 36;
      const diagram = rect(x, y, w * s, h * s, "#c9eee8")
        + rect(x + left * s, y + top * s, (w - left) * s, (h - top) * s, "#fff")
        + label(180, 22, w) + label(x - 19, y + h * s / 2, h)
        + label(x + left * s / 2, y + h * s / 2, left, 15)
        + label(180, y + top * s / 2, top, 15);
      const answer = w * h - (w - left) * (h - top);
      return result(answer, w * h - (w - left) * h, diagram,
        [`(${w}−${left})×(${h}−${top})=${(w - left) * (h - top)}`, `${w}×${h}−${(w - left) * (h - top)}=${answer}`], "area");
    },
  },
  {
    id: "trapezoid_split", kind: "area", make: (r) => {
      const short = pick(r, [6, 8]), extra = pick(r, [4, 6]), h = pick(r, [6, 8]);
      const s = Math.min(225 / (short + extra), 170 / h), x = 65, y = 35;
      const diagram = path(`M${x} ${y}H${x + short * s}L${x + (short + extra) * s} ${y + h * s}H${x}Z`, "#d8f4ef")
        + line(x + short * s, y, x + short * s, y + h * s, true)
        + label(x + short * s / 2, 22, short) + label(x + (short + extra / 2) * s, y + h * s + 17, extra)
        + label(x - 21, y + h * s / 2, h);
      const answer = short * h + extra * h / 2;
      return result(answer, (short + extra) * h, diagram,
        [`${short}×${h}=${short * h}`, `${short * h}+(${extra}×${h})÷2=${answer}`], "area");
    },
  },
];
