import { Link } from "@tanstack/react-router";
import type { Test } from "@/types";
import type { TestMetrics } from "@/services/analyticsService";
import { CATEGORIES } from "@/services/testDraft";
import { isPublished } from "@/services/testRepository";
import { ActionButton, StatusPill } from "./ui";

interface CreatorTestCardProps {
  test: Test;
  metrics: TestMetrics;
  onCopyLink: (test: Test) => void;
  onTogglePublish: (test: Test) => void;
  onDelete: (test: Test) => void;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export function CreatorTestCard({
  test,
  metrics,
  onCopyLink,
  onTogglePublish,
  onDelete,
}: CreatorTestCardProps) {
  const published = isPublished(test);
  const category = CATEGORIES.find((item) => item.value === test.category)?.label;

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-tight text-foreground">{test.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            /test/{test.slug}
            {category ? ` · ${category}` : ""}
          </p>
        </div>
        <StatusPill status={test.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Soru</dt>
          <dd className="font-bold text-foreground">{test.questions.length}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Sonuç profili</dt>
          <dd className="font-bold text-foreground">{test.resultProfiles.length}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Katılımcı</dt>
          <dd className="font-bold text-foreground">{metrics.starts}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Son güncelleme</dt>
          <dd className="font-bold text-foreground">{formatDate(test.updatedAt)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/creator/tests/$id/edit"
          params={{ id: test.id }}
          className="inline-flex items-center rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Düzenle
        </Link>
        <Link
          to="/creator/tests/$id/preview"
          params={{ id: test.id }}
          className="inline-flex items-center rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Ön izle
        </Link>
        <ActionButton onClick={() => onCopyLink(test)}>Linki kopyala</ActionButton>
        <ActionButton tone={published ? "secondary" : "primary"} onClick={() => onTogglePublish(test)}>
          {published ? "Yayından kaldır" : "Yayınla"}
        </ActionButton>
        <ActionButton tone="danger" onClick={() => onDelete(test)}>
          Sil
        </ActionButton>
      </div>
    </article>
  );
}
