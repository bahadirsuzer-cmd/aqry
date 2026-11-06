import { AQRYO_LANGUAGES, useAqryoLocale, type AqryoLocale } from "@/lib/i18n";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useAqryoLocale();
  return <label className="inline-flex min-w-0 items-center gap-1 text-xs font-bold">
    <span className="sr-only">{t("language")}</span>
    <select aria-label={t("language")} value={locale} onChange={(event) => setLocale(event.target.value as AqryoLocale)}
      className={`h-10 min-w-0 rounded-full border border-primary/20 bg-white px-2 text-foreground ${compact ? "max-w-[100px]" : "max-w-[160px]"}`}>
      {AQRYO_LANGUAGES.map(([code, label]) => <option key={code} value={code} lang={code}>{label}</option>)}
    </select>
  </label>;
}
