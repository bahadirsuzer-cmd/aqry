import { getCompatibilityCopy } from "@/lib/compatibilityCopy";
import type { CompatibilityInput, PreparedCompatibility } from "@/lib/compatibilityComposer";

type Props = {
  locale: string;
  title: string;
  inputs: CompatibilityInput[];
  ready: boolean;
  busy: boolean;
  publishing: boolean;
  error: string;
  sourceVersion: boolean;
  canPublish: boolean;
  prepared: Pick<PreparedCompatibility, "questions" | "creatorAnswers" | "results">;
  onTitle: (title: string) => void;
  onInputs: (inputs: CompatibilityInput[]) => void;
  onPrepare: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onAdvanced: () => void;
  onResult: (id: string, field: "title" | "description", value: string) => void;
};

export function QuickCompatibilityComposer(props: Props) {
  const c = getCompatibilityCopy(props.locale);
  const updateInput = (index: number, field: keyof CompatibilityInput, value: string) => props.onInputs(props.inputs.map((item, position) => position === index ? { ...item, [field]: value } : item));
  const complete = Boolean(props.title.trim()) && props.inputs.every(item => item.question.trim() && item.answer.trim());
  const busy = props.busy || props.publishing;
  return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6" dir={props.locale === "ar" || props.locale === "ur" ? "rtl" : undefined}>
    <p className="text-sm font-black text-violet-600">AQRYO / {c.name}</p>
    <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{c.headline}</h1>
    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{c.intro}</p>
    {props.sourceVersion ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{c.source}</p> : null}
    <section className="mt-6 rounded-3xl border bg-white p-5 sm:p-6">
      <h2 className="text-lg font-black">{c.examples}</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{c.exampleTitles.map(example => {
        const separator = example.indexOf(":");
        const title = separator < 0 ? example : example.slice(separator + 1).trim();
        return <button key={example} type="button" disabled={busy} onClick={() => props.onTitle(title)} className={`rounded-xl border px-4 py-3 text-start text-sm font-bold transition disabled:opacity-40 ${props.title === title ? "border-violet-600 bg-violet-50 text-violet-700" : "bg-stone-50 hover:border-violet-400"}`}>{example}</button>;
      })}</div>
    </section>
    <section className="mt-5 rounded-3xl border bg-white p-5 sm:p-6">
      <label htmlFor="match-topic" className="text-lg font-black">{c.topic}</label>
      <input id="match-topic" dir="auto" value={props.title} maxLength={120} disabled={busy} onChange={event => props.onTitle(event.target.value)} className="mt-3 w-full rounded-xl border bg-stone-50 p-3 text-base outline-none focus:border-violet-500" />
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{c.hint}</p>
      <div className="mt-5 space-y-4">{props.inputs.map((input, index) => <fieldset key={index} disabled={busy} className="rounded-2xl border bg-stone-50 p-4">
        <legend className="px-2 text-sm font-black text-violet-700">{index + 1}. {c.question}</legend>
        <label htmlFor={`match-question-${index}`} className="sr-only">{index + 1}. {c.question}</label>
        <input id={`match-question-${index}`} dir="auto" value={input.question} maxLength={160} onChange={event => updateInput(index, "question", event.target.value)} className="w-full rounded-xl border bg-white p-3 text-base outline-none focus:border-violet-500" />
        <label htmlFor={`match-answer-${index}`} className="mt-3 block text-sm font-bold">{c.answer}</label>
        <textarea id={`match-answer-${index}`} dir="auto" value={input.answer} maxLength={160} rows={2} onChange={event => updateInput(index, "answer", event.target.value)} className="mt-2 w-full resize-y rounded-xl border bg-white p-3 text-base outline-none focus:border-violet-500" />
        {props.inputs.length > 5 ? <button type="button" onClick={() => props.onInputs(props.inputs.filter((_,position) => position !== index))} className="mt-2 rounded-lg px-3 py-2 text-sm font-bold text-red-700">{c.remove}</button> : null}
      </fieldset>)}</div>
      <div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm font-bold text-muted-foreground">{props.inputs.length}/10</span><button type="button" disabled={busy || props.inputs.length >= 10} onClick={() => props.onInputs([...props.inputs, { question: "", answer: "" }])} className="rounded-full border px-4 py-2.5 text-sm font-bold disabled:opacity-30">+ {c.add}</button></div>
      {props.error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{props.error}</p> : null}
      <button type="button" disabled={busy || !complete} onClick={props.onPrepare} className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-3 text-base font-black text-white disabled:opacity-40">{props.busy ? c.preparing : c.prepare}</button>
      {props.busy ? <p role="status" className="mt-3 text-center text-sm text-muted-foreground">{c.preparing}</p> : null}
    </section>
    {props.ready ? <section className="mt-5 rounded-3xl border border-violet-200 bg-white p-5 sm:p-6">
      <h2 className="text-xl font-black">{c.ready}</h2>
      <details className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-bold">{c.details}</summary><ol className="mt-4 space-y-4">{props.prepared.questions.map(question => <li key={question.id} className="rounded-xl bg-stone-50 p-4"><p dir="auto" className="font-bold">{question.id}. {question.text}</p><ul className="mt-3 space-y-2">{question.options.map((option, index) => <li key={index} dir="auto" className={`rounded-lg border bg-white px-3 py-2 text-sm ${props.prepared.creatorAnswers[question.id] === index ? "border-violet-400" : ""}`}>{option}{props.prepared.creatorAnswers[question.id] === index ? <span className="ms-2 text-xs font-bold text-violet-700">✓ {c.answer}</span> : null}</li>)}</ul></li>)}</ol></details>
      <details className="mt-3 rounded-xl border p-4"><summary className="cursor-pointer font-bold">{c.results}</summary><div className="mt-4 space-y-4">{props.prepared.results.map(result => <fieldset key={result.id} disabled={busy} className="rounded-xl bg-stone-50 p-4"><legend className="px-2 text-sm font-bold">{result.range}</legend><label htmlFor={`match-result-title-${result.id}`} className="sr-only">{result.range} — {c.topic}</label><input id={`match-result-title-${result.id}`} dir="auto" value={result.title} maxLength={120} onChange={event => props.onResult(result.id, "title", event.target.value)} className="w-full rounded-lg border p-3 font-bold" /><label htmlFor={`match-result-description-${result.id}`} className="sr-only">{result.range} — {c.results}</label><textarea id={`match-result-description-${result.id}`} dir="auto" value={result.description} maxLength={600} rows={3} onChange={event => props.onResult(result.id, "description", event.target.value)} className="mt-2 w-full rounded-lg border p-3 text-sm" /></fieldset>)}</div></details>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy || !props.canPublish} onClick={props.onPreview} className="flex-1 rounded-xl border px-4 py-3 font-bold disabled:opacity-40">{c.preview}</button><button type="button" disabled={busy || !props.canPublish} onClick={props.onPublish} className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-black text-white disabled:opacity-40">{props.publishing ? c.publish + "…" : c.publish + " →"}</button></div>
    </section> : null}
    <button type="button" disabled={busy} onClick={props.onAdvanced} className="mt-5 rounded-full border bg-white px-4 py-2.5 text-sm font-bold disabled:opacity-40">{c.advanced}</button>
  </main>;
}
