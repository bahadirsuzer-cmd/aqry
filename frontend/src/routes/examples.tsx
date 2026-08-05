import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import {
  popularExperiences,
} from "@/components/home/homeData";
import {
  ExperiencePreviewCard,
} from "@/components/home/ExperiencePreviewCard";

export const Route = createFileRoute(
  "/examples",
)({
  component: ExamplesPage,
});

function ExamplesPage() {
  return (
    <PublicPageShell
      eyebrow="AQRYO örnekleri"
      title="Okumak yerine deneyimle."
      description="AQRYO’nun nasıl çalıştığını anlamanın en kolay yolu bir Experience’a girmek. Buradaki örnekler daha sonra gerçek yayınlanmış Experience’lara bağlanacak."
    >
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularExperiences.map(
            (experience) => (
              <ExperiencePreviewCard
                key={experience.id}
                experience={experience}
                className="h-[310px] sm:h-[340px]"
              />
            ),
          )}
        </div>

        <div className="mt-10 rounded-[24px] border border-primary/10 bg-violet-50/60 p-5 sm:p-6">
          <p className="text-[11px] font-black text-primary">
            Bu bir keşfet akışı değildir.
          </p>

          <p className="mt-2 max-w-3xl text-[12px] leading-6 text-muted-foreground">
            Bu sayfa yalnızca AQRYO’yu ilk kez gören kişilerin ürün tiplerini deneyebilmesi için hazırlanmış örnek vitrindir. Creator trafiği yine kendi kitlesinden gelir.
          </p>
        </div>
      </section>
    </PublicPageShell>
  );
}