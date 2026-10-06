import { useRef, useState } from "react";
import { STORY_TEMPLATES, storyTemplateStyle, type StoryTemplateId } from "@/lib/storyTemplates";
import { StoryPage } from "./StoryPage";

export function QuickStoryComposer({ locale, text, title, templateId, pages, items, publishing, sourceVersion, onText, onTitle, onTemplate, onAdvanced, onPublish }: {
  locale: string; text: string; title: string; templateId: string; pages: string[]; items: Array<{ type: "text"; text: string } | { type: "image"; imageUrl: string }>; publishing: boolean; sourceVersion: boolean;
  onText: (text: string) => void; onTitle: (title: string) => void; onTemplate: (id: StoryTemplateId) => void; onAdvanced: () => void; onPublish: () => void;
}) {
  const tr = locale === "tr";
  const previewRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState(false);
  const slides = items.filter((item) => item.type === "text" ? item.text.trim() : item.imageUrl.trim());
  const index = Math.min(selected, Math.max(0, slides.length - 1));
  const active = slides[index];
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-bold text-violet-600">AQRYO / STORY</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{tr ? "Metnin hazırsa, hikâyen de hazır." : "Your text is ready. So is your story."}</h1><p className="mt-3 text-base text-muted-foreground">{tr ? "Metni yapıştır → dokunu seç → önizle → yayınla." : "Paste your text → choose a look → preview → publish."}</p></div>
      <button type="button" onClick={onAdvanced} className="rounded-full border bg-white px-4 py-2 text-sm font-bold">{tr ? "Sayfaları tek tek düzenle" : "Edit individual pages"}</button>
    </div>
    {sourceVersion && <p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{tr ? "Yayındaki hikâyen korunur. Düzenleme yeni sürüm olarak yayınlanır." : "Your live story stays unchanged. Edits publish as a new version."}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 sm:p-6">
          <label htmlFor="story-full-text" className="text-xl font-black">{tr ? "1. Hikâyeni buraya yapıştır" : "1. Paste your story"}</label>
          <p className="mt-2 text-sm text-muted-foreground">{tr ? "Başlığı ve sayfaları otomatik hazırlıyoruz. Metnin değişmez." : "We suggest a title and split the pages. Your words stay yours."}</p>
          <textarea id="story-full-text" dir="auto" maxLength={20000} value={text} onChange={(event) => { onText(event.target.value); setPreview(false); }} rows={9} placeholder={tr ? "Dün başıma öyle bir şey geldi ki…\n\nHikâyenin tamamını tek seferde yapıştır." : "Something happened yesterday…\n\nPaste your entire story here."} className="mt-4 w-full resize-y rounded-2xl border bg-stone-50 p-4 text-base leading-7 outline-none focus:border-violet-500" />
          <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground"><span>{slides.length} {tr ? "sayfa" : "pages"}</span><span>{text.length.toLocaleString()}/20.000</span></div>
          <details className="mt-4 rounded-xl border p-3"><summary className="cursor-pointer text-sm font-bold">{tr ? "Başlığı değiştir (isteğe bağlı)" : "Edit title (optional)"}</summary><label htmlFor="story-quick-title" className="sr-only">{tr ? "Hikâye başlığı" : "Story title"}</label><input id="story-quick-title" dir="auto" maxLength={120} value={title} onChange={(event) => onTitle(event.target.value)} className="mt-3 w-full rounded-xl border p-3 text-base" /></details>
        </div>
        <div className="rounded-3xl border bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black">{tr ? "2. Hikâyenin dokusunu seç" : "2. Choose your story’s look"}</h2><p className="mt-2 text-sm text-muted-foreground">{tr ? "Kapak ve metin sayfaları aynı tasarım dilinde. Görsel aramak zorunda değilsin." : "One look for the cover and every text page. No image hunting."}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">{STORY_TEMPLATES.map((template) => <button key={template.id} type="button" aria-pressed={template.id === templateId} onClick={() => onTemplate(template.id)} className={`overflow-hidden rounded-2xl border-2 p-1 text-left ${template.id === templateId ? "border-violet-600" : "border-transparent"}`}>
            <div style={storyTemplateStyle(template.id)} className="flex h-24 flex-col justify-between rounded-xl p-3"><span className="text-xs opacity-60">AQRYO.</span><span className="text-2xl font-bold">Aa</span></div><span className="block p-2 text-sm font-bold">{tr ? template.name : template.en}{template.id === templateId ? " ✓" : ""}</span>
          </button>)}</div>
        </div>
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur">
          <button type="button" disabled={!pages.length} onClick={() => { setPreview(!preview); setSelected(0); previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="flex-1 rounded-xl border px-4 py-3 font-bold disabled:opacity-40">{tr ? "Önizle" : "Preview"}</button>
          <button type="button" disabled={!pages.length || !title.trim() || publishing} onClick={onPublish} className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white disabled:opacity-40">{publishing ? (tr ? "Yayınlanıyor…" : "Publishing…") : sourceVersion ? (tr ? "Yeni sürümü yayınla" : "Publish new version") : (tr ? "Yayınla →" : "Publish →")}</button>
          <p className="w-full text-center text-xs text-muted-foreground">{tr ? "Kapak görseli görünen V2 bağlantısıyla paylaşılır." : "Share a V2 link with its cover preview."}</p>
        </div>
      </section>
      <aside ref={previewRef} className="scroll-mt-64 min-w-0 lg:sticky lg:top-56 lg:self-start">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black">{preview ? (tr ? "Okuyucunun göreceği" : "Reader preview") : (tr ? "Canlı önizleme" : "Live preview")}</h2><span className="text-xs font-bold text-muted-foreground">{index + 1}/{Math.max(1, slides.length)}</span></div>
        {!preview && <div style={storyTemplateStyle(templateId)} className="mb-4 rounded-2xl border border-black/10 p-5"><p className="text-xs font-bold opacity-60">{tr ? "OTOMATİK KAPAK" : "AUTOMATIC COVER"}</p><p dir="auto" className="mt-4 break-words text-2xl font-bold leading-tight">{title || (tr ? "Hikâyenin başlığı burada" : "Your story title")}</p></div>}
        {active?.type === "image" ? <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-white p-3"><img src={active.imageUrl} alt="" className="max-h-[520px] max-w-full object-contain" /></div> : <StoryPage text={active?.text || (tr ? "Metnini yapıştırdığında hikâyen burada görünür." : "Paste your text to see your story here.")} title={title} templateId={templateId} page={index + 1} total={Math.max(1, slides.length)} />}
        <div className="mt-3 flex gap-3"><button type="button" disabled={index === 0} onClick={() => setSelected(index - 1)} className="flex-1 rounded-xl border bg-white py-3 font-bold disabled:opacity-30">← {tr ? "Önceki" : "Previous"}</button><button type="button" disabled={index >= slides.length - 1} onClick={() => setSelected(index + 1)} className="flex-1 rounded-xl border bg-white py-3 font-bold disabled:opacity-30">{tr ? "Sonraki" : "Next"} →</button></div>
      </aside>
    </div>
  </div>;
}
