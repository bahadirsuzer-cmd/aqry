import {
  useState,
} from "react";
import {
  requestCreatorAccountDeletion,
  requestCreatorDataExport,
} from "@/services/creatorAccountPreferences";

interface CreatorDataControlsCardProps {
  initialExportRequestedAt?: string | null;
  initialDeletionRequestedAt?: string | null;
}

export function CreatorDataControlsCard({
  initialExportRequestedAt = null,
  initialDeletionRequestedAt = null,
}: CreatorDataControlsCardProps) {
  const [
    exportRequestedAt,
    setExportRequestedAt,
  ] = useState(
    initialExportRequestedAt,
  );

  const [
    deletionRequestedAt,
    setDeletionRequestedAt,
  ] = useState(
    initialDeletionRequestedAt,
  );

  const [exporting, setExporting] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);
  const [
    deletionConfirmation,
    setDeletionConfirmation,
  ] = useState("");
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleExport() {
    if (exporting) {
      return;
    }

    try {
      setExporting(true);
      setErrorMessage(null);

      const requestedAt =
        await requestCreatorDataExport();

      setExportRequestedAt(
        requestedAt,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Talep oluşturulamadı.",
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleDeletion() {
    if (deleting) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage(null);

      const requestedAt =
        await requestCreatorAccountDeletion(
          deletionConfirmation,
        );

      setDeletionRequestedAt(
        requestedAt,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Hesap silme talebi oluşturulamadı.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-[22px] border border-border bg-white p-5 sm:p-6">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-primary">
        Veri ve hesap
      </p>

      <h2 className="mt-2 text-[20px] font-black tracking-[-0.035em]">
        Verilerini yönet
      </h2>

      <div className="mt-5 rounded-[16px] border border-border bg-[#fafafa] p-4">
        <p className="text-[11px] font-black">
          Verilerimi dışa aktar
        </p>

        <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
          Hesap, profil ve AQRYO kullanım verilerinin dışa aktarılması için talep oluşturur.
        </p>

        {exportRequestedAt ? (
          <p className="mt-3 text-[9px] font-bold text-emerald-700">
            Talep alındı.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-5 text-[10px] font-black disabled:opacity-50"
          >
            {exporting
              ? "Talep oluşturuluyor..."
              : "Dışa aktarma talebi oluştur"}
          </button>
        )}
      </div>

      <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50/60 p-4">
        <p className="text-[11px] font-black text-red-800">
          Hesabımı sil
        </p>

        <p className="mt-1 text-[9px] leading-4 text-red-700/80">
          Bu buton hesabı anında silmez. Açık bakiye, pending ödeme, chargeback ve yasal saklama gereklilikleri kontrol edildikten sonra silme süreci tamamlanır.
        </p>

        {deletionRequestedAt ? (
          <p className="mt-3 text-[9px] font-bold text-red-800">
            Hesap silme talebi alındı.
          </p>
        ) : (
          <>
            <label
              htmlFor="delete-confirmation"
              className="mt-4 block text-[9px] font-black text-red-800"
            >
              Devam etmek için HESABIMI SİL yaz
            </label>

            <input
              id="delete-confirmation"
              value={
                deletionConfirmation
              }
              onChange={(event) =>
                setDeletionConfirmation(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-red-200 bg-white px-4 text-[11px] outline-none focus:border-red-400"
            />

            <button
              type="button"
              onClick={
                handleDeletion
              }
              disabled={deleting}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-red-700 px-5 text-[10px] font-black text-white disabled:opacity-50"
            >
              {deleting
                ? "Talep oluşturuluyor..."
                : "Hesap silme talebi oluştur"}
            </button>
          </>
        )}
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-[14px] bg-red-50 px-4 py-3 text-[10px] font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}