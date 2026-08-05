import { Link } from "@tanstack/react-router";
import { CreatorShell } from "@/components/creator/CreatorNavigation";
import { CreatorTestCard } from "@/components/creator/CreatorTestCard";
import { Toast, useToast } from "@/components/creator/Toast";
import { PageTitle, Panel, StatCard } from "@/components/creator/ui";
import { useCreatorTests } from "@/hooks/useCreatorTests";
import { isPublished } from "@/services/testRepository";
import { sumMetrics } from "@/services/analyticsService";

export function CreatorDashboardPage() {
  const { notice, show } = useToast();
  const { hydrated, tests, metricsFor, copyLink, togglePublish, remove } = useCreatorTests(show);

  const published = tests.filter(isPublished);
  const drafts = tests.filter((test) => !isPublished(test));
  const totals = sumMetrics(tests.map((test) => metricsFor(test.id)));
  const recent = tests.slice(0, 5);

  return (
    <CreatorShell>
      <PageTitle
        title="Genel Bakış"
        description="Testlerinin özeti ve son etkileşim verileri."
        action={
          <Link to="/creator/tests/new" className="btn-primary w-auto px-5 py-2.5 text-sm">
            Yeni test oluştur
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Toplam test" value={hydrated ? tests.length : 0} />
        <StatCard label="Yayında" value={hydrated ? published.length : 0} />
        <StatCard label="Taslak" value={hydrated ? drafts.length : 0} />
        <StatCard label="Görüntülenme" value={hydrated ? totals.views : 0} />
        <StatCard label="Başlatma" value={hydrated ? totals.starts : 0} />
        <StatCard label="Tamamlanma" value={hydrated ? totals.completions : 0} />
        <StatCard label="Kilit açma tıklaması" value={hydrated ? totals.unlockClicks : 0} />
        <StatCard label="Paylaşım" value={hydrated ? totals.shares : 0} />
      </div>

      <h2 className="mb-3 mt-8 text-base font-bold tracking-tight text-foreground">Son testlerin</h2>

      {!hydrated ? null : recent.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Henüz kendi testini oluşturmadın.</p>
          <Link to="/creator/tests/new" className="btn-primary mt-4 w-auto px-5 py-2.5 text-sm">
            İlk testini oluştur
          </Link>
        </Panel>
      ) : (
        <div className="space-y-3">
          {recent.map((test) => (
            <CreatorTestCard
              key={test.id}
              test={test}
              metrics={metricsFor(test.id)}
              onCopyLink={copyLink}
              onTogglePublish={togglePublish}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      <Toast message={notice} />
    </CreatorShell>
  );
}
