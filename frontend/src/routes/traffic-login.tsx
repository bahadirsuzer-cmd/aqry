import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getCurrentCreator, signInCreator, signOutCreator } from "@/services/auth";
import { isTrafficOwner } from "@/services/siteTraffic";

export const Route = createFileRoute("/traffic-login")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  component: TrafficLogin,
});

function TrafficLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (await getCurrentCreator() && await isTrafficOwner() && active) {
          navigate({ to: "/traffic", replace: true });
        }
      } catch {
        // The sign-in form remains available when session lookup fails.
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signInCreator({ email, password });
      if (!await isTrafficOwner()) {
        await signOutCreator();
        throw new Error("Bu hesap trafik paneline yetkili değil.");
      }
      navigate({ to: "/traffic", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5fb] px-5">
      <div className="w-full max-w-[420px] rounded-[28px] border border-violet-100 bg-white p-7 shadow-xl sm:p-9">
        <Link to="/" className="text-2xl font-black tracking-tight text-violet-700">AQRYO.</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.15em] text-violet-600">Özel erişim</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Trafik paneli</h1>
        <p className="mt-3 text-sm text-muted-foreground">Yetkili e-posta hesabın ve şifrenle giriş yap.</p>
        {checking ? <p className="mt-8 text-sm">Oturum kontrol ediliyor...</p> : (
          <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="block text-sm font-bold">E-posta
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border px-4 font-normal" />
            </label>
            <label className="block text-sm font-bold">Şifre
              <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border px-4 font-normal" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="h-12 w-full rounded-xl bg-violet-700 font-bold text-white disabled:opacity-50">{busy ? "Giriş yapılıyor..." : "Giriş yap"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
