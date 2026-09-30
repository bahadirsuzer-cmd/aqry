import type { Family } from "./viralPuzzleBank";

const SEGMENTS: Record<string, readonly string[]> = {
  "0":["a","b","c","d","e","f"], "1":["b","c"], "2":["a","b","g","e","d"],
  "3":["a","b","c","d","g"], "4":["f","g","b","c"], "5":["a","f","g","c","d"],
  "6":["a","f","g","e","c","d"], "7":["a","b","c"], "8":["a","b","c","d","e","f","g"],
  "9":["a","b","c","d","f","g"],
};
const LINES: Record<string,[number,number,number,number]> = {
  a:[12,8,48,8], b:[52,12,52,48], c:[52,56,52,92], d:[12,96,48,96],
  e:[8,56,8,92], f:[8,12,8,48], g:[12,52,48,52],
};
function diff(a:string,b:string){
  let removed=0,added=0;
  for(let i=0;i<a.length;i+=1){
    const x=new Set(SEGMENTS[a[i]]), y=new Set(SEGMENTS[b[i]]);
    for(const s of x) if(!y.has(s)) removed+=1;
    for(const s of y) if(!x.has(s)) added+=1;
  }
  return {removed,added};
}
function candidates(start:string){
  const out:string[]=[];
  for(let n=1000;n<=9999;n+=1){
    const target=String(n); const d=diff(start,target);
    if(d.removed===1 && d.added===1) out.push(target);
  }
  return out;
}
function makePuzzle(r:()=>number, goal:"largest"|"smallest"){
  let start="6194", options=candidates(start);
  for(let attempt=0;attempt<40;attempt+=1){
    const next=String(1000+Math.floor(r()*9000));
    const found=candidates(next);
    if(found.length){start=next;options=found;break;}
  }
  const sorted=[...options].sort((a,b)=>Number(a)-Number(b));
  const answer=goal==="largest"?sorted[sorted.length-1]:sorted[0];
  return {
    answer,
    commonWrong:start,
    diagram:matchstickDiagram(start),
    steps:[
      "Exactly one existing match is removed and placed in one empty segment.",
      `${start} → ${answer}`,
    ],
    matchstickGoal:goal,
    matchstickMoves:1,
  };
}
function matchstickDiagram(value:string){
  const digitW=72, total=value.length*digitW, startX=(360-total)/2;
  const digits=[...value].map((digit,index)=>{
    const x=startX+index*digitW+6;
    const lines=SEGMENTS[digit].map((segment)=>{
      const [x1,y1,x2,y2]=LINES[segment];
      return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f3c77b" stroke-width="8" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="4.7" fill="#e53e3e"/><circle cx="${x2}" cy="${y2}" r="4.7" fill="#e53e3e"/></g>`;
    }).join("");
    return `<g transform="translate(${x} 78)">${lines}</g>`;
  }).join("");
  return `<rect x="18" y="38" width="324" height="204" rx="22" fill="rgba(35,20,12,.88)" stroke="rgba(255,255,255,.75)" stroke-width="2"/>${digits}`;
}
export const MATCHSTICK_FAMILIES: Family[] = [
  {id:"matchstick_largest_one",kind:"matchstick",make:(r)=>makePuzzle(r,"largest")},
  {id:"matchstick_smallest_one",kind:"matchstick",make:(r)=>makePuzzle(r,"smallest")},
];
