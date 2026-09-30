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
      const horizontal=y1===y2;
      const dx=horizontal?4:0, dy=horizontal?0:4;
      const sx=x1+dx, sy=y1+dy, ex=x2-dx, ey=y2-dy;
      return `<g filter="url(#matchShadow)"><line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="#f2c36f" stroke-width="7" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="4.2" fill="#e83f45"/></g>`;
    }).join("");
    return `<g transform="translate(${x} 78)">${lines}</g>`;
  }).join("");
  return `<defs><filter id="matchShadow" x="-35%" y="-35%" width="170%" height="170%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.4" flood-color="#000000" flood-opacity=".82"/></filter></defs>${digits}`;
}
export const MATCHSTICK_FAMILIES: Family[] = [
  {id:"matchstick_largest_one",kind:"matchstick",make:(r)=>makePuzzle(r,"largest")},
  {id:"matchstick_smallest_one",kind:"matchstick",make:(r)=>makePuzzle(r,"smallest")},
];
