import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export function NotFoundPage() {
  return (
    <PageShell narrow>
      <div className="flex flex-col items-center py-16 text-center">
        <span className="bg-gradient-brand bg-clip-text text-7xl font-black tracking-tight text-transparent">
          404
        </span>
        <h1 className="mt-4 text-xl font-bold text-foreground">Bu sayfa bulunamadı</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Aradığın test kaldırılmış ya da bağlantı hatalı olabilir. Diğer testlere göz atabilirsin.
        </p>
        <Link to="/" className="btn-primary mt-8 w-auto px-8">
          Ana sayfaya dön
        </Link>
      </div>
    </PageShell>
  );
}
