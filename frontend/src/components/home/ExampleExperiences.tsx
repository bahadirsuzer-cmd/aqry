import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "@tanstack/react-router";

import {
  popularExperiences,
  type HomeExperienceCard,
} from "./homeData";
import {
  ExperiencePreviewCard,
} from "./ExperiencePreviewCard";
import {
  getPublicHomepageFeaturedExperiences,
  type PublicHomepageFeaturedExperience,
} from "@/services/homepage";

function normalizeType(
  type: string,
): HomeExperienceCard["type"] {
  const normalized =
    type.trim().toLowerCase();

  if (
    normalized.includes("story") ||
    normalized.includes("hikaye")
  ) {
    return "HİKAYE";
  }

  if (
    normalized.includes("puzzle") ||
    normalized.includes("guess") ||
    normalized.includes("bulmaca")
  ) {
    return "BULMACA";
  }

  return "TEST";
}

function accentForSlot(
  slot: number,
) {
  return (
    popularExperiences[
      slot - 1
    ]?.accent ??
    "from-[#6d28d9] via-[#8b5cf6] to-[#ec4899]"
  );
}

function symbolForType(
  type: HomeExperienceCard["type"],
) {
  if (type === "HİKAYE") {
    return "✦";
  }

  if (type === "BULMACA") {
    return "?";
  }

  return "✓";
}

function toHomeCard(
  experience: PublicHomepageFeaturedExperience,
): HomeExperienceCard {
  const type =
    normalizeType(
      experience.type,
    );

  return {
    id: experience.experienceId,
    type,
    title: experience.title,
    meta:
      experience.coverLabel?.trim() ||
      "Experience",
    coverImage:
      experience.coverImageUrl ??
      undefined,
    accent:
      accentForSlot(
        experience.slot,
      ),
    fallbackSymbol:
      symbolForType(type),
  };
}

export function ExampleExperiences() {
  const [
    featured,
    setFeatured,
  ] = useState<
    PublicHomepageFeaturedExperience[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data =
          await getPublicHomepageFeaturedExperiences();

        if (!cancelled) {
          setFeatured(data);
        }
      } catch (error) {
        console.error(
          "Homepage featured Experience'lar yüklenemedi:",
          error,
        );
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () =>
      popularExperiences.map(
        (demo, index) => {
          const slot =
            index + 1;

          const live =
            featured.find(
              (item) =>
                item.slot === slot,
            );

          if (!live) {
            return {
              kind:
                "demo" as const,
              card: demo,
            };
          }

          return {
            kind:
              "live" as const,
            card:
              toHomeCard(live),
            experienceId:
              live.experienceId,
          };
        },
      ),
    [featured],
  );

  return (
    <section
      id="examples"
      className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-7 sm:py-14 lg:px-10"
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
            Gerçek ürün deneyimi
          </p>

          <h2 className="mt-2 text-[28px] font-black tracking-[-0.045em] sm:text-[34px]">
            Popüler deneyimleri keşfet
          </h2>

          <p className="mt-1 text-[12px] text-muted-foreground">
            Testlerden hikayelere, bulmacalardan kişilik deneyimlerine.
          </p>
        </div>

        <a
          href="#examples"
          className="hidden shrink-0 text-[11px] font-black text-primary sm:block"
        >
          Tüm deneyimleri gör →
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((item) =>
          item.kind === "live" ? (
            <Link
              key={`live-${item.experienceId}`}
              to="/experience/$experienceId"
              params={{
                experienceId:
                  item.experienceId,
              }}
              className="block"
            >
              <ExperiencePreviewCard
                experience={item.card}
                compact
                className="h-[250px] sm:h-[270px] xl:h-[255px]"
              />
            </Link>
          ) : (
            <ExperiencePreviewCard
              key={`demo-${item.card.id}`}
              experience={item.card}
              compact
              className="h-[250px] sm:h-[270px] xl:h-[255px]"
            />
          ),
        )}
      </div>
    </section>
  );
}