import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CreatorShell } from "@/components/creator/CreatorNavigation";
import { CreatorTestCard } from "@/components/creator/CreatorTestCard";
import { Toast, useToast } from "@/components/creator/Toast";
import { ActionButton, PageTitle, Panel, TextInput } from "@/components/creator/ui";
import { useCreatorTests } from "@/hooks/useCreatorTests";
import { isPublished } from "@/services/testRepository";

type Filter = "all" | "published" | "draft";

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "published", label: "Yayında" },
  { value: "draft", label: "Taslak" },
];

export function CreatorTestsPage() {
  const { notice, show } = useToast();
  const { hydrated, tests, metricsFor, copyLink, togglePublish, remove } = useCreatorTests(show);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = tests
    .filter((test) =>
      filter === "all" ? true : filter === "published" ? isPublished(test) : !isPublished(test),
    )
    .filter((test) => test.title.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));

  return (
    <CreatorShell>
      <PageTitle
        title="Testlerim"
        description="Kendi oluşturduğun testleri yönet."
        action={
          <Link to="/creator/tests/new" className="btn-primary w-auto px-5 py-2.5 text-sm">
            Yeni test
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <ActionButton
            key={item.value}
            tone={filter === item.value ? "primary" : "secondary"}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </ActionButton>
        ))}
        <div className="ml-auto w-full sm:w-64">
          <TextInput
            value={query}
            placeholder="Başlığa göre ara"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {!hydrated ? null : tests.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Henüz kendi testini oluşturmadın.</p>
          <Link to="/creator/tests/new" className="btn-primary mt-4 w-auto px-5 py-2.5 text-sm">
            İlk testini oluştur
          </Link>
        </Panel>
      ) : visible.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Bu filtreye uyan test bulunamadı.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {visible.map((test) => (
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
