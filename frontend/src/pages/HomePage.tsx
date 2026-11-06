import { useAqryoLocale } from "@/lib/i18n";
import { PUBLIC_COPY } from "@/lib/publicCopy";
import { useEffect, useState } from "react";

import { CreatorNavigation } from "@/components/CreatorNavigation";
import { PublicNavigation } from "@/components/home/PublicNavigation";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeAnnouncement } from "@/components/home/HomeAnnouncement";

import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";

export function HomePage() {
  const { locale, t } = useAqryoLocale();
  const copy = PUBLIC_COPY[locale];
  const [authChecked, setAuthChecked] =
    useState(false);

  const [isCreator, setIsCreator] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkCreator() {
      try {
        const creator =
          await getCurrentCreator();

        if (!cancelled) {
          setIsCreator(Boolean(creator));
        }
      } catch {
        if (!cancelled) {
          setIsCreator(false);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    }

    void checkCreator();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    await signOutCreator();
    setIsCreator(false);
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      <HomeAnnouncement />

      {authChecked ? (
        isCreator ? (
          <CreatorNavigation
            onSignOut={handleSignOut}
          />
        ) : (
          <PublicNavigation />
        )
      ) : (
        <div className="h-16 border-b border-border bg-white" />
      )}

      <main>
        <HomeHero
          isCreator={isCreator}
          authChecked={authChecked}
        />
        <section id="how-it-works" className="scroll-mt-24 border-t bg-white px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="text-3xl font-black">{t("howItWorks")}</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {[copy.step1, copy.step2, copy.step3].map((step, index) => <li key={step} className="rounded-2xl border bg-violet-50/50 p-5">
                <span className="text-3xl font-black text-primary">{index + 1}</span><p className="mt-3 text-lg font-bold">{step}</p>
              </li>)}
            </ol>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
