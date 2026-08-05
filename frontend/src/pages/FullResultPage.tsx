import { Link, useNavigate } from "@tanstack/react-router";
import type { QuizResult, ResultProfile, Test } from "@/types";
import { AqryLogo } from "@/components/AqryLogo";
import { ShareButton } from "@/components/ShareButton";
import { sortedProfileKeys } from "@/utils/calculateResult";
import { trackEvent } from "@/utils/analytics";

interface FullResultPageProps {
  test: Test;
  profile: ResultProfile;
  result: QuizResult;
  onRestart: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

function TraitList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FullResultPage({ test, profile, result, onRestart }: FullResultPageProps) {
  const navigate = useNavigate();
  const percent = result.percentages[profile.key];
  const others = sortedProfileKeys(result);

  const handleRestart = () => {
    onRestart();
    navigate({ to: "/test/$slug", params: { slug: test.slug } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[520px] px-5 py-5">
        <AqryLogo />

        <div className="animate-rise mt-8 space-y-5">
          <div className="rounded-3xl bg-gradient-brand p-7 text-center shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              {test.title}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-primary-foreground">
              %{percent} {profile.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
              {profile.shortDescription}
            </p>
          </div>

          <Section title="Detaylı analiz">{profile.fullDescription}</Section>

          <Section title="Güçlü yönlerin">
            <TraitList items={profile.strengths} />
          </Section>

          <Section title="Zayıf yönlerin">
            <TraitList items={profile.weaknesses} />
          </Section>

          <Section title="İlişkilerde sen">{profile.relationshipStyle}</Section>

          <Section title="Testteki rolün">{profile.roleDescription}</Section>

          <Section title="Diğer eşleşmelerin">
            <div className="space-y-3.5">
              {others.map((key) => {
                const other = test.resultProfiles.find((item) => item.key === key);
                if (!other) return null;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold text-foreground">{other.name}</span>
                      <span className="font-bold text-primary">%{result.percentages[key]}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: `${result.percentages[key]}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <div className="space-y-3 pt-1">
            <ShareButton
              title={test.title}
              text={profile.shareText}
              onShare={() =>
                trackEvent("share_clicked", {
                  testId: test.id,
                  testSlug: test.slug,
                  creatorId: test.creator.id,
                  resultId: profile.id,
                })
              }
            />
            <button type="button" onClick={handleRestart} className="btn-ghost">
              Testi yeniden çöz
            </button>
            <Link to="/" className="btn-ghost">
              Başka bir test çöz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
