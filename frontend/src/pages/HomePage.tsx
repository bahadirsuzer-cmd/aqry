import { useEffect, useState } from "react";

import { CreatorNavigation } from "@/components/CreatorNavigation";
import { PublicNavigation } from "@/components/home/PublicNavigation";
import { HomeHero } from "@/components/home/HomeHero";
import { AiCreditsIntro } from "@/components/home/AiCreditsIntro";
import { ExampleExperiences } from "@/components/home/ExampleExperiences";
import { CreatorHomeCta } from "@/components/home/CreatorHomeCta";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeAnnouncement } from "@/components/home/HomeAnnouncement";

import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";

export function HomePage() {
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

        <AiCreditsIntro />
        <ExampleExperiences />
        <CreatorHomeCta
          isCreator={isCreator}
        />
      </main>

      <HomeFooter />
    </div>
  );
}