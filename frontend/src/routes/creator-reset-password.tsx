import { RESET_PASSWORD_COPY } from "@/lib/resetPasswordCopy";
import { AUTH_COPY } from "@/lib/authCopy";
import { useAqryoLocale } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  completeCreatorPasswordReset,
} from "@/services/auth";
import { supabase } from "@/services/supabase";

export const Route = createFileRoute(
  "/creator-reset-password",
)({
  component: CreatorResetPasswordPage,
});

function CreatorResetPasswordPage() {
  const navigate = useNavigate();
  const { locale } = useAqryoLocale();
  const ui = RESET_PASSWORD_COPY[locale];
  const auth = AUTH_COPY[locale];

  const [password, setPassword] =
    useState("");

  const [passwordAgain, setPasswordAgain] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    checkingRecoverySession,
    setCheckingRecoverySession,
  ] = useState(true);

  const [
    hasRecoverySession,
    setHasRecoverySession,
  ] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);


  useEffect(() => {
    let active = true;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hasRecoveryMarker = searchParams.get("type") === "recovery" || hashParams.get("type") === "recovery";
    let recoveryEventDetected = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          recoveryEventDetected = true;
          setHasRecoverySession(true);
          setCheckingRecoverySession(false);
        }
      },
    );

    async function validateRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (
        hasRecoveryMarker &&
        session
      ) {
        setHasRecoverySession(true);
        setCheckingRecoverySession(false);
        return;
      }

      if (!hasRecoveryMarker) {
        setHasRecoverySession(false);
        setCheckingRecoverySession(false);
        return;
      }

      window.setTimeout(async () => {
        if (
          !active ||
          recoveryEventDetected
        ) {
          return;
        }

        const {
          data: {
            session: delayedSession,
          },
        } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        setHasRecoverySession(
          Boolean(delayedSession),
        );
        setCheckingRecoverySession(false);
      }, 1200);
    }

    void validateRecoverySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!hasRecoverySession) {
      setErrorMessage(
        ui.invalidLink,
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        auth.minPassword,
      );
      return;
    }

    if (password !== passwordAgain) {
      setErrorMessage(
        ui.mismatch,
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      await completeCreatorPasswordReset(
        password,
      );

      navigate({
        to: "/creator-studio",
      });
    } catch (error) {
      setErrorMessage(
        auth.error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8fb] px-4 py-8 text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[320px] bg-gradient-to-br from-fuchsia-500/15 via-primary/10 to-rose-500/15 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[30px] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(35,16,55,0.1)] sm:p-8">
        <Link
          to="/"
          className="text-[28px] font-black tracking-[-0.065em] text-primary"
        >
          AQRYO.
        </Link>

        <div className="mt-4 flex justify-end"><LanguageSelector /></div>
        <p className="mt-8 text-[9px] font-black uppercase tracking-[0.13em] text-primary">
          {ui.reset}
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
          {ui.reset}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {auth.minPassword}
        </p>

        {checkingRecoverySession ? (
          <div className="mt-6 rounded-[15px] border border-border bg-background px-4 py-4">
            <p className="text-xs font-bold text-muted-foreground">
              {auth.working}
            </p>
          </div>
        ) : !hasRecoverySession ? (
          <div className="mt-6 rounded-[15px] border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-xs font-bold leading-5 text-red-700">
              {ui.invalidLink}
            </p>

            <Link
              to="/creator-auth"
              className="mt-3 inline-flex text-[10px] font-black text-red-700 underline underline-offset-2"
            >
              {ui.requestLink}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-3"
          >
            <label className="block">
              <span className="text-[10px] font-bold">
                {ui.newPassword}
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                placeholder={auth.minPassword} required minLength={8}
                className="mt-2 h-12 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold">
                {ui.repeatPassword}
              </span>

              <input
                type="password"
                value={passwordAgain}
                onChange={(event) =>
                  setPasswordAgain(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                placeholder={ui.repeatPassword} required minLength={8}
                className="mt-2 h-12 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-[15px] border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-bold leading-5 text-red-700">
                  {errorMessage}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-full bg-black text-xs font-bold text-white transition enabled:hover:bg-primary disabled:cursor-wait disabled:bg-black/30"
            >
              {loading
                ? auth.working
                : ui.save}
            </button>
          </form>
        )}

        <Link
          to="/creator-auth"
          className="mx-auto mt-4 flex h-9 w-fit items-center justify-center px-4 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
        >
          {ui.backLogin}
        </Link>
      </section>
    </main>
  );
}