import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { useAqryoLocale, type AqryoLocale } from "@/lib/i18n";
import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle-builder")({
  component: PuzzleBuilderPage,
});

type PuzzleKind = "math" | "geometry" | "count" | "algebra" | "area";
type Presentation = "clean" | "debate";

type Puzzle = {
  id: string;
  kind: PuzzleKind;
  family: string;
  answer: string;
  commonWrong: string;
  title: string;
  subtitle: string;
  data: Record<string, number | string>;
};

const RECENT_LIMIT = 18;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}


function signature(kind: PuzzleKind, family: string, data: Record<string, number | string>) {
  return `${kind}:${family}:${Object.entries(data).map(([k,v]) => `${k}=${v}`).join("|")}`;
}

function makeMath(): Puzzle {
  const family = pick(["priority-3", "priority-4", "bracket", "mixed-sign"]);
  let expression = "";
  let answer = 0;
  let wrong = 0;

  if (family === "priority-3") {
    const divisor = pick([2, 3, 4, 5, 6]);
    const q = randomInt(2, 9);
    const divided = divisor * q;
    const first = randomInt(12, 45);
    expression = `${first} + ${divided} ÷ ${divisor}`;
    answer = first + q;
    wrong = Math.round((first + divided) / divisor);
  } else if (family === "priority-4") {
    const a = randomInt(20, 60);
    const d = pick([2, 3, 4, 5]);
    const q = randomInt(2, 8);
    const b = d * q;
    const c = randomInt(3, 12);
    expression = `${a} - ${b} ÷ ${d} + ${c}`;
    answer = a - q + c;
    wrong = Math.round(((a - b) / d) + c);
  } else if (family === "bracket") {
    const a = randomInt(2, 9);
    const b = randomInt(3, 12);
    const c = randomInt(2, 6);
    const d = randomInt(3, 11);
    expression = `(${a} + ${b}) × ${c} - ${d}`;
    answer = (a + b) * c - d;
    wrong = a + b * c - d;
  } else {
    const a = randomInt(18, 44);
    const b = randomInt(2, 8);
    const c = randomInt(2, 6);
    const d = randomInt(4, 13);
    expression = `${a} + ${b} × ${c} - ${d}`;
    answer = a + b * c - d;
    wrong = (a + b) * c - d;
  }

  return {
    id: crypto.randomUUID(),
    kind: "math",
    family,
    answer: String(answer),
    commonWrong: String(wrong),
    title: "Çoğu kişi aynı yerde hata yapıyor",
    subtitle: "İşlem önceliğine güveniyor musun?",
    data: { expression },
  };
}

function makeGeometry(): Puzzle {
  const family = pick(["triangle-sum", "exterior", "isosceles", "right-angle", "parallel"]);
  if (family === "triangle-sum") {
    const a = pick([30, 35, 40, 45, 50, 55, 60]);
    const b = pick([35, 40, 45, 50, 55, 60, 65]);
    const x = 180 - a - b;
    return { id:crypto.randomUUID(), kind:"geometry", family, answer:`${x}°`, commonWrong:`${180-x}°`, title:"x açısını bul", subtitle:"Kalem kullanmadan çözebilir misin?", data:{a,b,x} };
  }
  if (family === "exterior") {
    const a = pick([25,30,35,40,45,50]);
    const x = pick([30,35,40,45,50,55]);
    const exterior = a + x;
    return { id:crypto.randomUUID(), kind:"geometry", family, answer:`${x}°`, commonWrong:`${180-exterior-a}°`, title:"İç açı mı, dış açı mı?", subtitle:"İlk cevabına güveniyor musun?", data:{a,exterior,x} };
  }
  if (family === "isosceles") {
    const apex = pick([30,40,50,60,70,80]);
    const x = (180 - apex) / 2;
    return { id:crypto.randomUUID(), kind:"geometry", family, answer:`${x}°`, commonWrong:`${180-apex}°`, title:"Eşit kenar işaretini kaçırma", subtitle:"x kaç?", data:{apex,x} };
  }
  if (family === "right-angle") {
    const a = pick([20,25,30,35,40,45,50,55,60,65]);
    const x = 90 - a;
    return { id:crypto.randomUUID(), kind:"geometry", family, answer:`${x}°`, commonWrong:`${180-a}°`, title:"Dik açı her şeyi değiştiriyor", subtitle:"x kaç?", data:{a,x} };
  }
  const a = pick([45,50,55,60,65,70]);
  const x = 180 - a;
  return { id:crypto.randomUUID(), kind:"geometry", family, answer:`${x}°`, commonWrong:`${a}°`, title:"Paralel çizgiler tuzağı", subtitle:"x kaç?", data:{a,x} };
}

function squareCount(n: number) {
  let total = 0;
  for (let size = 1; size <= n; size += 1) total += (n - size + 1) ** 2;
  return total;
}

function makeCount(): Puzzle {
  const family = pick(["grid", "nested", "rect-grid"]);
  if (family === "grid") {
    const n = pick([3,4,5,6]);
    return { id:crypto.randomUUID(), kind:"count", family, answer:String(squareCount(n)), commonWrong:String(n*n), title:"Toplam kaç kare var?", subtitle:"İlk gördüğünü sayıp geçme 👀", data:{rows:n,cols:n} };
  }
  if (family === "nested") {
    const levels = pick([4,5,6,7]);
    return { id:crypto.randomUUID(), kind:"count", family, answer:String(levels), commonWrong:String(levels-1), title:"Kaç kare var?", subtitle:"İç içe olanları tek tek say", data:{levels} };
  }
  const rows = pick([3,4]);
  const cols = pick([4,5,6]);
  let rectangles = 0;
  for(let h=1; h<=rows; h+=1) for(let w=1; w<=cols; w+=1) rectangles += (rows-h+1)*(cols-w+1);
  return { id:crypto.randomUUID(), kind:"count", family, answer:String(rectangles), commonWrong:String(rows*cols), title:"Toplam kaç dikdörtgen var?", subtitle:"Küçük kutular sadece başlangıç", data:{rows,cols} };
}

function makeAlgebra(): Puzzle {
  const family = pick(["power", "linear", "sum-product", "ratio"]);
  if (family === "power") {
    const b = pick([2,3,4,5,6]);
    const k = pick([2,3,4,5,6,7,8]);
    const rhs = k * b * b;
    const answer = b * b * b;
    return { id:crypto.randomUUID(), kind:"algebra", family, answer:String(answer), commonWrong:String(rhs), title:"Tek adım görünüyor, iki adım var", subtitle:"b³ kaç?", data:{k,rhs,b} };
  }
  if (family === "linear") {
    const x = randomInt(4,18);
    const a = randomInt(2,8);
    const b = randomInt(3,20);
    const rhs = a*x+b;
    return { id:crypto.randomUUID(), kind:"algebra", family, answer:String(x), commonWrong:String(Math.round(rhs/a)), title:"x kaç?", subtitle:"İlk işlemde hata yapma", data:{a,b,rhs} };
  }
  if (family === "sum-product") {
    const x = randomInt(3,9);
    const y = randomInt(2,8);
    const sum = x+y;
    const product = x*y;
    const sq = x*x+y*y;
    return { id:crypto.randomUUID(), kind:"algebra", family, answer:String(sq), commonWrong:String(sum*sum), title:"a² + b² kaç?", subtitle:"Toplamın karesine dikkat", data:{sum,product} };
  }
  const factor = pick([2,3,4,5]);
  const x = factor * randomInt(3,9);
  const y = factor * randomInt(2,8);
  const total = x+y;
  return { id:crypto.randomUUID(), kind:"algebra", family, answer:String(x), commonWrong:String(y), title:"x kaç?", subtitle:"Oranı doğru oku", data:{x,y,total,ratioA:x/factor,ratioB:y/factor} };
}

function makeArea(): Puzzle {
  const family = pick(["rectangle-side", "shaded", "step-distance", "triangle-area"]);
  if (family === "rectangle-side") {
    const w = randomInt(4,12);
    const h = randomInt(3,10);
    return { id:crypto.randomUUID(), kind:"area", family, answer:String(w), commonWrong:String(h), title:"Eksik kenar kaç?", subtitle:"Alanı kullan", data:{area:w*h,h,w} };
  }
  if (family === "shaded") {
    const a = pick([4,5,6,7,8]);
    const b = pick([3,4,5,6]);
    const big = a*a;
    const cut = b*b;
    return { id:crypto.randomUUID(), kind:"area", family, answer:String(big-cut), commonWrong:String(big+cut), title:"Boyalı alan kaç?", subtitle:"Dışarıyı değil içeriyi çıkar", data:{a,b} };
  }
  if (family === "step-distance") {
    const h1 = randomInt(4,8);
    const h2 = randomInt(3,7);
    const v1 = randomInt(7,12);
    const v2 = randomInt(2,5);
    const dx = h1 + h2;
    const dy = v1 - v2;
    const dist = Math.sqrt(dx*dx+dy*dy);
    const rounded = Math.round(dist*10)/10;
    return { id:crypto.randomUUID(), kind:"area", family, answer:String(rounded), commonWrong:String(dx+dy), title:"A ile E arası kaç?", subtitle:"Kırmızı çizgiyi hesapla", data:{h1,h2,v1,v2,dx,dy} };
  }
  const base = pick([6,8,10,12,14]);
  const height = pick([4,6,8,10]);
  return { id:crypto.randomUUID(), kind:"area", family, answer:String(base*height/2), commonWrong:String(base*height), title:"Üçgenin alanı kaç?", subtitle:"Yarıyı unutma", data:{base,height} };
}

function generate(kind: PuzzleKind, recent: string[]): Puzzle {
  const maker = kind === "math" ? makeMath : kind === "geometry" ? makeGeometry : kind === "count" ? makeCount : kind === "algebra" ? makeAlgebra : makeArea;
  for (let i=0;i<40;i+=1) {
    const next = maker();
    const sig = signature(next.kind,next.family,next.data);
    if (!recent.includes(sig)) return next;
  }
  return maker();
}

function ctaFor(locale: AqryoLocale, puzzle: Puzzle) {
  const tr: Record<PuzzleKind,string[]> = {
    math:["İşlem önceliğine güveniyorsan cevabı yaz 👇","Çoğu kişi burada aynı hatayı yapıyor.","Kalem yok, hesap makinesi yok. Sonuç kaç?"],
    geometry:["Kalem kullanmadan çözebilir misin?","İlk cevabına güveniyor musun? x kaç?","Bu açı sorusu göründüğünden daha sinsi."],
    count:["İlk gördüğünü sayıp geçme 👀","Tek tek saydığından emin misin?","Çoğu kişi küçük şekillerde kalıyor."],
    algebra:["Kafadan çözebilir misin?","Tek bir detay sonucu değiştiriyor.","İlk adımı doğru yapan devamını getirir."],
    area:["Şekle iyi bak. Cevap kaç?","Kısa yol var ama herkes görmüyor.","Kalem kullanmadan bulabilir misin?"],
  };
  const en: Record<PuzzleKind,string[]> = {
    math:["Trust your order of operations? Drop the answer 👇","Most people make the same mistake here.","No pen. No calculator. What is the result?"],
    geometry:["Can you solve it without a pen?","Trust your first answer? Find x.","This angle puzzle is trickier than it looks."],
    count:["Don’t stop at what you see first 👀","Are you sure you counted them all?","Most people only count the small shapes."],
    algebra:["Can you solve it in your head?","One detail changes the result.","Get the first step right and the rest follows."],
    area:["Look closely. What is the answer?","There is a shortcut most people miss.","Can you solve it without a pen?"],
  };
  return pick(locale === "tr" ? tr[puzzle.kind] : en[puzzle.kind]);
}

function PuzzleBuilderPage() {
  const { locale, t } = useAqryoLocale();
  const [loading,setLoading]=useState(true);
  const [kind,setKind]=useState<PuzzleKind>("math");
  const [presentation,setPresentation]=useState<Presentation>("clean");
  const [recent,setRecent]=useState<string[]>([]);
  const [puzzle,setPuzzle]=useState<Puzzle>(()=>makeMath());
  const [socialText,setSocialText]=useState("");
  const [copied,setCopied]=useState(false);
  const [sharing,setSharing]=useState(false);
  const previewRef=useRef<HTMLDivElement|null>(null);
  const svgRef=useRef<SVGSVGElement|null>(null);

  useEffect(()=>{
    let cancelled=false;
    void getCurrentCreator().then((creator)=>{
      if(!creator){ window.location.href="/creator-auth"; return; }
      if(!cancelled) setLoading(false);
    });
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{ setSocialText(ctaFor(locale,puzzle)); },[locale,puzzle]);

  function chooseKind(next:PuzzleKind){
    setKind(next);
    const fresh=generate(next,recent);
    setPuzzle(fresh);
    setPresentation("clean");
    remember(fresh);
  }

  function remember(next:Puzzle){
    const sig=signature(next.kind,next.family,next.data);
    setRecent((old)=>[sig,...old.filter((x)=>x!==sig)].slice(0,RECENT_LIMIT));
  }

  function regenerate(){
    const fresh=generate(kind,recent);
    setPuzzle(fresh);
    remember(fresh);
    setCopied(false);
    window.setTimeout(()=>previewRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }

  const answer=puzzle.answer;
  const commonWrong=puzzle.commonWrong;

  function serializeSvg(){
    if(!svgRef.current) return null;
    return new XMLSerializer().serializeToString(svgRef.current);
  }

  function downloadSvg(){
    const source=serializeSvg(); if(!source) return;
    const blob=new Blob([source],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`aqryo-${puzzle.kind}-${puzzle.family}.svg`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function copyText(){
    await navigator.clipboard.writeText(socialText);
    setCopied(true); window.setTimeout(()=>setCopied(false),1200);
  }

  async function share(){
    if(sharing) return;
    try{
      setSharing(true);
      const source=serializeSvg(); if(!source) throw new Error("Visual unavailable");
      const blob=new Blob([source],{type:"image/svg+xml"});
      const file=new File([blob],`aqryo-${puzzle.kind}.svg`,{type:"image/svg+xml"});
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        await navigator.share({files:[file],text:socialText,title:"AQRYO"});
      } else {
        downloadSvg();
        const x=new URL("https://twitter.com/intent/tweet");
        x.searchParams.set("text",socialText);
        window.open(x.toString(),"_blank","noopener,noreferrer");
      }
    }catch(error){
      if(!(error instanceof DOMException && error.name==="AbortError")) console.error(error);
    }finally{setSharing(false)}
  }

  if(loading) return <LoadingScreen/>;

  const kinds:Array<[PuzzleKind,string,string]> = [
    ["math",t("math"),"Fikir ayrılığı yaratan işlemler"],
    ["geometry",t("geometry"),"Açı ve çizgi tuzakları"],
    ["count",t("count"),"Kare, dikdörtgen ve iç içe şekiller"],
    ["algebra",t("algebra"),"Kısa cebir meydan okumaları"],
    ["area",t("area"),"Alan, kenar ve mesafe"],
  ];

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation onSignOut={async()=>{await signOutCreator();window.location.href="/creator-auth";}}/>

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-600">{t("puzzleEngine")}</p>
            <h1 className="mt-1 text-[30px] font-black tracking-[-0.055em]">{t("puzzle")}</h1>
          </div>
          <Link to="/creator-studio" className="rounded-full border border-border bg-white px-5 py-3 text-[12px] font-black text-muted-foreground">{t("backToStudio")}</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-9">
        <section className="space-y-5">
          <div className="rounded-[30px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-violet-600">1 · {t("questionType")}</p>
            <h2 className="mt-3 text-[31px] font-black leading-tight tracking-[-0.055em]">{t("viralInFive")}</h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {kinds.map(([value,title,description])=>(
                <PuzzleTypeButton key={value} active={kind===value} title={title} description={description} onClick={()=>chooseKind(value)}/>
              ))}
            </div>

            <p className="mt-6 text-[12px] font-black">{t("presentation")}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Choice active={presentation==="clean"} title={t("clean")} description="Tek soru · temiz kart" onClick={()=>setPresentation("clean")}/>
              <Choice active={presentation==="debate"} title={t("debate")} description="Sabit iki taraflı tartışma kartı" onClick={()=>setPresentation("debate")}/>
            </div>

            <button type="button" onClick={regenerate} className="mt-6 h-13 rounded-full bg-black px-7 py-3.5 text-[13px] font-black text-white">
              {t("newQuestion")} ↻
            </button>
          </div>

          <div className="rounded-[30px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-violet-600">2 · {t("cta")}</p>
            <textarea rows={4} value={socialText} onChange={(e)=>setSocialText(e.target.value)}
              className="mt-4 w-full resize-none rounded-[20px] border border-border bg-background px-5 py-4 text-[15px] font-bold leading-7 outline-none focus:border-violet-400"/>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={sharing} onClick={()=>void share()} className="rounded-full bg-violet-600 px-6 py-3 text-[13px] font-black text-white">{sharing?"...":t("share")} →</button>
              <button onClick={()=>void copyText()} className="rounded-full border border-border bg-white px-6 py-3 text-[13px] font-black">{copied?"✓":t("copyText")}</button>
              <button onClick={downloadSvg} className="rounded-full border border-border bg-white px-6 py-3 text-[13px] font-black">{t("downloadSvg")}</button>
            </div>
          </div>

          <div className="grid gap-3 rounded-[26px] border border-violet-100 bg-violet-50/70 p-5 sm:grid-cols-2">
            <div><p className="text-[11px] font-black text-violet-950">{t("correctAnswer")}</p><p className="mt-2 text-[28px] font-black text-violet-800">{answer}</p></div>
            <div><p className="text-[11px] font-black text-violet-950">{t("commonWrong")}</p><p className="mt-2 text-[28px] font-black text-rose-600">{commonWrong}</p></div>
          </div>
        </section>

        <aside ref={previewRef} className="scroll-mt-40 lg:sticky lg:top-[110px] lg:self-start">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{t("shareVisual")}</p>
          <div className="overflow-hidden rounded-[32px] border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(56,27,90,0.11)]">
            <PuzzleSvg ref={svgRef} puzzle={puzzle} presentation={presentation}/>
          </div>
        </aside>
      </div>
    </main>
  );
}

const PuzzleSvg=React.forwardRef<SVGSVGElement,{puzzle:Puzzle;presentation:Presentation}>(
function PuzzleSvg({puzzle,presentation},ref){
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" className="w-full rounded-[24px]">
      <rect width="360" height="480" rx="28" fill="#fbfafc"/>
      <circle cx="48" cy="45" r="20" fill="#74f0de"/>
      <text x="48" y="52" textAnchor="middle" fontSize="19" fontWeight="900" fill="#17101f">Q</text>
      <text x="78" y="51" fontSize="14" fontWeight="900" fill="#17101f">AQRYO</text>
      <text x="180" y="95" textAnchor="middle" fontSize="20" fontWeight="900" fill="#17101f">{puzzle.title}</text>

      <PuzzleBody puzzle={puzzle}/>

      {presentation==="debate" ? (
        <>
          <rect x="24" y="370" width="146" height="66" rx="22" fill="#ede9fe"/>
          <circle cx="49" cy="403" r="14" fill="#7c3aed"/>
          <text x="49" y="409" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">A</text>
          <text x="75" y="410" fontSize="20" fontWeight="900" fill="#17101f">{puzzle.answer}</text>

          <rect x="190" y="370" width="146" height="66" rx="22" fill="#ffe4e6"/>
          <circle cx="215" cy="403" r="14" fill="#e11d48"/>
          <text x="215" y="409" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">B</text>
          <text x="241" y="410" fontSize="20" fontWeight="900" fill="#17101f">{puzzle.commonWrong}</text>
          <text x="180" y="462" textAnchor="middle" fontSize="18" fontWeight="900" fill="#6d28d9">Kim haklı?</text>
        </>
      ) : (
        <text x="180" y="440" textAnchor="middle" fontSize="18" fontWeight="900" fill="#6b7280">{puzzle.subtitle}</text>
      )}
    </svg>
  );
});

function PuzzleBody({puzzle}:{puzzle:Puzzle}){
  const d=puzzle.data;
  if(puzzle.kind==="math"){
    return <text x="180" y="245" textAnchor="middle" fontSize="42" fontWeight="900" fill="#17101f">{String(d.expression)}</text>;
  }

  if(puzzle.kind==="geometry"){
    if(puzzle.family==="triangle-sum"){
      return <>
        <path d="M70 330L180 135L295 330Z" fill="none" stroke="#17101f" strokeWidth="7" strokeLinejoin="round"/>
        <text x="86" y="315" fontSize="20" fontWeight="900">{String(d.a)}°</text>
        <text x="255" y="315" fontSize="20" fontWeight="900">{String(d.b)}°</text>
        <text x="172" y="175" fontSize="25" fontWeight="900" fill="#7c3aed">x</text>
      </>;
    }
    if(puzzle.family==="exterior"){
      return <>
        <path d="M75 330L175 150L290 330Z" fill="none" stroke="#17101f" strokeWidth="7"/>
        <path d="M175 150L215 88" stroke="#17101f" strokeWidth="7" strokeLinecap="round"/>
        <text x="84" y="314" fontSize="20" fontWeight="900">{String(d.a)}°</text>
        <text x="205" y="152" fontSize="21" fontWeight="900" fill="#e0524d">{String(d.exterior)}°</text>
        <text x="248" y="312" fontSize="25" fontWeight="900" fill="#7c3aed">x</text>
      </>;
    }
    if(puzzle.family==="isosceles"){
      return <>
        <path d="M75 330L180 135L285 330Z" fill="none" stroke="#17101f" strokeWidth="7"/>
        <path d="M100 274L121 286M260 274L239 286" stroke="#7c3aed" strokeWidth="5"/>
        <text x="166" y="177" fontSize="20" fontWeight="900">{String(d.apex)}°</text>
        <text x="90" y="316" fontSize="25" fontWeight="900" fill="#7c3aed">x</text>
      </>;
    }
    if(puzzle.family==="right-angle"){
      return <>
        <path d="M85 325L85 145L295 325Z" fill="none" stroke="#17101f" strokeWidth="7"/>
        <path d="M85 300H110V325" fill="none" stroke="#7c3aed" strokeWidth="5"/>
        <text x="102" y="178" fontSize="21" fontWeight="900">{String(d.a)}°</text>
        <text x="245" y="310" fontSize="25" fontWeight="900" fill="#7c3aed">x</text>
      </>;
    }
    return <>
      <path d="M45 175H315M45 320H315" stroke="#17101f" strokeWidth="7"/>
      <path d="M105 115L250 380" stroke="#17101f" strokeWidth="7"/>
      <text x="118" y="180" fontSize="20" fontWeight="900">{String(d.a)}°</text>
      <text x="222" y="312" fontSize="25" fontWeight="900" fill="#7c3aed">x</text>
    </>;
  }

  if(puzzle.kind==="count"){
    if(puzzle.family==="nested"){
      const levels=Number(d.levels);
      return <>{Array.from({length:levels},(_,i)=><rect key={i} x={70+i*12} y={140+i*12} width={220-i*24} height={220-i*24} fill="none" stroke="#17101f" strokeWidth="4"/>)}</>;
    }
    const rows=Number(d.rows), cols=Number(d.cols);
    const x0=55,y0=145,w=250,h=200,cellW=w/cols,cellH=h/rows;
    return <>
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#17101f" strokeWidth="6"/>
      {Array.from({length:cols-1},(_,i)=><line key={"v"+i} x1={x0+(i+1)*cellW} y1={y0} x2={x0+(i+1)*cellW} y2={y0+h} stroke="#17101f" strokeWidth="4"/>)}
      {Array.from({length:rows-1},(_,i)=><line key={"h"+i} x1={x0} y1={y0+(i+1)*cellH} x2={x0+w} y2={y0+(i+1)*cellH} stroke="#17101f" strokeWidth="4"/>)}

    </>;
  }

  if(puzzle.kind==="algebra"){
    if(puzzle.family==="power") return <>
      <text x="180" y="205" textAnchor="middle" fontSize="34" fontWeight="900">{String(d.k)}b² = {String(d.rhs)}</text>
      <text x="180" y="280" textAnchor="middle" fontSize="38" fontWeight="900" fill="#7c3aed">b³ = ?</text>
    </>;
    if(puzzle.family==="linear") return <>
      <text x="180" y="220" textAnchor="middle" fontSize="40" fontWeight="900">{String(d.a)}x + {String(d.b)} = {String(d.rhs)}</text>
      <text x="180" y="290" textAnchor="middle" fontSize="36" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;
    if(puzzle.family==="sum-product") return <>
      <text x="180" y="190" textAnchor="middle" fontSize="29" fontWeight="900">a + b = {String(d.sum)}</text>
      <text x="180" y="235" textAnchor="middle" fontSize="29" fontWeight="900">ab = {String(d.product)}</text>
      <text x="180" y="300" textAnchor="middle" fontSize="34" fontWeight="900" fill="#7c3aed">a² + b² = ?</text>
    </>;
    return <>
      <text x="180" y="205" textAnchor="middle" fontSize="30" fontWeight="900">x : y = {String(d.ratioA)} : {String(d.ratioB)}</text>
      <text x="180" y="255" textAnchor="middle" fontSize="28" fontWeight="900">x + y = {String(d.total)}</text>
      <text x="180" y="310" textAnchor="middle" fontSize="34" fontWeight="900" fill="#7c3aed">x = ?</text>
    </>;
  }

  if(puzzle.family==="rectangle-side"){
    return <>
      <rect x="80" y="155" width="200" height="150" fill="none" stroke="#17101f" strokeWidth="7"/>
      <text x="180" y="235" textAnchor="middle" fontSize="32" fontWeight="900">{String(d.area)} m²</text>
      <text x="48" y="235" fontSize="22" fontWeight="900">{String(d.h)}m</text>
      <text x="165" y="340" fontSize="27" fontWeight="900" fill="#7c3aed">x</text>
    </>;
  }
  if(puzzle.family==="shaded"){
    return <>
      <rect x="75" y="145" width="210" height="210" fill="#ede9fe" stroke="#17101f" strokeWidth="7"/>
      <rect x="155" y="225" width="90" height="90" fill="#fbfafc" stroke="#17101f" strokeWidth="5"/>
      <text x="82" y="135" fontSize="19" fontWeight="900">{String(d.a)}m</text>
      <text x="162" y="218" fontSize="18" fontWeight="900">{String(d.b)}m</text>
    </>;
  }
  if(puzzle.family==="step-distance"){
    return <>
      <path d="M70 145H190V320H290V250" fill="none" stroke="#17101f" strokeWidth="7"/>
      <path d="M70 145L290 250" fill="none" stroke="#e0524d" strokeWidth="7"/>
      <text x="113" y="132" fontSize="18" fontWeight="900">{String(d.h1)}m</text>
      <text x="235" y="340" fontSize="18" fontWeight="900">{String(d.h2)}m</text>
      <text x="198" y="230" fontSize="18" fontWeight="900">{String(d.v1)}m</text>
      <text x="298" y="290" fontSize="18" fontWeight="900">{String(d.v2)}m</text>
    </>;
  }
  return <>
    <path d="M75 325L180 145L290 325Z" fill="none" stroke="#17101f" strokeWidth="7"/>
    <line x1="180" y1="145" x2="180" y2="325" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 8"/>
    <text x="160" y="350" fontSize="20" fontWeight="900">{String(d.base)}m</text>
    <text x="190" y="240" fontSize="20" fontWeight="900">{String(d.height)}m</text>
  </>;
}

function PuzzleTypeButton({active,title,description,onClick}:{active:boolean;title:string;description:string;onClick:()=>void}){
  return <button type="button" onClick={onClick} className={`rounded-[22px] border p-4 text-left transition ${active?"border-violet-500 bg-violet-50 shadow-[0_12px_30px_rgba(124,58,237,.1)]":"border-border bg-white"}`}>
    <p className="text-[15px] font-black">{title}</p>
    <p className="mt-1 text-[11px] font-semibold leading-5 text-muted-foreground">{description}</p>
  </button>;
}

function Choice({active,title,description,onClick}:{active:boolean;title:string;description:string;onClick:()=>void}){
  return <button type="button" onClick={onClick} className={`rounded-[20px] border px-4 py-4 text-left ${active?"border-violet-500 bg-violet-50":"border-border bg-white"}`}>
    <p className="text-[14px] font-black">{title}</p>
    <p className="mt-1 text-[12px] font-semibold text-muted-foreground">{description}</p>
  </button>;
}

function LoadingScreen(){
  return <main className="min-h-screen bg-[#f7f5fb]"><div className="mx-auto max-w-[1280px] px-4 py-10"><div className="h-[360px] animate-pulse rounded-[30px] bg-white"/></div></main>;
}
