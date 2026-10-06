import { useState } from "react";
import type { PaidVisualPack } from "@/services/visual-packs";
import { VISUAL_PACK_PREVIEWS } from "@/lib/visualPackPreviews";

export default function VisualPackPreviewGallery({ pack, label }: { pack: PaidVisualPack; label: string }) {
  const [selected, setSelected] = useState(0);
  const previews = VISUAL_PACK_PREVIEWS[pack];
  const current = previews[selected];

  return <section aria-label={label} className="space-y-3">
    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
      <span>{label} · {current.group}</span>
      <span aria-live="polite" dir="ltr">{selected + 1} / {previews.length}</span>
    </div>
    <div className="flex justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 via-slate-100 to-cyan-100 p-2">
      <img src={current.src} alt={`${label} ${selected + 1} · ${current.group}`}
        width={320} height={400} className="h-[min(30dvh,280px)] w-auto max-w-full rounded-xl object-contain" />
    </div>
    <div className="grid grid-cols-5 gap-2">
      {previews.map((preview, index) => <button key={index} type="button" onClick={() => setSelected(index)}
        aria-label={`${label} ${index + 1} · ${preview.group}`} aria-pressed={selected === index}
        className={`overflow-hidden rounded-xl border-2 p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${selected === index ? "border-violet-600 bg-violet-100" : "border-transparent opacity-70 hover:opacity-100"}`}>
        <img src={preview.src} alt="" width={320} height={400} className="aspect-[4/5] w-full rounded-lg object-cover" />
      </button>)}
    </div>
  </section>;
}
