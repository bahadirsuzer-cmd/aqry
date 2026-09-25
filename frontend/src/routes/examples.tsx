import { createFileRoute } from "@tanstack/react-router";
import { HomeHero } from "@/components/home/HomeHero";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export const Route = createFileRoute("/examples")({ component: ExamplesPage });

function ExamplesPage() {
  return (
    <PublicPageShell eyebrow="AQRYO örneği" title="Okumak yerine oyna." description="İki seçim yap, ücretsiz tam sonucunu gör ve deneyimi tamamla.">
      <HomeHero />
    </PublicPageShell>
  );
}
