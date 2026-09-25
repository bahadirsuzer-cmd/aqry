export type GeometryPuzzleVariant = {
  family: string;
  answer: string;
  commonWrong: string;
  data: Record<string, number | string>;
};

type Variant = Record<string, number>;

type GeometryMaster = {
  id: string;
  variants: Variant[];
  solve: (variant: Variant) => number;
  commonWrong: (variant: Variant, answer: number) => number;
};

const MASTERS: GeometryMaster[] = [
  {
    id: "parallel_triangle",
    variants: [
      { a: 35, b: 55 }, { a: 40, b: 65 }, { a: 45, b: 50 },
      { a: 50, b: 60 }, { a: 55, b: 45 }, { a: 60, b: 35 },
    ],
    solve: ({ a, b }) => 180 - a - b,
    commonWrong: ({ a, b }) => Math.abs(a - b),
  },
  {
    id: "isosceles_apex_exterior",
    variants: [
      { e: 100 }, { e: 110 }, { e: 120 }, { e: 130 },
      { e: 140 }, { e: 150 },
    ],
    solve: ({ e }) => e / 2,
    commonWrong: ({ e }) => 180 - e,
  },
  {
    id: "isosceles_base_exterior",
    variants: [
      { e: 110 }, { e: 115 }, { e: 120 }, { e: 125 },
      { e: 130 }, { e: 135 },
    ],
    solve: ({ e }) => 2 * e - 180,
    commonWrong: ({ e }) => 180 - e,
  },
  {
    id: "right_triangle_exterior",
    variants: [
      { e: 110 }, { e: 115 }, { e: 120 }, { e: 125 },
      { e: 130 }, { e: 135 }, { e: 140 },
    ],
    solve: ({ e }) => e - 90,
    commonWrong: ({ e }) => 180 - e,
  },
  {
    id: "vertical_triangle",
    variants: [
      { a: 35, b: 45 }, { a: 40, b: 55 }, { a: 45, b: 60 },
      { a: 50, b: 35 }, { a: 55, b: 50 }, { a: 60, b: 40 },
    ],
    solve: ({ a, b }) => 180 - a - b,
    commonWrong: ({ a, b }) => 180 - Math.abs(a - b),
  },
  {
    id: "parallel_zigzag",
    variants: [
      { a: 35, b: 40 }, { a: 40, b: 50 }, { a: 45, b: 55 },
      { a: 50, b: 35 }, { a: 55, b: 45 }, { a: 60, b: 50 },
    ],
    solve: ({ a, b }) => a + b,
    commonWrong: ({ a, b }) => 180 - a - b,
  },
  {
    id: "exterior_remote_angles",
    variants: [
      { e: 105, a: 40 }, { e: 110, a: 45 }, { e: 115, a: 50 },
      { e: 120, a: 55 }, { e: 125, a: 45 }, { e: 130, a: 60 },
    ],
    solve: ({ e, a }) => e - a,
    commonWrong: ({ e, a }) => 180 - e - a,
  },
  {
    id: "parallel_transversal_triangle",
    variants: [
      { a: 40, b: 45 }, { a: 45, b: 50 }, { a: 50, b: 55 },
      { a: 55, b: 40 }, { a: 60, b: 45 }, { a: 65, b: 35 },
    ],
    solve: ({ a, b }) => 180 - a - b,
    commonWrong: ({ a, b }) => a + b,
  },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeVettedGeometryPuzzle(
  recentFamilies: string[] = [],
): GeometryPuzzleVariant {
  const available = MASTERS.filter((master) => !recentFamilies.includes(master.id));
  const pool = available.length > 0 ? available : MASTERS;
  const master = pool[randomInt(0, pool.length - 1)];
  const variant = master.variants[randomInt(0, master.variants.length - 1)];
  const answer = master.solve(variant);
  const wrong = master.commonWrong(variant, answer);

  return {
    family: master.id,
    answer: `${answer}°`,
    commonWrong: `${wrong}°`,
    data: { ...variant, template: master.id },
  };
}

export const VETTED_GEOMETRY_TEMPLATE_IDS = MASTERS.map((master) => master.id);
