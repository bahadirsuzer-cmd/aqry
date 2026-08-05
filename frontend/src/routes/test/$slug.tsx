import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { getTestBySlug } from "@/data/testData";
import { TestIntroPage } from "@/pages/TestIntroPage";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/test/$slug")({
  component: TestRoutePage,
});

function TestRoutePage() {
  const { slug } = Route.useParams();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const test = getTestBySlug(slug);

  if (!test) {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Experience bulunamadı
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
            Bu test mevcut değil
          </h1>

          <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
            Bağlantı hatalı olabilir veya bu experience yayından kaldırılmış
            olabilir.
          </p>

          <Link to="/" className="btn-primary mt-6">
            Ana sayfaya dön
          </Link>
        </main>
      </PageShell>
    );
  }

  const isIntroPage = pathname === `/test/${slug}`;

  if (isIntroPage) {
    return <TestIntroPage test={test} />;
  }

  return <Outlet />;
}