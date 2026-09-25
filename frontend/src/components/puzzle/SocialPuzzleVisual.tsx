type Props = {
  kind: "math" | "count" | "algebra" | "area";
  family: string;
  data: Record<string, number | string>;
  title: string;
  subtitle: string;
};

const LINE="#17101f";
const PURPLE="#7c3aed";
const SOFT="#ede9fe";

export function SocialPuzzleVisual({kind,family,data,title,subtitle}:Props){
  return <>
    <text x="180" y="95" textAnchor="middle" fontSize="20" fontWeight="900" fill={LINE}>{title}</text>
    {kind==="math" ? <MathVisual family={family} data={data}/> : null}
    {kind==="count" ? <CountVisual family={family} data={data}/> : null}
    {kind==="algebra" ? <AlgebraVisual family={family} data={data}/> : null}
    {kind==="area" ? <AreaVisual family={family} data={data}/> : null}
    <text x="180" y="440" textAnchor="middle" fontSize="16" fontWeight="900" fill="#6b7280">{subtitle}</text>
  </>;
}

function MathVisual({data}:{family:string;data:Record<string,number|string>}){
  return <text x="180" y="245" textAnchor="middle" fontSize="36" fontWeight="900" fill={LINE}>{String(data.expression)}</text>;
}

function CountVisual({family,data}:{family:string;data:Record<string,number|string>}){
  if(family==="square_grid"||family==="rectangle_grid"){
    const r=family==="square_grid"?Number(data.n):Number(data.r);
    const c=family==="square_grid"?Number(data.n):Number(data.c);
    const x0=70,y0=150,w=220,h=190,cw=w/c,ch=h/r;
    return <>
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke={LINE} strokeWidth="6"/>
      {Array.from({length:c-1},(_,i)=><line key={"v"+i} x1={x0+(i+1)*cw} y1={y0} x2={x0+(i+1)*cw} y2={y0+h} stroke={LINE} strokeWidth="4"/>)}
      {Array.from({length:r-1},(_,i)=><line key={"h"+i} x1={x0} y1={y0+(i+1)*ch} x2={x0+w} y2={y0+(i+1)*ch} stroke={LINE} strokeWidth="4"/>)}
    </>;
  }
  const rays=Number(data.rays);
  const xs=Array.from({length:rays+1},(_,i)=>65+i*(230/rays));
  return <>
    <line x1="65" y1="330" x2="295" y2="330" stroke={LINE} strokeWidth="6"/>
    {xs.map((x,i)=><line key={i} x1="180" y1="145" x2={x} y2="330" stroke={LINE} strokeWidth={i===0||i===xs.length-1?6:3}/>)}
  </>;
}

function AlgebraVisual({family,data}:{family:string;data:Record<string,number|string>}){
  if(family==="sum_product"){
    return <>
      <text x="180" y="190" textAnchor="middle" fontSize="28" fontWeight="900">a + b = {String(data.sum)}</text>
      <text x="180" y="235" textAnchor="middle" fontSize="28" fontWeight="900">ab = {String(data.product)}</text>
      <text x="180" y="300" textAnchor="middle" fontSize="34" fontWeight="900" fill={PURPLE}>a² + b² = ?</text>
    </>;
  }
  if(family==="difference_system"){
    return <>
      <text x="180" y="200" textAnchor="middle" fontSize="30" fontWeight="900">x + y = {String(data.sum)}</text>
      <text x="180" y="250" textAnchor="middle" fontSize="30" fontWeight="900">x − y = {String(data.diff)}</text>
      <text x="180" y="310" textAnchor="middle" fontSize="34" fontWeight="900" fill={PURPLE}>x = ?</text>
    </>;
  }
  return <>
    <text x="180" y="165" textAnchor="middle" fontSize="26" fontWeight="900">● + ● + ● = {String(data.row1)}</text>
    <text x="180" y="220" textAnchor="middle" fontSize="26" fontWeight="900">● + ▲ + ▲ = {String(data.row2)}</text>
    <text x="180" y="285" textAnchor="middle" fontSize="31" fontWeight="900" fill={PURPLE}>▲ − ■ = ?</text>
    <text x="180" y="325" textAnchor="middle" fontSize="12" fontWeight="800" fill="#6b7280">●, ▲ ve ■ aynı değerleri korur</text>
  </>;
}

function AreaVisual({family,data}:{family:string;data:Record<string,number|string>}){
  if(family==="shaded_square"){
    return <>
      <rect x="75" y="145" width="210" height="210" fill={SOFT} stroke={LINE} strokeWidth="7"/>
      <rect x="135" y="205" width="90" height="90" fill="#fbfafc" stroke={LINE} strokeWidth="5"/>
      <text x="83" y="135" fontSize="18" fontWeight="900">{String(data.outer)}m</text>
      <text x="142" y="198" fontSize="17" fontWeight="900">{String(data.inner)}m</text>
      <text x="180" y="325" textAnchor="middle" fontSize="24" fontWeight="900" fill={PURPLE}>A = ?</text>
    </>;
  }
  if(family==="l_shape"){
    return <>
      <path d="M70 145H290V250H220V340H70Z" fill={SOFT} stroke={LINE} strokeWidth="7" strokeLinejoin="round"/>
      <text x="155" y="132" fontSize="18" fontWeight="900">{String(data.w)}m</text>
      <text x="35" y="250" fontSize="18" fontWeight="900">{String(data.h)}m</text>
      <text x="226" y="275" fontSize="16" fontWeight="900">{String(data.cw)}m</text>
      <text x="244" y="331" fontSize="16" fontWeight="900">{String(data.ch)}m</text>
      <text x="138" y="250" fontSize="24" fontWeight="900" fill={PURPLE}>A = ?</text>
    </>;
  }
  return <>
    <path d="M75 325L75 145L275 325Z" fill="none" stroke={LINE} strokeWidth="7"/>
    <path d="M75 300H100V325" fill="none" stroke={PURPLE} strokeWidth="4"/>
    <line x1="275" y1="325" x2="315" y2="325" stroke={LINE} strokeWidth="7"/>
    <text x="40" y="240" fontSize="18" fontWeight="900">{String(data.a)}</text>
    <text x="160" y="350" fontSize="18" fontWeight="900">{String(data.b)}</text>
    <text x="292" y="350" fontSize="18" fontWeight="900">{String(data.extra)}</text>
    <text x="195" y="225" fontSize="27" fontWeight="900" fill={PURPLE}>?</text>
  </>;
}
