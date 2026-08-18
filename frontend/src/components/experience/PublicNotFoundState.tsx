import { Link } from "@tanstack/react-router";

export function PublicNotFoundState() {
  return (
    <div className="min-h-screen bg-white px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-[620px] items-center justify-center text-center">
        <div>
          <Link
            to="/"
            className="text-[29px] font-black tracking-[-0.065em] text-primary"
          >
            AQRYO.
          </Link>

          <p className="mt-10 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
            404
          </p>

          <h1 className="mt-3 text-[38px] font-black leading-[1] tracking-[-0.055em] sm:text-[48px]">
            Aradığın sayfa burada değil.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[12px] leading-6 text-muted-foreground">
            Bağlantı değişmiş, kaldırılmış veya yanlış yazılmış olabilir.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[11px] font-black text-white"
          >
            Ana sayfaya dön →
          </Link>
        </div>
      </div>
    </div>
  );
}