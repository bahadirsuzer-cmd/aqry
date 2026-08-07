import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import {
  getCreatorAccountExtensionSnapshot,
  requestCreatorAccountDeletion,
} from "@/services/creatorAccountPreferences";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/creator-delete-account",
)({
  component: CreatorDeleteAccountPage,
});

function CreatorDeleteAccountPage() {
  const [loading, setLoading] =
    useState(true);

  const [
    deletionRequestedAt,
    setDeletionRequestedAt,
  ] = useState<string | null>(null);

  const [
    confirmationText,
    setConfirmationText,
  ] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);

        const user =
          await getCurrentCreator();

        if (!user) {
          window.location.href =
            "/creator-auth";
          return;
        }

        const snapshot =
          await getCreatorAccountExtensionSnapshot();

        if (!cancelled) {
          setDeletionRequestedAt(
            snapshot.deletionRequestedAt,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Hesap bilgileri yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDeleteRequest() {
    if (submitting) {
      return;
    }

    const confirmed =
      window.confirm(
        "Hesap silme talebi oluşturulacak. Devam etmek istiyor musun?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const requestedAt =
        await requestCreatorAccountDeletion(
          confirmationText,
        );

      setDeletionRequestedAt(
        requestedAt,
      );

      setSuccessMessage(
        "Hesap silme talebin oluşturuldu.",
      );

      setConfirmationText("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Hesap silme talebi oluşturulamadı.",
      );
    } finally {
      setSubmitting(false);
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

      <div className="mx-auto max-w-[860px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-6">
          <a
            href="/creator-account"
            className="text-[12px] font-black text-primary"
          >
            ← Hesabım
          </a>

          <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-red-600">
            Hesabım
          </p>

          <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[44px]">
            Hesabı sil
          </h1>

          <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-muted-foreground">
            Bu işlem hesabını anında
            silmez. Önce güvenli bir silme
            talebi oluşturur.
          </p>
        </header>

        {loading ? (
          <section className="mt-6 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">
              Hesap bilgileri yükleniyor...
            </p>
          </section>
        ) : (
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

            {deletionRequestedAt ? (
              <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <p className="text-[13px] font-black text-amber-900">
                  Silme talebi mevcut
                </p>

                <p className="mt-2 text-[12px] leading-5 text-amber-800">
                  Talep tarihi:{" "}
                  {formatDate(
                    deletionRequestedAt,
                  )}
                </p>

                <p className="mt-2 text-[12px] leading-5 text-amber-800">
                  Bu durum hesabın
                  silindiği anlamına gelmez.
                  Talep, finansal ve yasal
                  kontroller tamamlandıktan
                  sonra işlenmelidir.
                </p>
              </section>
            ) : null}

            <section className="rounded-[26px] border border-red-100 bg-white p-5 shadow-[0_18px_50px_rgba(18,10,40,0.04)] sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-red-600">
                Kalıcı işlem
              </p>

              <h2 className="mt-2 text-[22px] font-black tracking-[-0.035em]">
                Silme talebi oluştur
              </h2>

              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                AQRYO hesabında satın alma,
                Gift, creator geliri,
                refund, chargeback veya
                yasal saklama gerektiren
                kayıtlar bulunabilir. Bu
                yüzden hesap tarayıcıdan
                doğrudan silinmez.
              </p>

              <div className="mt-5 rounded-[18px] bg-background p-4">
                <p className="text-[12px] font-black">
                  Devam etmek için
                </p>

                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  Aşağıdaki alana tam olarak{" "}
                  <strong>
                    HESABIMI SİL
                  </strong>{" "}
                  yaz.
                </p>
              </div>

              <input
                type="text"
                value={confirmationText}
                onChange={(event) =>
                  setConfirmationText(
                    event.target.value,
                  )
                }
                className="mt-4 h-12 w-full rounded-[16px] border border-border bg-white px-4 text-[14px] font-bold outline-none transition focus:border-red-300"
                placeholder="HESABIMI SİL"
              />

              <button
                type="button"
                onClick={() =>
                  void handleDeleteRequest()
                }
                disabled={
                  submitting ||
                  confirmationText
                    .trim()
                    .toLocaleUpperCase(
                      "tr-TR",
                    ) !== "HESABIMI SİL"
                }
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-6 text-[12px] font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Talep oluşturuluyor..."
                  : "Hesap silme talebi oluştur"}
              </button>
            </section>

            <section className="rounded-[24px] border border-border bg-white p-5 sm:p-6">
              <h2 className="text-[14px] font-black">
                Ne silinebilir, ne
                saklanabilir?
              </h2>

              <div className="mt-4 space-y-3 text-[12px] leading-5 text-muted-foreground">
                <p>
                  Profil bilgileri ve
                  kullanıcıya bağlı kişisel
                  alanlar silme akışının
                  parçası olabilir.
                </p>

                <p>
                  Ödeme, refund, chargeback,
                  muhasebe ve yasal saklama
                  yükümlülüğü olan kayıtlar
                  gerektiği süre boyunca
                  tutulabilir.
                </p>

                <p>
                  Silme talebi oluşturmak
                  mevcut hakediş, payout veya
                  dispute süreçlerini otomatik
                  olarak iptal etmez.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
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