export type Segment = readonly [number, number, number, number];
type Point = { x: number; y: number };
export type CountScene = { id: string; target: "triangles" | "squares"; segments: Segment[] };
const EPS = 1e-7;
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const point = (s: Segment, end: 0 | 1): Point => ({ x: s[end * 2], y: s[end * 2 + 1] });
const key = (p: Point) => `${Math.round(p.x * 1e6)},${Math.round(p.y * 1e6)}`;

function intersections(a: Segment, b: Segment): Point[] {
  const p = point(a, 0),
    q = point(b, 0),
    r = sub(point(a, 1), p),
    s = sub(point(b, 1), q);
  const det = cross(r, s);
  if (Math.abs(det) < EPS) return [];
  const t = cross(sub(q, p), s) / det,
    u = cross(sub(q, p), r) / det;
  return t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS
    ? [{ x: p.x + t * r.x, y: p.y + t * r.y }]
    : [];
}

function pointsIn(segments: Segment[]): Point[] {
  const found = new Map<string, Point>();
  for (const s of segments)
    for (const end of [0, 1] as const) {
      const p = point(s, end);
      found.set(key(p), p);
    }
  for (let i = 0; i < segments.length; i++)
    for (let j = i + 1; j < segments.length; j++)
      for (const p of intersections(segments[i], segments[j])) found.set(key(p), p);
  return [...found.values()];
}

// A visible side may cross several collinear segments. Merge intervals on its supporting line.
function connected(a: Point, b: Point, segments: Segment[]): boolean {
  const d = sub(b, a),
    size = d.x * d.x + d.y * d.y;
  if (size < EPS) return false;
  const intervals: Array<[number, number]> = [];
  for (const s of segments) {
    const p = point(s, 0),
      q = point(s, 1);
    if (Math.abs(cross(d, sub(p, a))) > EPS || Math.abs(cross(d, sub(q, a))) > EPS) continue;
    const t = ((p.x - a.x) * d.x + (p.y - a.y) * d.y) / size;
    const u = ((q.x - a.x) * d.x + (q.y - a.y) * d.y) / size;
    intervals.push([Math.max(0, Math.min(t, u)), Math.min(1, Math.max(t, u))]);
  }
  intervals.sort((x, y) => x[0] - y[0]);
  let covered = 0;
  for (const [start, end] of intervals) {
    if (start > covered + EPS) break;
    covered = Math.max(covered, end);
  }
  return covered >= 1 - EPS;
}

export function countVisibleShapeGroups(scene: CountScene): number[] {
  const pts = pointsIn(scene.segments),
    edges = new Set<string>();
  const pair = (i: number, j: number) => `${Math.min(i, j)}:${Math.max(i, j)}`;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++)
      if (connected(pts[i], pts[j], scene.segments)) edges.add(pair(i, j));
  const areas: number[] = [];
  if (scene.target === "triangles") {
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        for (let k = j + 1; k < pts.length; k++) {
          const twiceArea = Math.abs(cross(sub(pts[j], pts[i]), sub(pts[k], pts[i])));
          if (twiceArea < EPS) continue;
          if (edges.has(pair(i, j)) && edges.has(pair(j, k)) && edges.has(pair(i, k)))
            areas.push(twiceArea / 2);
        }
  } else {
    const seen = new Set<string>();
    for (let i = 0; i < pts.length; i++)
      for (let j = 0; j < pts.length; j++)
        if (i !== j && edges.has(pair(i, j))) {
          const d = sub(pts[j], pts[i]),
            kPoint = { x: pts[j].x - d.y, y: pts[j].y + d.x };
          const lPoint = { x: pts[i].x - d.y, y: pts[i].y + d.x };
          const k = pts.findIndex((p) => key(p) === key(kPoint)),
            l = pts.findIndex((p) => key(p) === key(lPoint));
          if (
            k < 0 ||
            l < 0 ||
            !edges.has(pair(j, k)) ||
            !edges.has(pair(k, l)) ||
            !edges.has(pair(l, i))
          )
            continue;
          const id = [i, j, k, l].sort((x, y) => x - y).join(":");
          if (!seen.has(id)) {
            seen.add(id);
            areas.push(d.x * d.x + d.y * d.y);
          }
        }
  }
  const grouped = new Map<number, number>();
  for (const area of areas) {
    const size = Math.round(area * 1e4);
    grouped.set(size, (grouped.get(size) ?? 0) + 1);
  }
  return [...grouped.entries()].sort(([a], [b]) => a - b).map(([, count]) => count);
}

export function countVisibleShapes(scene: CountScene): number {
  return countVisibleShapeGroups(scene).reduce((sum, n) => sum + n, 0);
}

const polygon = (...p: number[]): Segment[] =>
  p.flatMap((_, i) =>
    i % 2 ? [] : [[p[i], p[i + 1], p[(i + 2) % p.length], p[(i + 3) % p.length]] as Segment],
  );
const regular = (n: number, radius = 4.1, rotation = -Math.PI / 2): number[] =>
  Array.from({ length: n }, (_, i) => [
    5 + radius * Math.cos(rotation + (i * 2 * Math.PI) / n),
    5 + radius * Math.sin(rotation + (i * 2 * Math.PI) / n),
  ]).flat();
const star = (n: number, step: number): Segment[] => {
  const p = regular(n);
  return Array.from(
    { length: n },
    (_, i) =>
      [p[2 * i], p[2 * i + 1], p[2 * ((i + step) % n)], p[2 * ((i + step) % n) + 1]] as Segment,
  );
};

export const COUNT_SCENES: CountScene[] = [
  { id: "five_point_star", target: "triangles", segments: star(5, 2) },
  {
    id: "six_point_star",
    target: "triangles",
    segments: [...polygon(5, 0.5, 0.8, 8.1, 9.2, 8.1), ...polygon(5, 9.5, 0.8, 1.9, 9.2, 1.9)],
  },
  {
    id: "crossed_house",
    target: "triangles",
    segments: [
      ...polygon(1, 4, 5, 0.5, 9, 4, 9, 9, 1, 9),
      [1, 4, 9, 4],
      [1, 4, 9, 9],
      [9, 4, 1, 9],
      [1, 9, 9, 9],
    ],
  },
  {
    id: "median_web",
    target: "triangles",
    segments: [
      ...polygon(5, 0.5, 0.5, 9, 9.5, 9),
      [5, 0.5, 5, 9],
      [0.5, 9, 7.25, 4.75],
      [9.5, 9, 2.75, 4.75],
    ],
  },
  {
    id: "diagonal_kite",
    target: "triangles",
    segments: [
      ...polygon(5, 0.5, 9.5, 5, 5, 9.5, 0.5, 5),
      [5, 0.5, 5, 9.5],
      [0.5, 5, 9.5, 5],
      [0.5, 5, 7.25, 7.25],
    ],
  },
  {
    id: "window_cross",
    target: "triangles",
    segments: [
      ...polygon(1, 1, 9, 1, 9, 9, 1, 9),
      [1, 1, 9, 9],
      [9, 1, 1, 9],
      [5, 1, 5, 9],
      [1, 5, 9, 5],
    ],
  },
  {
    id: "overlap_squares",
    target: "squares",
    segments: [
      ...polygon(1, 1, 7, 1, 7, 7, 1, 7),
      ...polygon(3, 3, 9, 3, 9, 9, 3, 9),
      [1, 5, 9, 5],
      [5, 1, 5, 9],
    ],
  },
  {
    id: "diamond_overlay",
    target: "squares",
    segments: [
      ...polygon(1, 1, 9, 1, 9, 9, 1, 9),
      ...polygon(5, 0.5, 9.5, 5, 5, 9.5, 0.5, 5),
      [1, 5, 9, 5],
      [5, 1, 5, 9],
    ],
  },
  {
    id: "seven_point_star",
    target: "triangles",
    segments: star(7, 3),
  },
  {
    id: "bow_tie_bridge",
    target: "triangles",
    segments: [
      ...polygon(1, 2, 9, 2, 9, 8, 1, 8),
      [1, 2, 9, 8], [9, 2, 1, 8], [1, 5, 9, 5],
    ],
  },
  {
    id: "three_fan_sails",
    target: "triangles",
    segments: [
      ...polygon(5, 0.5, 0.5, 9, 9.5, 9),
      [5, 0.5, 2.5, 9], [5, 0.5, 5, 9], [5, 0.5, 7.5, 9],
      [1.5, 7, 8.5, 7],
    ],
  },
  {
    id: "crossed_trapezoid",
    target: "triangles",
    segments: [
      ...polygon(3, 1, 7, 1, 9, 9, 1, 9),
      [3, 1, 9, 9], [7, 1, 1, 9], [3, 1, 1, 9],
      [3, 5, 8, 5],
    ],
  },
  {
    id: "split_hourglass",
    target: "triangles",
    segments: [
      ...polygon(1, 1, 9, 1, 1, 9, 9, 9),
      [1, 1, 9, 9], [9, 1, 1, 9], [5, 1, 5, 9],
    ],
  },
  {
    id: "roof_and_crossbeams",
    target: "triangles",
    segments: [
      ...polygon(1, 4, 5, 0.5, 9, 4, 9, 9, 1, 9),
      [1, 4, 9, 4], [5, 0.5, 5, 9], [1, 4, 9, 9],
      [9, 4, 1, 9],
    ],
  },
  {
    id: "diamond_fan",
    target: "triangles",
    segments: [
      ...polygon(5, 0.5, 9.5, 5, 5, 9.5, 0.5, 5),
      [5, 0.5, 5, 9.5], [0.5, 5, 9.5, 5],
      [5, 0.5, 7.25, 7.25], [5, 0.5, 2.75, 7.25],
    ],
  },
  {
    id: "crossed_pennant",
    target: "triangles",
    segments: [
      ...polygon(0.5, 1, 9.5, 1, 5, 9),
      [0.5, 1, 7.25, 5], [9.5, 1, 2.75, 5],
      [2.75, 5, 7.25, 5], [5, 1, 5, 9],
    ],
  },
  {
    id: "offset_triple_square",
    target: "squares",
    segments: [
      ...polygon(0.5, 0.5, 6.5, 0.5, 6.5, 6.5, 0.5, 6.5),
      ...polygon(2, 2, 8, 2, 8, 8, 2, 8),
      ...polygon(3.5, 3.5, 9.5, 3.5, 9.5, 9.5, 3.5, 9.5),
    ],
  },
  {
    id: "square_diamond_interlock",
    target: "squares",
    segments: [
      ...polygon(1, 1, 9, 1, 9, 9, 1, 9),
      ...polygon(2, 2, 8, 2, 8, 8, 2, 8),
      ...polygon(5, 1, 9, 5, 5, 9, 1, 5),
      [1, 5, 9, 5], [5, 1, 5, 9],
    ],
  },
  {
    id: "two_diamonds_in_frame",
    target: "squares",
    segments: [
      ...polygon(1, 1, 9, 1, 9, 9, 1, 9),
      ...polygon(5, 1, 9, 5, 5, 9, 1, 5),
      ...polygon(5, 3, 7, 5, 5, 7, 3, 5),
      [1, 5, 9, 5], [5, 1, 5, 9],
    ],
  },
  {
    id: "stepped_square_overlay",
    target: "squares",
    segments: [
      ...polygon(1, 1, 9, 1, 9, 9, 1, 9),
      ...polygon(1, 1, 6, 1, 6, 6, 1, 6),
      ...polygon(4, 4, 9, 4, 9, 9, 4, 9),
      ...polygon(5, 2, 8, 5, 5, 8, 2, 5),
    ],
  },
];

export function countSceneSvg(scene: CountScene): string {
  return scene.segments
    .map(
      ([x1, y1, x2, y2]) =>
        `<line x1="${60 + x1 * 24}" y1="${15 + y1 * 24}" x2="${60 + x2 * 24}" y2="${15 + y2 * 24}" stroke="#211638" stroke-width="3.5" stroke-linecap="round"/>`,
    )
    .join("");
}
