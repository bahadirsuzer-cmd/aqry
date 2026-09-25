export type SocialPuzzleKind = "math" | "count" | "algebra" | "area";

export type SocialPuzzleVariant = {
  family: string;
  answer: string;
  commonWrong: string;
  titleKey: string;
  subtitleKey: string;
  data: Record<string, number | string>;
};

type Master = {
  id: string;
  kind: SocialPuzzleKind;
  variants: Array<Record<string, number | string>>;
  build: (v: Record<string, number | string>) => Omit<SocialPuzzleVariant, "family">;
};

const MASTERS: Master[] = [
  {
    id:"order_chain",
    kind:"math",
    variants:[
      {a:18,b:6,c:3,d:4,e:5},{a:24,b:8,c:2,d:3,e:7},{a:36,b:9,c:3,d:5,e:4},
      {a:42,b:6,c:2,d:3,e:8},{a:30,b:10,c:2,d:4,e:6}
    ],
    build:v=>{
      const a=+v.a,b=+v.b,c=+v.c,d=+v.d,e=+v.e;
      return {answer:String(a+b/c*d-e),commonWrong:String((a+b)/c*d-e),titleKey:"calc",subtitleKey:"dontRush",data:{expression:`${a} + ${b} ÷ ${c} × ${d} − ${e}`}};
    }
  },
  {
    id:"bracket_chain",
    kind:"math",
    variants:[
      {a:7,b:5,c:3,d:4},{a:9,b:6,c:2,d:5},{a:12,b:8,c:4,d:3},{a:15,b:9,c:3,d:2}
    ],
    build:v=>{
      const a=+v.a,b=+v.b,c=+v.c,d=+v.d;
      return {answer:String((a+b)/c*d),commonWrong:String(a+b/c*d),titleKey:"calc",subtitleKey:"bracketsMatter",data:{expression:`(${a} + ${b}) ÷ ${c} × ${d}`}};
    }
  },
  {
    id:"power_mix",
    kind:"math",
    variants:[
      {a:3,b:4,c:2,d:5},{a:4,b:3,c:2,d:6},{a:5,b:2,c:3,d:4},{a:6,b:2,c:2,d:7}
    ],
    build:v=>{
      const a=+v.a,b=+v.b,c=+v.c,d=+v.d;
      return {answer:String(a*a+b*c-d),commonWrong:String((a+b)*c-d),titleKey:"calc",subtitleKey:"powerTrap",data:{expression:`${a}² + ${b} × ${c} − ${d}`}};
    }
  },
  {
    id:"square_grid",
    kind:"count",
    variants:[{n:3},{n:4},{n:5}],
    build:v=>{
      const n=+v.n;
      let total=0; for(let s=1;s<=n;s++) total+=(n-s+1)*(n-s+1);
      return {answer:String(total),commonWrong:String(n*n),titleKey:"countSquares",subtitleKey:"notJustSmall",data:{n}};
    }
  },
  {
    id:"rectangle_grid",
    kind:"count",
    variants:[{r:2,c:3},{r:3,c:4},{r:3,c:5},{r:4,c:4}],
    build:v=>{
      const r=+v.r,c=+v.c;
      const total=(r*(r+1)/2)*(c*(c+1)/2);
      return {answer:String(total),commonWrong:String(r*c),titleKey:"countRectangles",subtitleKey:"countAllSizes",data:{r,c}};
    }
  },
  {
    id:"triangle_fan",
    kind:"count",
    variants:[{rays:3},{rays:4},{rays:5},{rays:6}],
    build:v=>{
      const rays=+v.rays;
      const total=rays*(rays+1)/2;
      return {answer:String(total),commonWrong:String(rays),titleKey:"countTriangles",subtitleKey:"combineThem",data:{rays}};
    }
  },
  {
    id:"sum_product",
    kind:"algebra",
    variants:[{s:11,p:24},{s:13,p:36},{s:14,p:45},{s:17,p:60},{s:19,p:84}],
    build:v=>{
      const s=+v.s,p=+v.p;
      return {answer:String(s*s-2*p),commonWrong:String(s*s),titleKey:"findValue",subtitleKey:"identityTrap",data:{sum:s,product:p}};
    }
  },
  {
    id:"difference_system",
    kind:"algebra",
    variants:[{s:18,d:4},{s:24,d:6},{s:30,d:8},{s:34,d:10}],
    build:v=>{
      const s=+v.s,d=+v.d; const x=(s+d)/2;
      return {answer:String(x),commonWrong:String(s-d),titleKey:"findX",subtitleKey:"twoLines",data:{sum:s,diff:d}};
    }
  },
  {
    id:"symbol_equations",
    kind:"algebra",
    variants:[
      {a:10,b:4,c:3},{a:8,b:5,c:2},{a:12,b:3,c:4},{a:9,b:6,c:2}
    ],
    build:v=>{
      const a=+v.a,b=+v.b,c=+v.c;
      const row1=a*3;
      const row2=a+b*2;
      const row3=b-c;
      return {answer:String(row3),commonWrong:String(b+c),titleKey:"symbolPuzzle",subtitleKey:"sameSymbols",data:{a,b,c,row1,row2}};
    }
  },
  {
    id:"shaded_square",
    kind:"area",
    variants:[{outer:10,inner:6},{outer:12,inner:8},{outer:14,inner:10},{outer:15,inner:9}],
    build:v=>{
      const o=+v.outer,i=+v.inner;
      return {answer:String(o*o-i*i),commonWrong:String((o-i)*(o-i)),titleKey:"shadedArea",subtitleKey:"subtractCorrectly",data:{outer:o,inner:i}};
    }
  },
  {
    id:"l_shape",
    kind:"area",
    variants:[
      {w:12,h:10,cw:4,ch:3},{w:14,h:9,cw:5,ch:3},{w:13,h:11,cw:4,ch:5},{w:15,h:12,cw:6,ch:4}
    ],
    build:v=>{
      const w=+v.w,h=+v.h,cw=+v.cw,ch=+v.ch;
      return {answer:String(w*h-cw*ch),commonWrong:String(w*h),titleKey:"findArea",subtitleKey:"missingCorner",data:{w,h,cw,ch}};
    }
  },
  {
    id:"pythagoras_composite",
    kind:"area",
    variants:[
      {a:3,b:4,extra:2},{a:5,b:12,extra:3},{a:6,b:8,extra:4},{a:8,b:15,extra:5}
    ],
    build:v=>{
      const a=+v.a,b=+v.b,extra=+v.extra;
      const hyp=Math.sqrt(a*a+b*b);
      return {answer:String(hyp+extra),commonWrong:String(a+b+extra),titleKey:"findLength",subtitleKey:"twoStepLength",data:{a,b,extra,hyp}};
    }
  }
];

function ri(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min; }

export function makeSocialPuzzle(kind: SocialPuzzleKind, recentFamilies:string[]=[]): SocialPuzzleVariant {
  const all=MASTERS.filter(m=>m.kind===kind);
  const available=all.filter(m=>!recentFamilies.includes(m.id));
  const pool=available.length?available:all;
  const master=pool[ri(0,pool.length-1)];
  const variant=master.variants[ri(0,master.variants.length-1)];
  return {family:master.id,...master.build(variant)};
}

export const SOCIAL_PUZZLE_FAMILIES = MASTERS.map(m=>m.id);
