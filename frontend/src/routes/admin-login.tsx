import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  getCurrentCreator,
  signInCreator,
  signOutCreator,
} from "@/services/auth";
import { isCurrentUserAdmin } from "@/services/admin";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        const user = await getCurrentCreator();

        if (!user || cancelled) {
          return;
        }

        const isAdmin =
          await isCurrentUserAdmin();

        if (isAdmin && !cancelled) {
          navigate({
            to: "/admin",
            replace: true,
          });
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    void checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      await signInCreator({
        email,
        password,
      });

      const isAdmin =
        await isCurrentUserAdmin();

      if (!isAdmin) {
        await signOutCreator();

        throw new Error(
          "Bu hesap AQRYO admin paneline yetkili değil.",
        );
      }

      navigate({
        to: "/admin",
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Admin girişi yapılamadı.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-5">
        <p className="text-[11px] font-black text-muted-foreground">
          Admin oturumu kontrol ediliyor...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-5 py-10">
      <div className="w-full max-w-[420px]">
        <Link
          to="/"
          className="mb-8 block text-center text-[24px] font-black tracking-[-0.05em]"
        >
          AQRYO.
        </Link>

        <section className="rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_80px_rgba(18,18,23,0.07)] sm:p-8">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-violet-600">
              Control Center
            </p>

            <h1 className="mt-2 text-[28px] font-black tracking-[-0.05em]">
              Admin girişi
            </h1>

            <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
              Yalnızca yetkilendirilmiş AQRYO admin hesapları giriş yapabilir.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >
            <label className="block">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.07em] text-muted-foreground">
                E-posta
              </span>

              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="h-12 w-full rounded-[14px] border border-border bg-white px-4 text-[12px] outline-none transition focus:border-black"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.07em] text-muted-foreground">
                Şifre
              </span>

              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="h-12 w-full rounded-[14px] border border-border bg-white px-4 text-[12px] outline-none transition focus:border-black"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold leading-5 text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-black px-5 text-[10px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Kontrol ediliyor..."
                : "Control Center’a gir"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}