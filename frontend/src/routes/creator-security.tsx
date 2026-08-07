import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  getCurrentCreator,
  requestCreatorPasswordReset,
  signOutCreator,
  updateCreatorPassword,
} from "@/services/auth";
import { supabase } from "@/services/supabase";
import { createFileRoute } from "@tanstack/react-router";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

export const Route = createFileRoute(
  "/creator-security",
)({
  component: CreatorSecurityPage,
});

type SecurityAccount = {
  email: string;
  emailVerified: boolean;
  provider: string;
  createdAt: string | null;
  lastSignInAt: string | null;
};

function CreatorSecurityPage() {
  const [loading, setLoading] =
    useState(true);

  const [account, setAccount] =
    useState<SecurityAccount | null>(
      null,
    );

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [resetSending, setResetSending] =
    useState(false);

  const [signingOutAll, setSigningOutAll] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSecurity() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const user =
          await getCurrentCreator();

        if (!user) {
          window.location.href =
            "/creator-auth";
          return;
        }

        const provider =
          typeof user.app_metadata
            ?.provider === "string"
            ? user.app_metadata.provider
            : "email";

        if (!cancelled) {
          setAccount({
            email: user.email ?? "",
            emailVerified: Boolean(
              user.email_confirmed_at,
            ),
            provider,
            createdAt:
              user.created_at ?? null,
            lastSignInAt:
              user.last_sign_in_at ??
              null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Güvenlik bilgileri yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSecurity();

    return () => {
      cancelled = true;
    };
  }, []);

  const providerLabel = useMemo(
    () =>
      formatProvider(
        account?.provider ?? "email",
      ),
    [account?.provider],
  );

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (passwordSaving) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage(
        "Yeni şifre en az 8 karakter olmalı.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setErrorMessage(
        "Şifreler birbiriyle eşleşmiyor.",
      );
      return;
    }

    try {
      setPasswordSaving(true);

      await updateCreatorPassword(
        newPassword,
      );

      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Şifren güncellendi.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Şifre güncellenemedi.",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleResetEmail() {
    if (
      resetSending ||
      !account?.email
    ) {
      return;
    }

    try {
      setResetSending(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await requestCreatorPasswordReset(
        account.email,
      );

      setSuccessMessage(
        "Şifre sıfırlama bağlantısı e-posta adresine gönderildi.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Şifre sıfırlama e-postası gönderilemedi.",
      );
    } finally {
      setResetSending(false);
    }
  }

  async function handleSignOutAll() {
    if (signingOutAll) {
      return;
    }

    const confirmed =
      window.confirm(
        "Tüm cihazlardaki AQRYO oturumlarını kapatmak istediğine emin misin?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setSigningOutAll(true);
      setErrorMessage(null);

      const { error } =
        await supabase.auth.signOut({
          scope: "global",
        });

      if (error) {
        throw new Error(
          error.message,
        );
      }

      window.location.href =
        "/creator-auth";
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Oturumlar kapatılamadı.",
      );
      setSigningOutAll(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[960px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-6">
          <a
            href="/creator-account"
            className="text-[12px] font-black text-primary"
          >
            ← Hesabım
          </a>

          <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-primary">
            Hesabım
          </p>

          <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[44px]">
            Güvenlik
          </h1>

          <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-muted-foreground">
            Giriş yöntemini, şifreni ve
            açık oturumlarını buradan yönet.
          </p>
        </header>

        {loading ? (
          <section className="mt-6 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">
              Güvenlik bilgilerin
              yükleniyor...
            </p>
          </section>
        ) : null}

        {!loading ? (
          <div className="mt-6 space-y-5">
            {errorMessage ? (
              <div className="rounded-[18px] border border-red-100 bg-red-50 p-4 text-[12px] font-bold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4 text-[12px] font-bold text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <section className="rounded-[26px] border border-border bg-white p-5 shadow-[0_18px_50px_rgba(18,10,40,0.04)] sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
                Hesap erişimi
              </p>

              <h2 className="mt-2 text-[22px] font-black tracking-[-0.035em]">
                Giriş bilgilerin
              </h2>

              <div className="mt-5 divide-y divide-border rounded-[20px] border border-border px-5">
                <InfoRow
                  label="E-posta"
                  value={
                    account?.email || "—"
                  }
                />

                <InfoRow
                  label="E-posta durumu"
                  value={
                    account?.emailVerified
                      ? "Doğrulandı"
                      : "Doğrulanmadı"
                  }
                />

                <InfoRow
                  label="Giriş yöntemi"
                  value={providerLabel}
                />

                <InfoRow
                  label="Son giriş"
                  value={
                    account?.lastSignInAt
                      ? formatDate(
                          account.lastSignInAt,
                        )
                      : "—"
                  }
                />
              </div>
            </section>

            <section className="rounded-[26px] border border-border bg-white p-5 shadow-[0_18px_50px_rgba(18,10,40,0.04)] sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
                Şifre
              </p>

              <h2 className="mt-2 text-[22px] font-black tracking-[-0.035em]">
                Şifreni değiştir
              </h2>

              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Yeni şifren en az 8
                karakter olmalı.
              </p>

              <form
                onSubmit={
                  handlePasswordSubmit
                }
                className="mt-5 space-y-4"
              >
                <label className="block">
                  <span className="text-[12px] font-black">
                    Yeni şifre
                  </span>

                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-[16px] border border-border bg-white px-4 text-[14px] outline-none transition focus:border-primary"
                    placeholder="En az 8 karakter"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-black">
                    Yeni şifre tekrar
                  </span>

                  <input
                    type="password"
                    autoComplete="new-password"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    className="mt-2 h-12 w-full rounded-[16px] border border-border bg-white px-4 text-[14px] outline-none transition focus:border-primary"
                    placeholder="Şifreni tekrar yaz"
                  />
                </label>

                <button
                  type="submit"
                  disabled={
                    passwordSaving
                  }
                  className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[12px] font-black text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {passwordSaving
                    ? "Kaydediliyor..."
                    : "Şifreyi güncelle"}
                </button>
              </form>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-[12px] font-black">
                  Şifre sıfırlama bağlantısı
                </p>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Şifreni e-posta üzerinden
                  yenilemek istersen mevcut
                  hesabına sıfırlama bağlantısı
                  gönderebiliriz.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void handleResetEmail()
                  }
                  disabled={
                    resetSending ||
                    !account?.email
                  }
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-[11px] font-black transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetSending
                    ? "Gönderiliyor..."
                    : "Sıfırlama bağlantısı gönder"}
                </button>
              </div>
            </section>

            <section className="rounded-[26px] border border-border bg-white p-5 shadow-[0_18px_50px_rgba(18,10,40,0.04)] sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
                Oturumlar
              </p>

              <h2 className="mt-2 text-[22px] font-black tracking-[-0.035em]">
                Tüm cihazlardan çıkış
              </h2>

              <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-muted-foreground">
                Başka bir cihazda hesabının
                açık kaldığını düşünüyorsan
                tüm aktif AQRYO oturumlarını
                kapatabilirsin. Bu işlemden
                sonra yeniden giriş yapman
                gerekir.
              </p>

              <button
                type="button"
                onClick={() =>
                  void handleSignOutAll()
                }
                disabled={signingOutAll}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-red-200 bg-red-50 px-6 text-[12px] font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOutAll
                  ? "Oturumlar kapatılıyor..."
                  : "Tüm cihazlardan çıkış yap"}
              </button>
            </section>

            <section className="rounded-[22px] border border-primary/10 bg-primary/[0.035] p-5">
              <p className="text-[12px] font-black">
                Hesap güvenliği
              </p>

              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                AQRYO hiçbir zaman şifreni,
                kart bilgilerini veya
                doğrulama kodlarını mesajla
                istemez. Şüpheli bir giriş
                fark edersen şifreni değiştir
                ve tüm cihazlardan çıkış yap.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[12px] font-bold text-muted-foreground">
        {label}
      </span>

      <span className="break-all text-[13px] font-black">
        {value}
      </span>
    </div>
  );
}

function formatProvider(
  provider: string,
) {
  const normalized =
    provider.toLowerCase();

  if (normalized === "google") {
    return "Google";
  }

  if (normalized === "apple") {
    return "Apple";
  }

  if (normalized === "email") {
    return "E-posta ve şifre";
  }

  return provider;
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}