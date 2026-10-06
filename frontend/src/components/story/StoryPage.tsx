import { storyTemplateStyle } from "@/lib/storyTemplates";
export function StoryPage({ text, templateId, title, page, total, className = "" }: { text: string; templateId?: string; title?: string; page: number; total: number; className?: string }) {
  return <div dir="auto" style={storyTemplateStyle(templateId)} className={`relative flex min-h-[420px] flex-col rounded-3xl border border-black/10 p-6 sm:p-8 ${className}`}>
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-current/15 pb-3 text-xs font-bold opacity-60"><span className="truncate">{title || "AQRYO STORY"}</span><span className="shrink-0">{page}/{total}</span></div>
    <p className="my-auto whitespace-pre-wrap break-words text-start text-[19px] font-medium leading-[1.65]">{text}</p>
    <div className="mt-6 flex items-center justify-between border-t border-current/15 pt-3 text-xs font-bold opacity-60"><span>AQRYO.</span><span>→</span></div>
  </div>;
}
