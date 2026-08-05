import { useCallback, useEffect, useMemo, useState } from "react";
import type { Test } from "@/types";
import { getCreatorTests, deleteTest, publishTest, unpublishTest, isPublished } from "@/services/testRepository";
import { getMetricsByTest, metricsFor, type TestMetrics } from "@/services/analyticsService";
import { draftFromTest, validateDraft } from "@/services/testDraft";
import { useHydrated } from "./useHydrated";

export interface CreatorTestsController {
  hydrated: boolean;
  tests: Test[];
  metricsFor: (testId: string) => TestMetrics;
  copyLink: (test: Test) => void;
  togglePublish: (test: Test) => void;
  remove: (test: Test) => void;
}

export function useCreatorTests(show: (message: string) => void): CreatorTestsController {
  const hydrated = useHydrated();
  const [tests, setTests] = useState<Test[]>([]);
  const [metrics, setMetrics] = useState<Record<string, TestMetrics>>({});

  const refresh = useCallback(() => {
    setTests(getCreatorTests());
    setMetrics(getMetricsByTest());
  }, []);

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated, refresh]);

  const copyLink = useCallback(
    (test: Test) => {
      const url = `${window.location.origin}/test/${test.slug}`;
      if (!navigator.clipboard?.writeText) {
        show("Tarayıcı panosu kullanılamıyor. Bağlantı: " + url);
        return;
      }
      navigator.clipboard.writeText(url).then(
        () => show("Test bağlantısı kopyalandı."),
        () => show("Bağlantı kopyalanamadı. Bağlantı: " + url),
      );
    },
    [show],
  );

  const togglePublish = useCallback(
    (test: Test) => {
      if (isPublished(test)) {
        unpublishTest(test.id);
        show("Test yayından kaldırıldı.");
      } else {
        const issues = validateDraft(draftFromTest(test));
        if (issues.length > 0) {
          show(`Yayınlanamadı: ${issues[0].message}`);
          return;
        }
        publishTest(test.id);
        show("Test yayınlandı.");
      }
      refresh();
    },
    [refresh, show],
  );

  const remove = useCallback(
    (test: Test) => {
      if (!window.confirm(`"${test.title}" kalıcı olarak silinsin mi?`)) return;
      deleteTest(test.id);
      show("Test silindi.");
      refresh();
    },
    [refresh, show],
  );

  const lookup = useMemo(() => (testId: string) => metricsFor(testId, metrics), [metrics]);

  return { hydrated, tests, metricsFor: lookup, copyLink, togglePublish, remove };
}
