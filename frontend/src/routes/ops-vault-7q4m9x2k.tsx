import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getCurrentCreator,
  requestAdminEmailCode,
  signOutCreator,
  verifyAdminEmailCode,
} from "@/services/auth";
import { isCurrentUserAdmin } from "@/services/admin";

export const Route = createFileRoute("/ops-vault-7q4m9x2k")({
  component: PrivateControlAccessPage,
});

function PrivateControlAccessPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const user = await getCurrentCreator();
        if (!user || cancelled) return;

        const isAdmin = await isCurrentUserAdmin();
        if (isAdmin && !cancelled) {
          navigate({ to: "/admin", replace: true });
          return;
        }

        await signOutCreator();
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const normalizedEmail = await requestAdminEmailCode(email);
      setEmail(normalizedEmail);
      setStage("code");
    } catch {
      setErrorMessage("Bu hesap için doğrulama başlatılamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      await verifyAdminEmailCode(email, code);
      const isAdmin = await isCurrentUserAdmin();

      if (!isAdmin) {
        await signOutCreator();
        throw new Error("unauthorized");
      }

      navigate({ to: "/admin", replace: true });
    } catch {
      await signOutCreator().catch(() => undefined);
      setCode("");
      setErrorMessage("Kod geçersiz, süresi dolmuş veya bu hesap yetkili değil.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-5">
        <p className="text-[11px] font-black text-muted-foreground">Erişim kontrol ediliyor...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-5 py-10">
      <section className="w-full max-w-[420px] rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_80px_rgba(18,18,23,0.07)] sm:p-8">
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-violet-600">AQRYO</p>
          <h1 className="mt-2 text-[28px] font-black tracking-[-0.05em]">Private Control</h1>
          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            Yetkili e-posta hesabına gönderilen tek kullanımlık kod ile giriş.
          </p>
        </div>

        {stage === "email" ? (
          <form onSubmit={sendCode} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.07em] text-muted-foreground">E-posta</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-12 w-full rounded-[14px] border border-border bg-white px-4 text-[12px] outline-none transition focus:border-black"
              />
            </label>
            {errorMessage ? <ErrorBox message={errorMessage} /> : null}
            <button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-black px-5 text-[10px] font-black text-white disabled:opacity-50">
              {loading ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-7 space-y-4">
            <div className="rounded-[14px] bg-[#f7f7f9] px-4 py-3 text-[10px] font-bold text-muted-foreground">
              Kod {email} adresine gönderildi.
            </div>
            <label className="block">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.07em] text-muted-foreground">Doğrulama kodu</span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
                required
                autoFocus
                className="h-12 w-full rounded-[14px] border border-border bg-white px-4 text-center text-[18px] font-black tracking-[0.25em] outline-none transition focus:border-black"
              />
            </label>
            {errorMessage ? <ErrorBox message={errorMessage} /> : null}
            <button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-black px-5 text-[10px] font-black text-white disabled:opacity-50">
              {loading ? "Kontrol ediliyor..." : "Giriş yap"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("email");
                setCode("");
                setErrorMessage(null);
              }}
              className="w-full py-2 text-[10px] font-black text-muted-foreground"
            >
              E-postayı değiştir
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold leading-5 text-red-700">
      {message}
    </div>
  );
}
