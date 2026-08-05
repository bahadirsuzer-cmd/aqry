import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  requestCreatorPasswordReset,
  resendCreatorVerificationEmail,
  signInCreator,
  signUpCreator,
} from "@/services/auth";
import { supabase } from "@/services/supabase";

type AuthMode = "sign-in" | "sign-up";
type OAuthProvider = "google" | "apple";

const APPLE_AUTH_ENABLED = false;

export const Route = createFileRoute(
  "/creator-auth",
)({
  component: CreatorAuthPage,
});

function CreatorAuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState<AuthMode>("sign-in");

  const [displayName, setDisplayName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [resetLoading, setResetLoading] =
    useState(false);

  const [
    verificationLoading,
    setVerificationLoading,
  ] = useState(false);

  const [
    socialLoading,
    setSocialLoading,
  ] = useState<OAuthProvider | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const isBusy =
    loading ||
    resetLoading ||
    verificationLoading ||
    socialLoading !== null;
useEffect(() => {
  let active = true;

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (active && session) {
      navigate({
        to: "/creator-studio",
      });
    }
  }

  void checkSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (active && session) {
        navigate({
          to: "/creator-studio",
        });
      }
    },
  );

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}, [navigate]);
  async function handleOAuth(
    provider: OAuthProvider,
  ) {
    if (isBusy) {
      return;
    }

    try {
      setSocialLoading(provider);
      setErrorMessage(null);
      setSuccessMessage(null);

      const redirectTo =
        `${window.location.origin}/creator-studio`;

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
          },
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sosyal giriş başlatılamadı.";

      setErrorMessage(message);
      setSocialLoading(null);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (mode === "sign-up") {
        const result = await signUpCreator({
          displayName,
          email,
          password,
        });

        if (result.session) {
          navigate({
            to: "/creator-studio",
          });

          return;
        }

        setSuccessMessage(
          "Hesabın oluşturuldu. E-posta adresine gelen doğrulama bağlantısını açıp giriş yap.",
        );

        return;
      }

      await signInCreator({
        email,
        password,
      });

      navigate({
        to: "/creator-studio",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "İşlem tamamlanamadı.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (isBusy) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Şifreni sıfırlamak için önce e-posta adresini yaz.",
      );
      setSuccessMessage(null);
      return;
    }

    try {
      setResetLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await requestCreatorPasswordReset(
        normalizedEmail,
      );

      setSuccessMessage(
        "Şifre sıfırlama bağlantısını e-posta adresine gönderdik. Gelen kutunu kontrol et.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Şifre sıfırlama bağlantısı gönderilemedi.",
      );
    } finally {
      setResetLoading(false);
    }
  }

  async function handleResendVerification() {
    if (isBusy) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Doğrulama mailini tekrar göndermek için e-posta adresini yaz.",
      );
      setSuccessMessage(null);
      return;
    }

    try {
      setVerificationLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await resendCreatorVerificationEmail(
        normalizedEmail,
      );

      setSuccessMessage(
        "Doğrulama e-postasını tekrar gönderdik. Gelen kutunu ve spam klasörünü kontrol et.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Doğrulama e-postası tekrar gönderilemedi.",
      );
    } finally {
      setVerificationLoading(false);
    }
  }

  function changeMode(
    nextMode: AuthMode,
  ) {
    setMode(nextMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
  }

  return (
    <main className="flex min-h-screen bg-[#faf8fb] text-foreground">
      <section className="hidden flex-1 overflow-hidden bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link
          to="/"
          className="text-[30px] font-black tracking-[-0.065em]"
        >
          AQRYO.
        </Link>

        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
            Creator monetization
          </p>

          <h1 className="mt-5 text-6xl font-black leading-[0.96] tracking-[-0.065em]">
            Trafiğini
            <br />
            Experience’a,
            <br />
            Experience’ı
            <br />
            gelire dönüştür.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-white/80">
            İçeriğini oluştur, bağlantını paylaş,
            katılımları ve kazançlarını tek yerden yönet.
          </p>
        </div>

        <p className="text-xs font-semibold text-white/65">
          Sonuç her zaman ücretsiz. Teklif sonuçtan sonra gelir.
        </p>
      </section>

      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 pb-6 pt-5 lg:w-[560px] lg:px-4 lg:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-gradient-to-br from-fuchsia-500/20 via-primary/10 to-rose-500/20 blur-3xl lg:hidden" />

        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-[28px] font-black tracking-[-0.065em] text-primary lg:hidden"
          >
            AQRYO.
          </Link>

          <div className="mb-4 flex lg:hidden">
            <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-white">
              ✦ Creator
            </span>
          </div>

          <div className="mt-8 rounded-[30px] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(35,16,55,0.1)] sm:p-8 lg:mt-0">
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
              {mode === "sign-in"
                ? "Tekrar hoş geldin"
                : "AQRYO'ya katıl"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {mode === "sign-in"
                ? "Experience’larını yönetmek için giriş yap."
                : "İlk Experience’ını oluşturmak için hesabını aç."}
            </p>

            <div className="mt-6 grid grid-cols-2 rounded-full bg-background p-1">
              <button
                type="button"
                onClick={() =>
                  changeMode("sign-in")
                }
                className={`flex h-10 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  mode === "sign-in"
                    ? "bg-primary text-white shadow-sm lg:bg-white lg:text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Giriş yap
              </button>

              <button
                type="button"
                onClick={() =>
                  changeMode("sign-up")
                }
                className={`flex h-10 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  mode === "sign-up"
                    ? "bg-primary text-white shadow-sm lg:bg-white lg:text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Hesap oluştur
              </button>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  void handleOAuth("google")
                }
                className="flex h-12 w-full items-center justify-center gap-3 rounded-[15px] border border-border bg-white px-4 text-[11px] font-black transition enabled:hover:border-primary/30 enabled:hover:bg-background disabled:cursor-wait disabled:opacity-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[11px] font-black">
                  G
                </span>

                {socialLoading === "google"
                  ? "Google açılıyor..."
                  : "Google ile devam et"}
              </button>

              {APPLE_AUTH_ENABLED ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() =>
                    void handleOAuth("apple")
                  }
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-[15px] bg-black px-4 text-[11px] font-black text-white transition enabled:hover:bg-primary disabled:cursor-wait disabled:opacity-50"
                >
                  <span className="text-[18px] leading-none">
                    
                  </span>

                  {socialLoading === "apple"
                    ? "Apple açılıyor..."
                    : "Apple ile devam et"}
                </button>
              ) : null}
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                veya e-posta ile devam et
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {mode === "sign-up" && (
                <label className="block">
                  <span className="text-[10px] font-bold">
                    Creator adı
                  </span>

                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(
                        event.target.value,
                      )
                    }
                    autoComplete="name"
                    placeholder="Örneğin: Aşk Testisi"
                    className="mt-2 h-12 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/60 focus:border-primary"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-[10px] font-bold">
                  E-posta
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  placeholder="creator@email.com"
                  className="mt-2 h-12 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/60 focus:border-primary"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold">
                    Şifre
                  </span>

                  {mode === "sign-in" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        void handlePasswordReset();
                      }}
                      className="text-[9px] font-black text-primary transition hover:opacity-70 disabled:cursor-wait disabled:opacity-40"
                    >
                      {resetLoading
                        ? "Gönderiliyor..."
                        : "Şifremi unuttum"}
                    </button>
                  )}
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  autoComplete={
                    mode === "sign-in"
                      ? "current-password"
                      : "new-password"
                  }
                  placeholder="En az 8 karakter"
                  className="mt-2 h-12 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/60 focus:border-primary"
                />
              </label>

              {errorMessage && (
                <div className="rounded-[15px] border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-xs font-bold leading-5 text-red-700">
                    {errorMessage}
                  </p>
                </div>
              )}

              {successMessage && (
                <div className="rounded-[15px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-bold leading-5 text-emerald-700">
                    {successMessage}
                  </p>

                  {mode === "sign-up" ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        void handleResendVerification();
                      }}
                      className="mt-2 text-[9px] font-black text-emerald-800 underline underline-offset-2 transition hover:opacity-70 disabled:cursor-wait disabled:opacity-40"
                    >
                      {verificationLoading
                        ? "Tekrar gönderiliyor..."
                        : "Doğrulama mailini tekrar gönder"}
                    </button>
                  ) : null}
                </div>
              )}

              <button
                type="submit"
                disabled={isBusy}
                className="mt-1 flex h-11 w-full items-center justify-center rounded-full bg-black text-xs font-bold text-white transition enabled:hover:bg-primary disabled:cursor-wait disabled:bg-black/30"
              >
                {loading
                  ? "İşlem yapılıyor..."
                  : mode === "sign-in"
                    ? "Giriş yap"
                    : "Hesap oluştur"}
              </button>
            </form>

            <p className="mt-4 text-center text-[8px] leading-4 text-muted-foreground">
              Devam ederek AQRYO hesabının giriş yöntemi olarak seçtiğin hesabı kullanmayı kabul edersin.
            </p>

            <Link
              to="/"
              className="mx-auto mt-3 flex h-9 w-fit items-center justify-center px-4 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}