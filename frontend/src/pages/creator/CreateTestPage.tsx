import { CreatorShell } from "@/components/creator/CreatorNavigation";
import { PageTitle } from "@/components/creator/ui";
import { TestWizard } from "@/components/creator/TestWizard";
import { useHydrated } from "@/hooks/useHydrated";

export function CreateTestPage() {
  const hydrated = useHydrated();

  return (
    <CreatorShell>
      <PageTitle title="Yeni test" description="Dört adımda testini oluştur ve yayınla." />
      {hydrated ? <TestWizard /> : null}
    </CreatorShell>
  );
}
