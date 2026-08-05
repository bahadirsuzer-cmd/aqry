import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Test } from "@/types";
import { CreatorShell } from "@/components/creator/CreatorNavigation";
import { PageTitle, Panel } from "@/components/creator/ui";
import { TestWizard } from "@/components/creator/TestWizard";
import { getCreatorTestById } from "@/services/testRepository";
import { useHydrated } from "@/hooks/useHydrated";

export function EditTestPage({ id }: { id: string }) {
  const hydrated = useHydrated();
  const [test, setTest] = useState<Test | undefined>(undefined);

  useEffect(() => {
    if (hydrated) setTest(getCreatorTestById(id));
  }, [hydrated, id]);

  return (
    <CreatorShell>
      <PageTitle title="Testi düzenle" description={test?.title} />
      {!hydrated ? null : !test ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Bu test bulunamadı ya da silinmiş olabilir.</p>
          <Link to="/creator/tests" className="btn-primary mt-4 w-auto px-5 py-2.5 text-sm">
            Testlerime dön
          </Link>
        </Panel>
      ) : (
        <TestWizard key={test.id} existingTest={test} />
      )}
    </CreatorShell>
  );
}
