import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Test } from "@/types";
import { CreatorShell } from "@/components/creator/CreatorNavigation";
import { ActionButton, Panel, StatCard, RatioBar, Select } from "@/components/creator/ui";
import { PageTitle } from "@/components/creator/ui";
import { getCreatorTests } from "@/services/testRepository";
import { getMetricsByTest, metricsFor, sumMetrics } from "@/services/analyticsService";
import { useHydrated } from "@/hooks/useHydrated";

export function CreatorAnalyticsPage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [selected, setSelected] = useState<string>("all");

  useEffect(() => {
    if (hydrated) setTests(getCreatorTests());
  }, [hydrated]);

  const all = useMemo(() => (hydrated ? getMetricsByTest() : {}), [hydrated, tests]);

  const scope = selected === "all" ? tests : tests.filter((test) => test.id === selected);
  const totals = sumMetrics(scope.map((test) => metricsFor(test.id, all)));

  return (
    <CreatorShell>
      <PageTitle
        title="Analitik"
        description="Testlerinin etkileşim verileri. Ön izleme oturumları bu verilere dahil edilmez."
        action={
          <div className="w-56">
            <Select value={selected} onChange={(event) => setSelected(event.target.value)}>
              <option value="all">Tüm testler</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {hydrated && tests.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Henüz kendi testini oluşturmadın. Test oluşturup yayınladığında veriler burada görünecek.
          </p>
          <ActionButton
            tone="primary"
            className="mt-4"
            onClick={() => navigate({ to: "/creator/tests/new" })}
          >
            İlk testini oluştur
          </ActionButton>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Görüntülenme" value={totals.views} />
            <StatCard label="Test başlangıcı" value={totals.starts} />
            <StatCard label="Tamamlanma" value={totals.completions} />
            <StatCard label="Sonuç ön izlemesi" value={totals.previews} />
            <StatCard label="Kilit açma tıklaması" value={totals.unlockClicks} />
            <StatCard label="Demo kilit açma" value={totals.unlocks} />
            <StatCard label="Paylaşım" value={totals.shares} />
            <StatCard
              label="Tamamlama oranı"
              value={`%${totals.starts > 0 ? Math.round((totals.completions / totals.starts) * 100) : 0}`}
            />
          </div>

          <Panel className="mt-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Oranlar</h2>
            <RatioBar label="Tamamlama oranı" value={totals.completions} total={totals.starts} />
            <RatioBar
              label="Kilit açma tıklama oranı"
              value={totals.unlockClicks}
              total={totals.previews}
            />
            <RatioBar label="Demo kilit açma oranı" value={totals.unlocks} total={totals.unlockClicks} />
            <RatioBar label="Paylaşım oranı" value={totals.shares} total={totals.unlocks} />
          </Panel>

          <h2 className="mb-3 mt-8 text-base font-bold tracking-tight text-foreground">Test bazlı</h2>
          <div className="space-y-3">
            {scope.map((test) => {
              const metrics = metricsFor(test.id, all);
              return (
                <Panel key={test.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">{test.title}</h3>
                    <Link
                      to="/creator/tests/$id/edit"
                      params={{ id: test.id }}
                      className="text-xs font-semibold text-primary underline underline-offset-2"
                    >
                      Düzenle
                    </Link>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Görüntülenme</dt>
                      <dd className="font-bold text-foreground">{metrics.views}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Başlangıç</dt>
                      <dd className="font-bold text-foreground">{metrics.starts}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tamamlanma</dt>
                      <dd className="font-bold text-foreground">{metrics.completions}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Kilit açma</dt>
                      <dd className="font-bold text-foreground">{metrics.unlocks}</dd>
                    </div>
                  </dl>
                </Panel>
              );
            })}
          </div>
        </>
      )}
    </CreatorShell>
  );
}
