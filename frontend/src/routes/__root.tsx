import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import {
  useEffect,
  type ReactNode,
} from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { NotFoundPage } from "@/pages/NotFoundPage";

function NotFoundComponent() {
  return <NotFoundPage />;
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary:
        "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Bu sayfa yüklenemedi
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Bir şeyler ters gitti. Sayfayı
          yenileyebilir veya ana sayfaya
          dönebilirsin.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tekrar dene
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ana sayfaya dön
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1",
        },
        {
          title:
            "AQRYO | Creator Monetizasyon ve İnteraktif İçerik",
        },
        {
          name: "description",
          content:
            "İçerik üreticileri için test, hikaye, bulmaca ve interaktif deneyimler oluşturma ve takipçilerden gelir elde etme aracı.",
        },
        {
          name: "author",
          content: "AQRYO",
        },
        {
          name: "robots",
          content:
            "index,follow,max-image-preview:large",
        },
        {
          property: "og:site_name",
          content: "AQRYO",
        },
        {
          property: "og:title",
          content:
            "AQRYO | Creator Monetizasyon ve İnteraktif İçerik",
        },
        {
          property: "og:description",
          content:
            "İçerik üreticileri için interaktif deneyimler oluştur, paylaş ve kitleni gelire dönüştür.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:url",
          content: "https://aqryo.com/",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content:
            "AQRYO | Creator Monetizasyon ve İnteraktif İçerik",
        },
        {
          name: "twitter:description",
          content:
            "İçerik üreticileri için interaktif deneyimler oluştur, paylaş ve kitleni gelire dönüştür.",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
        {
          rel: "icon",
          href: "/aqryo-q.png",
          type: "image/png",
        },
        {
          rel: "shortcut icon",
          href: "/aqryo-q.png",
          type: "image/png",
        },
        {
          rel: "apple-touch-icon",
          href: "/aqryo-q.png",
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent:
      NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  return (
    <QueryClientProvider
      client={queryClient}
    >
      <Outlet />
    </QueryClientProvider>
  );
}