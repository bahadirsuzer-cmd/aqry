import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTestBySlug } from "@/data/testData";
import { TestLandingPage } from "@/pages/TestLandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const Route = createFileRoute("/test/$slug/")({
  loader: ({ params }) => {
    const test = getTestBySlug(params.slug);
    if (!test) throw notFound();
    return { title: test.title, subtitle: test.subtitle };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Test bulunamadı — AQRY" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — AQRY` },
        { name: "description", content: loaderData.subtitle },
        { property: "og:title", content: `${loaderData.title} — AQRY` },
        { property: "og:description", content: loaderData.subtitle },
      ],
    };
  },
  component: TestLandingRoute,
  notFoundComponent: NotFoundPage,
  errorComponent: NotFoundPage,
});

function TestLandingRoute() {
  const { slug } = Route.useParams();
  const test = getTestBySlug(slug);
  if (!test) return <NotFoundPage />;
  return <TestLandingPage test={test} />;
}
