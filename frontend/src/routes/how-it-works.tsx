import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { useAqryoLocale } from "@/lib/i18n";
import { PUBLIC_COPY } from "@/lib/publicCopy";
export const Route = createFileRoute("/how-it-works")({ component: HowItWorksPage });
function HowItWorksPage() {
  const { locale, t } = useAqryoLocale();
  const copy = PUBLIC_COPY[locale];
  return <PublicPageShell title={t("howItWorks")} description={t("studioDescription")}>
    <ol className="mx-auto grid max-w-[1180px] gap-5 px-5 py-12 sm:grid-cols-3">
      {[copy.step1, copy.step2, copy.step3].map((step, index) => <li key={step} className="rounded-2xl border p-6"><span className="text-3xl font-black text-primary">{index + 1}</span><h2 className="mt-4 text-xl font-bold">{step}</h2></li>)}
    </ol>
  </PublicPageShell>;
}
