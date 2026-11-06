import { FLOW_EDITOR_COPY } from "@/lib/flowEditorCopy";
import { ANONYMOUS_BUILDER_COPY } from "@/lib/anonymousBuilderCopy";
import { getCompatibilityCopy } from "@/lib/compatibilityCopy";
import { normalizeLocale } from "@/lib/i18n";
import { getFlowCopy } from "@/lib/flowCopy";
import { useRef, useState } from "react";
import { STORY_TEMPLATES, storyTemplateStyle, type StoryTemplateId } from "@/lib/storyTemplates";
import { StoryPage } from "./StoryPage";
import { imageTextPosition, type StoryImageItem, type StoryItem } from "@/lib/storyItems";

export function QuickStoryComposer({ locale, text, title, templateId, pages, items, coverImageId, coverImageUrl, publishing, uploading, uploadError, sourceVersion, onText, onTitle, onTemplate, onImages, onRemoveImage, onImagePosition, onAdvanced, onPublish }: {
  locale: string; text: string; title: string; templateId: string; pages: string[]; items: StoryItem[]; coverImageId?: string; coverImageUrl: string; publishing: boolean; uploading: boolean; uploadError: string; sourceVersion: boolean;
  onText: (text: string) => void; onTitle: (title: string) => void; onTemplate: (id: StoryTemplateId) => void; onAdvanced: () => void; onPublish: () => void;
  onImages: (files: File[]) => void; onRemoveImage: (id: string) => void; onImagePosition: (id: string, afterPage: number) => void;
}) {
  const ui = FLOW_EDITOR_COPY[normalizeLocale(locale)];
  const shared = ANONYMOUS_BUILDER_COPY[normalizeLocale(locale)];
  const common = getCompatibilityCopy(locale);
  const flow = getFlowCopy(locale);
  const previewRef = useRef<HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState(false);
  const slides = items.filter(item => item.id !== coverImageId).filter((item) => item.type === "text" ? item.text.trim() : item.imageUrl.trim());
  const images = items.filter((item): item is StoryImageItem => item.type === "image" && Boolean(item.imageUrl.trim()));
  const busy = uploading || publishing;
  const index = Math.min(selected, Math.max(0, slides.length - 1));
  const active = slides[index];
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-bold text-violet-600">AQRYO / {flow.name}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{flow.headline}</h1><p className="mt-3 text-base text-muted-foreground">{ui.instructions}</p></div>
      <button type="button" disabled={busy} onClick={onAdvanced} className="rounded-full border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">{common.advanced}</button>
    </div>
    {sourceVersion && <p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{flow.version}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-5">
        <div className="rounded-3xl border bg-white p-5 sm:p-6">
          <label htmlFor="story-full-text" className="text-xl font-black">{"1. " + flow.paste}</label>
          <p className="mt-2 text-sm text-muted-foreground">{ui.textHint}</p>
          <textarea id="story-full-text" dir="auto" maxLength={20000} value={text} onChange={(event) => { onText(event.target.value); setPreview(false); }} rows={9} placeholder={flow.placeholder} className="mt-4 w-full resize-y rounded-2xl border bg-stone-50 p-4 text-base leading-7 outline-none focus:border-violet-500" />
          <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground"><span>{slides.length} {ui.pages}</span><span>{text.length.toLocaleString(locale)}/20.000</span></div>
          <details className="mt-4 rounded-xl border p-3"><summary className="cursor-pointer text-sm font-bold">{ui.editTitle}</summary><label htmlFor="story-quick-title" className="sr-only">{flow.title}</label><input id="story-quick-title" dir="auto" maxLength={120} value={title} onChange={(event) => onTitle(event.target.value)} className="mt-3 w-full rounded-xl border p-3 text-base" /></details>
        </div>
        <div className="rounded-3xl border bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">{"2. " + ui.imagesOptional}</h2>
            <button type="button" disabled={busy} onClick={() => imageInputRef.current?.click()} className="rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{uploading ? (flow.uploading) : ("+ " + flow.images)}</button>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{ui.imagesHint}</p>
          <p className="mt-2 text-xs text-muted-foreground">{"JPG / PNG · ≤ 8 MB"}</p>
          <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png" disabled={busy} aria-label={flow.images} className="sr-only" onChange={event => { const files = Array.from(event.currentTarget.files ?? []); event.currentTarget.value = ""; if (files.length) onImages(files); }} />
          {uploading ? <p role="status" className="mt-3 text-sm font-bold text-violet-700">{flow.uploading}</p> : null}
          {uploadError ? <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{uploadError}</p> : null}
          <div className="mt-4 space-y-3">{images.map((image, imageIndex) => <div key={image.id} className="flex flex-wrap items-center gap-3 rounded-2xl border p-3 sm:flex-nowrap">
            <button type="button" onClick={() => { setSelected(Math.max(0, slides.findIndex(item => item.id === image.id))); setPreview(image.id !== coverImageId); previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-label={common.preview + " " + (imageIndex + 1)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-50"><img src={image.imageUrl} alt="" className="h-full w-full object-contain" /></button>
            <div className="min-w-0 flex-1"><label htmlFor={"story-image-position-" + image.id} className="block text-xs font-bold">{flow.position}</label>
              <select id={"story-image-position-" + image.id} disabled={busy} value={image.id === coverImageId ? 0 : Math.max(1, imageTextPosition(items, image.id))} onChange={event => onImagePosition(image.id, Number(event.target.value))} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm">
                <option value={0}>{flow.cover}</option>
                {pages.map((_, pageIndex) => <option key={pageIndex} value={pageIndex + 1}>{ui.afterPage.replace("{n}", String(pageIndex + 1))}</option>)}
              </select>
            </div>
            <button type="button" disabled={busy} onClick={() => onRemoveImage(image.id)} aria-label={common.remove + " " + (imageIndex + 1)} className="rounded-full px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40">{common.remove}</button>
          </div>)}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black">{"3. " + flow.look}</h2><p className="mt-2 text-sm text-muted-foreground">{ui.lookHint}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">{STORY_TEMPLATES.map((template) => <button key={template.id} type="button" aria-pressed={template.id === templateId} onClick={() => onTemplate(template.id)} className={`overflow-hidden rounded-2xl border-2 p-1 text-start ${template.id === templateId ? "border-violet-600" : "border-transparent"}`}>
            <div style={storyTemplateStyle(template.id)} className="flex h-24 flex-col justify-between rounded-xl p-3"><span className="text-xs opacity-60">AQRYO.</span><span className="text-2xl font-bold">Aa</span></div><span className="block p-2 text-sm font-bold">{ui[template.id]}{template.id === templateId ? " ✓" : ""}</span>
          </button>)}</div>
        </div>
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur">
          <button type="button" disabled={!slides.length} onClick={() => { setPreview(!preview); setSelected(0); previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="flex-1 rounded-xl border px-4 py-3 font-bold disabled:opacity-40">{common.preview}</button>
          <button type="button" disabled={!slides.length || !title.trim() || busy} onClick={onPublish} className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white disabled:opacity-40">{publishing ? (shared.publishing) : sourceVersion ? (ui.publishNew) : (common.publish)}</button>
          <p className="w-full text-center text-xs text-muted-foreground">{flow.share}</p>
        </div>
      </section>
      <aside ref={previewRef} className="scroll-mt-64 min-w-0 lg:sticky lg:top-56 lg:self-start">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black">{preview ? (ui.readerPreview) : (shared.livePreview)}</h2><span className="text-xs font-bold text-muted-foreground">{index + 1}/{Math.max(1, slides.length)}</span></div>
        {!preview && (coverImageUrl ? <div className="mb-4 overflow-hidden rounded-2xl border bg-white"><p className="px-4 py-3 text-xs font-bold">{flow.cover}</p><img src={coverImageUrl} alt={flow.cover} className="max-h-[520px] w-full object-contain" /></div> : <div style={storyTemplateStyle(templateId)} className="mb-4 rounded-2xl border border-black/10 p-5"><p className="text-xs font-bold opacity-60">{ui.autoCover}</p><p dir="auto" className="mt-4 break-words text-2xl font-bold leading-tight">{title || (flow.title)}</p></div>)}
        {active?.type === "image" ? <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-white p-3"><img src={active.imageUrl} alt="" className="max-h-[520px] max-w-full object-contain" /></div> : <StoryPage text={active?.text || (flow.empty)} title={title} templateId={templateId} page={index + 1} total={Math.max(1, slides.length)} />}
        <div className="mt-3 flex gap-3"><button type="button" disabled={index === 0} onClick={() => setSelected(index - 1)} className="flex-1 rounded-xl border bg-white py-3 font-bold disabled:opacity-30">← {ui.previous}</button><button type="button" disabled={index >= slides.length - 1} onClick={() => setSelected(index + 1)} className="flex-1 rounded-xl border bg-white py-3 font-bold disabled:opacity-30">{ui.next} →</button></div>
      </aside>
    </div>
  </div>;
}
