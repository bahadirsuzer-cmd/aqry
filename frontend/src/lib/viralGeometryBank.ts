import type { Family } from "./viralPuzzleBank";
const rad = Math.PI / 180;
const choose = (r: () => number, values: number[]) => values[Math.floor(r() * values.length)];
const int = (r: () => number, min: number, max: number, step = 1) => {
  const count = Math.floor((max - min) / step) + 1;
  return min + Math.floor(r() * count) * step;
};
const polar = (x: number, y: number, length: number, angle: number) =>
  [x + length * Math.cos(angle * rad), y - length * Math.sin(angle * rad)] as const;
const line = (x: number, y: number, xx: number, yy: number, color = "#211638", width = 3.5) =>
  `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const label = (x: number, y: number, text: string, color = "#211638") =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="700" font-size="21" fill="${color}">${text}</text>`;
const arc = (
  x: number,
  y: number,
  radius: number,
  start: number,
  end: number,
  color = "#e0524d",
) => {
  const p = polar(x, y, radius, start),
    q = polar(x, y, radius, end);
  return `<path d="M${p[0]} ${p[1]} A${radius} ${radius} 0 0 0 ${q[0]} ${q[1]}" fill="none" stroke="${color}" stroke-width="3"/>`;
};
const par = (x: number, y: number) =>
  `<path d="M${x - 8} ${y - 6}L${x} ${y}L${x - 8} ${y + 6}" fill="none" stroke="#7c3aed" stroke-width="3"/>`;
const slantedPar = (x: number, y: number, angle: number) =>
  `<g transform="translate(${x} ${y}) rotate(${-angle})"><path d="M-12 -6L-4 0L-12 6M-4 -6L4 0L-4 6" fill="none" stroke="#7c3aed" stroke-width="3"/></g>`;
const arcTick = (x: number, y: number, radius: number, angle: number) => {
  const p = polar(x, y, radius - 6, angle),
    q = polar(x, y, radius + 6, angle);
  return line(p[0], p[1], q[0], q[1], "#7c3aed", 3);
};
const rightSquare = (
  x: number,
  y: number,
  u: readonly [number, number],
  v: readonly [number, number],
) => {
  const size = 13,
    a = size / Math.hypot(u[0], u[1]),
    b = size / Math.hypot(v[0], v[1]);
  return `<path d="M${x + u[0] * a} ${y + u[1] * a}L${x + u[0] * a + v[0] * b} ${y + u[1] * a + v[1] * b}L${x + v[0] * b} ${y + v[1] * b}" fill="none" stroke="#7c3aed" stroke-width="3"/>`;
};
const tick = (x: number, y: number, angle: number) => {
  const p = polar(x, y, 8, angle + 90),
    q = polar(x, y, 8, angle - 90);
  return line(p[0], p[1], q[0], q[1], "#7c3aed", 3);
};
const out = (answer: number, wrong: number, diagram: string, steps: string[]) => ({
  answer: `${answer}°`,
  commonWrong: `${wrong}°`,
  diagram,
  steps,
});

function zigzag(a: number, b: number, bisect: boolean) {
  const x = 88,
    y = 135,
    top = 28,
    bottom = 242,
    tx = x + (y - top) / Math.tan(a * rad),
    bx = x + (bottom - y) / Math.tan(b * rad);
  const d =
    line(25, top, 335, top) +
    line(25, bottom, 335, bottom) +
    line(x, y, tx, top) +
    line(x, y, bx, bottom) +
    par(46, top) +
    par(46, bottom) +
    arc(x, y, 42, -b, a, "#e0524d") +
    label(tx - 40, top + 21, `${a}°`) +
    label(bx - 36, bottom - 23, `${b}°`);
  if (!bisect)
    return out(a + b, 180 - a - b, d + label(x + 60, y, "x", "#e0524d"), [
      `∥ ⇒ ${a}° + ${b}°`,
      `x=${a + b}°`,
    ]);
  const middle = (a - b) / 2,
    m = polar(x, y, 190, middle),
    xLabel = polar(x, y, 78, (middle + a) / 2),
    ans = (a + b) / 2;
  const visual =
    d +
    line(x, y, m[0], m[1], "#7c3aed", 3) +
    arc(x, y, 56, -b, middle, "#7c3aed") +
    arc(x, y, 56, middle, a, "#7c3aed") +
    arcTick(x, y, 56, (-b + middle) / 2) +
    arcTick(x, y, 56, (middle + a) / 2) +
    label(xLabel[0], xLabel[1], "x", "#e0524d");
  return out(ans, a + b, visual, [`∥ ⇒ ${a}°+${b}°=${a + b}°`, `½ ⇒ x=${a + b}°÷2=${ans}°`]);
}

function parallelogram(e: number, phi: number, half: boolean) {
  const theta = 180 - e,
    w = 180,
    h = (w * Math.tan(phi * rad)) / (1 - Math.tan(phi * rad) / Math.tan(theta * rad)),
    offset = h / Math.tan(theta * rad);
  const ax = 45,
    ay = 233,
    bx = ax + w,
    dx = ax + offset,
    dy = ay - h,
    cx = bx + offset;
  const base =
    line(ax, ay, bx, ay) +
    line(bx, ay, cx, dy) +
    line(cx, dy, dx, dy) +
    line(dx, dy, ax, ay) +
    line(ax, ay, cx, dy) +
    par(150, ay) +
    par(150 + offset, dy) +
    slantedPar((ax + dx) / 2, (ay + dy) / 2, theta) +
    slantedPar((bx + cx) / 2, (ay + dy) / 2, theta) +
    arc(bx, ay, 37, theta, 180) +
    label(bx - 20, ay - 38, `${e}°`) +
    arc(ax, ay, 40, 0, phi, "#7c3aed") +
    label(ax + 66, ay - 15, `${phi}°`);
  if (!half)
    return out(
      theta - phi,
      e - phi,
      base + arc(ax, ay, 58, phi, theta) + label(ax + 74, ay - 63, "x", "#e0524d"),
      [`∥ ⇒ 180°−${e}°=${theta}°`, `x=${theta}°−${phi}°=${theta - phi}°`],
    );
  const mid = (phi + theta) / 2,
    p = polar(ax, ay, h / Math.sin(mid * rad), mid),
    ans = (theta - phi) / 2;
  return out(
    ans,
    theta - phi,
    base +
      line(ax, ay, p[0], p[1], "#7c3aed", 3) +
      arc(ax, ay, 60, phi, mid) +
      arc(ax, ay, 60, mid, theta) +
      arcTick(ax, ay, 60, (phi + mid) / 2) +
      arcTick(ax, ay, 60, (mid + theta) / 2) +
      label(ax + 97, ay - 64, "x", "#e0524d"),
    [`∥ ⇒ 180°−${e}°−${phi}°=${theta - phi}°`, `x=(${theta - phi}°)÷2=${ans}°`],
  );
}

function isosceles(e: number) {
  const base = 180 - e,
    h = 108 * Math.tan(base * rad),
    ay = 240,
    apexY = ay - h;
  const answer = e - 90;
  const diagram =
    line(55, ay, 163, apexY) +
    line(163, apexY, 271, ay) +
    line(55, ay, 271, ay) +
    line(163, apexY, 163, ay, "#7c3aed", 3) +
    line(271, ay, 323, ay) +
    tick(109, (ay + apexY) / 2, base) +
    tick(217, (ay + apexY) / 2, 180 - base) +
    arc(271, ay, 39, 0, 180 - base) +
    label(293, ay - 45, `${e}°`) +
    arc(163, apexY, 39, 180 + base, 270) +
    arc(163, apexY, 39, 270, 360 - base) +
    arcTick(163, apexY, 39, (180 + base + 270) / 2) +
    arcTick(163, apexY, 39, (270 + 360 - base) / 2) +
    `<path d="M163 ${ay - 15}h15v15" fill="none" stroke="#7c3aed" stroke-width="3"/>` +
    label(93, ay - 25, "β₁") +
    label(233, ay - 25, "β₂") +
    label(127, apexY + 58, "x", "#e0524d");
  return out(answer, 2 * answer, diagram, [
    `180°−${e}°=${base}°`,
    `β₁=β₂=${base}°`,
    `180°−2×${base}°=${2 * e - 180}°`,
    `x=${2 * e - 180}°÷2=${answer}°`,
  ]);
}

function rightAltitude(a: number) {
  const w = 175,
    h = w * Math.tan(a * rad),
    ax = 70,
    ay = 240,
    bx = ax + w,
    cy = ay - h;
  // Foot of the altitude from A to BC, computed by projection onto BC.
  const ux = -w,
    uy = -h,
    t = ((ax - bx) * ux + (ay - ay) * uy) / (ux * ux + uy * uy),
    fx = bx + t * ux,
    fy = ay + t * uy;
  const angle = 90 - a,
    half = angle / 2,
    ray = polar(ax, ay, 115, half),
    answer = half;
  const diagram =
    line(ax, ay, bx, ay) +
    line(bx, ay, ax, cy) +
    line(ax, cy, ax, ay) +
    line(ax, ay, fx, fy, "#7c3aed", 3) +
    line(ax, ay, ray[0], ray[1], "#e0524d", 3) +
    `<path d="M${ax} ${ay - 20}h20v20" fill="none" stroke="#7c3aed" stroke-width="3"/>` +
    rightSquare(fx, fy, [ax - fx, ay - fy], [bx - fx, ay - fy]) +
    arc(bx, ay, 34, 180 - a, 180) +
    label(bx - 50, ay - 20, `${a}°`) +
    arc(ax, ay, 39, 0, half, "#7c3aed") +
    arc(ax, ay, 39, half, angle, "#7c3aed") +
    arcTick(ax, ay, 39, half / 2) +
    arcTick(ax, ay, 39, (half + angle) / 2) +
    label(ax + 59, ay - 9, "x", "#e0524d") +
    `<circle cx="${fx}" cy="${fy}" r="4" fill="#7c3aed"/>`;
  return out(answer, angle, diagram, [`⊥ ⇒ 90°`, `90°−${a}°=${angle}°`, `½ ⇒ x=${angle}°÷2=${answer}°`]);
}

function crossed(a: number, b: number) {
  // Two rays meet below a parallel top line. The exterior angle is asked after their crossing.
  const cx = 170,
    cy = 165,
    top = 35,
    bot = 245,
    tx = cx - (cy - top) / Math.tan(a * rad),
    ux = cx + (cy - top) / Math.tan(b * rad),
    right = cx + (bot - cy) / Math.tan(a * rad),
    left = cx - (bot - cy) / Math.tan(b * rad);
  const answer = 180 - a - b;
  const diagram =
    line(20, top, 340, top) +
    line(20, bot, 340, bot) +
    line(tx, top, cx, cy) +
    line(ux, top, cx, cy) +
    line(cx, cy, right, bot) +
    line(cx, cy, left, bot) +
    par(50, top) +
    par(50, bot) +
    arc(cx, cy, 48, b, 180 - a) +
    arc(right, bot, 28, 180 - a, 180) +
    label(cx, cy - 75, "x", "#e0524d") +
    label(right - 28, bot - 35, `${a}°`) +
    label(ux - 35, top + 21, `${b}°`);
  return out(answer, a + b === answer ? a + b + 10 : a + b, diagram, [
    `∥ ⇒ ${a}°, ${b}°`,
    `x=180°−${a}°−${b}°=${answer}°`,
  ]);
}

function trapezoid(a: number, phi: number) {
  const h = 78,
    ax = 50,
    ay = 235,
    dx = ax + h / Math.tan(a * rad),
    dy = ay - h,
    cx = ax + h / Math.tan(phi * rad),
    bx = 315;
  const answer = a / 2 - phi,
    mid = polar(ax, ay, h / Math.sin((a / 2) * rad), a / 2);
  const diagram =
    line(ax, ay, bx, ay) +
    line(bx, ay, cx, dy) +
    line(cx, dy, dx, dy) +
    line(dx, dy, ax, ay) +
    line(ax, ay, cx, dy) +
    line(ax, ay, mid[0], mid[1], "#7c3aed", 3) +
    par(155, ay) +
    par(155, dy) +
    arc(ax, ay, 49, 0, a / 2, "#7c3aed") +
    arc(ax, ay, 49, a / 2, a, "#7c3aed") +
    arcTick(ax, ay, 49, a / 4) +
    arcTick(ax, ay, 49, (3 * a) / 4) +
    arc(cx, dy, 36, 180, 180 + phi, "#e0524d") +
    arc(ax, ay, 70, phi, a / 2, "#e0524d") +
    label(cx - 43, dy + 17, `${phi}°`) +
    label(ax + 15, ay - 58, `${a}°`) +
    label(ax + 78, ay - 39, "x", "#e0524d");
  return out(answer, a - phi, diagram, [
    `∥ ⇒ ${phi}°`,
    `½ =${a}°÷2=${a / 2}°`,
    `x=${a / 2}°−${phi}°=${answer}°`,
  ]);
}

function exteriorBisector(a: number, e: number) {
  const ax = 45,
    bx = 305,
    by = 235,
    h = (bx - ax) / (1 / Math.tan(a * rad) - 1 / Math.tan(e * rad));
  const cx = ax + h / Math.tan(a * rad),
    cy = by - h,
    half = (e - a) / 2;
  const mid = 180 + (a + e) / 2,
    footX = cx - h / Math.tan(mid * rad);
  const diagram =
    line(ax, by, bx, by) +
    line(ax, by, cx, cy) +
    line(cx, cy, bx, by) +
    line(bx, by, 345, by) +
    line(cx, cy, footX, by, "#7c3aed", 3) +
    arc(ax, by, 35, 0, a) +
    arc(bx, by, 36, 0, e) +
    arc(cx, cy, 40, 180 + a, mid, "#7c3aed") +
    arc(cx, cy, 40, mid, 180 + e, "#7c3aed") +
    arcTick(cx, cy, 40, (180 + a + mid) / 2) +
    arcTick(cx, cy, 40, (mid + 180 + e) / 2) +
    label(ax + 54, by - 24, `${a}°`) +
    label(bx + 12, by - 54, `${e}°`) +
    label(cx - 32, cy + 65, "x", "#e0524d");
  return out(half, e - a, diagram, [`180°−${e}°`, `${e}°−${a}°=${e - a}°`, `½ ⇒ x=${half}°`]);
}


const polyline=(pts:readonly (readonly [number,number])[],color="#211638",width=3.5)=>pts.slice(1).reduce((s,p,i)=>s+line(pts[i][0],pts[i][1],p[0],p[1],color,width),"");
const variant=(r:()=>number,n:number)=>Math.floor(r()*n);
function triangleSum(a:number,b:number,v:number){const ans=180-a-b,L=[[[65,225],[290,225],[185,45]],[[55,220],[305,185],[130,48]],[[85,235],[315,215],[250,42]],[[45,205],[270,235],[315,70]],[[80,230],[275,230],[85,55]],[[55,235],[300,235],[220,60]]] as const;const[A,B,C]=L[v%6];return out(ans,a+b,polyline([A,B,C,A])+label(A[0]+42,A[1]-22,a+"°")+label(B[0]-42,B[1]-22,b+"°")+label(C[0],C[1]+40,"x","#e0524d"),["Üçgen iç açıları 180°","x=180°−"+a+"°−"+b+"°="+ans+"°"]); }
function verticalAngles(a:number,v:number){const cx=180,cy=138,g=[24,34,44,54][v%4],p1=polar(cx,cy,180,g),p2=polar(cx,cy,180,g+180),p3=polar(cx,cy,180,180-g),p4=polar(cx,cy,180,360-g);return out(a,180-a,line(p1[0],p1[1],p2[0],p2[1])+line(p3[0],p3[1],p4[0],p4[1])+label(cx,cy-60,a+"°")+label(cx,cy+60,"x","#e0524d"),["Ters açılar eşittir","x="+a+"°"]); }
function linearPair(a:number,v:number){const ans=180-a,x=[95,130,165,200][v%4],y=205,g=[35,55,70,115][v%4],p=polar(x,y,150,g);return out(ans,a,line(30,y,330,y)+line(x,y,p[0],p[1])+label(x+55,y-30,a+"°")+label(x-55,y-35,"x","#e0524d"),["Doğru açı 180°","x=180°−"+a+"°="+ans+"°"]); }
function parallelAlternate(a:number,v:number){const sh=[-55,-25,25,55][v%4],x1=95+sh,x2=245+sh;return out(a,180-a,line(25,65,335,65)+line(25,215,335,215)+line(x1,250,x2,25)+par(48,65)+par(48,215)+label(x2-58,92,a+"°")+label(x1+55,190,"x","#e0524d"),["İç ters açılar eşittir","x="+a+"°"]); }
function isoscelesBase(apex:number,v:number){const ans=(180-apex)/2,L=[[[65,225],[295,225],[180,50]],[[45,220],[270,235],[250,50]],[[85,235],[315,205],[120,45]],[[55,230],[300,230],[210,65]]] as const;const[A,B,C]=L[v%4];return out(ans,180-apex,polyline([A,B,C,A])+tick((A[0]+C[0])/2,(A[1]+C[1])/2,45)+tick((B[0]+C[0])/2,(B[1]+C[1])/2,135)+label(C[0],C[1]+40,apex+"°")+label(A[0]+38,A[1]-24,"x","#e0524d"),["İkizkenarda taban açıları eşittir","x=(180°−"+apex+"°)÷2="+ans+"°"]); }
function quadrilateralMissing(a:number,b:number,cc:number,v:number){const ans=360-a-b-cc,L=[[[60,215],[285,230],[310,75],[110,45]],[[45,180],[145,235],[305,185],[250,45]],[[75,235],[300,205],[265,55],[55,75]],[[55,220],[280,235],[320,110],[165,45]]] as const,P=L[v%4];return out(ans,180-a,polyline([P[0],P[1],P[2],P[3],P[0]])+label(P[0][0]+30,P[0][1]-22,a+"°")+label(P[1][0]-28,P[1][1]-28,b+"°")+label(P[2][0]-28,P[2][1]+28,cc+"°")+label(P[3][0]+28,P[3][1]+28,"x","#e0524d"),["Dörtgen iç açıları 360°","x=360°−"+a+"°−"+b+"°−"+cc+"°="+ans+"°"]); }
function rightTriangle(a:number,v:number){const ans=90-a,L=[[[65,225],[300,225],[65,55]],[[55,225],[300,225],[300,55]],[[80,235],[300,235],[80,75]],[[60,215],[285,215],[285,45]]] as const;const[A,B,C]=L[v%4],R=v%2===0?A:B;return out(ans,90+a,polyline([A,B,C,A])+'<path d="M'+R[0]+' '+(R[1]-16)+'h16v16" fill="none" stroke="#7c3aed" stroke-width="3"/>'+label(C[0]+(v%2?-35:35),C[1]+35,a+"°")+label((A[0]+B[0])/2,A[1]-25,"x","#e0524d"),["Dik üçgende dar açılar toplamı 90°","x=90°−"+a+"°="+ans+"°"]); }
function angleBisector(total:number,v:number){const x=180,y=210,s=[20,35,50,65][v%4],e=s+total,m=(s+e)/2,p1=polar(x,y,155,s),p2=polar(x,y,155,e),pm=polar(x,y,145,m),ans=total/2;return out(ans,total,line(x,y,p1[0],p1[1])+line(x,y,p2[0],p2[1])+line(x,y,pm[0],pm[1],"#7c3aed",3)+arc(x,y,48,s,m)+arc(x,y,48,m,e)+arcTick(x,y,48,(s+m)/2)+arcTick(x,y,48,(m+e)/2)+label(x,y-78,total+"°")+label(pm[0]+18,pm[1]+18,"x","#e0524d"),["Açıortay iki eş açı oluşturur","x="+total+"°÷2="+ans+"°"]); }
export const GEOMETRY_FAMILIES: Family[] = [
  {id:"triangle_sum",kind:"geometry",make:r=>{const a=int(r,28,72),b=int(r,28,Math.min(78,145-a));return triangleSum(a,b,variant(r,6));}},
  {id:"vertical_angles",kind:"geometry",make:r=>verticalAngles(int(r,28,152),variant(r,4))},
  {id:"linear_pair",kind:"geometry",make:r=>linearPair(int(r,28,152),variant(r,4))},
  {id:"parallel_alternate",kind:"geometry",make:r=>parallelAlternate(int(r,30,150),variant(r,4))},
  {id:"isosceles_base",kind:"geometry",make:r=>isoscelesBase(int(r,30,120,2),variant(r,4))},
  {id:"quadrilateral_missing",kind:"geometry",make:r=>{const a=int(r,70,105),b=int(r,70,105),cc=int(r,70,105);return quadrilateralMissing(a,b,cc,variant(r,4));}},
  {id:"right_triangle",kind:"geometry",make:r=>rightTriangle(int(r,20,70),variant(r,4))},
  {id:"angle_bisector",kind:"geometry",make:r=>angleBisector(int(r,40,140,2),variant(r,4))},
] = [
  {
    id: "parallel_kink",
    kind: "geometry",
    make: (r) => {
      const a=int(r,28,58), b=int(r,20,42);
      return zigzag(a,b,false);
    },
  },
  {
    id: "bisected_parallel_kink",
    kind: "geometry",
    make: (r) => {
      // Keep the sum even so the bisected answer is a clean whole degree.
      let a=int(r,36,66), b=int(r,18,44);
      if ((a+b)%2) b += b<44 ? 1 : -1;
      return zigzag(a,b,true);
    },
  },
  {
    id: "diagonal_parallelogram",
    kind: "geometry",
    make: (r) => {
      const e=int(r,105,138), phi=int(r,14,32);
      return parallelogram(e,phi,false);
    },
  },
  {
    id: "bisected_diagonal_parallelogram",
    kind: "geometry",
    make: (r) => {
      let e=int(r,106,136), phi=int(r,14,32);
      if (((180-e-phi)%2)!==0) phi += phi<32 ? 1 : -1;
      return parallelogram(e,phi,true);
    },
  },
  {
    id: "isosceles_exterior_bisector",
    kind: "geometry",
    make: (r) => isosceles(int(r,118,146)),
  },
  {
    id: "right_altitude_bisector",
    kind: "geometry",
    make: (r) => {
      // Even source angles keep the bisected result integral.
      return rightAltitude(int(r,26,62,2));
    },
  },
  {
    id: "crossed_parallel_transversals",
    kind: "geometry",
    make: (r) => {
      let a=int(r,34,66), b=int(r,34,66);
      if (a+b>132) b=132-a;
      return crossed(a,b);
    },
  },
  {
    id: "trapezoid_diagonal_bisector",
    kind: "geometry",
    make: (r) => {
      const a=int(r,56,86,2);
      const phi=int(r,10,Math.max(12,Math.floor(a/2)-8));
      return trapezoid(a,phi);
    },
  },
  {
    id: "triangle_exterior_bisector",
    kind: "geometry",
    make: (r) => {
      const a=int(r,42,72);
      let e=int(r,108,148);
      if ((e-a)%2) e += e<148 ? 1 : -1;
      return exteriorBisector(a,e);
    },
  },
];
