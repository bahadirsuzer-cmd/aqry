import {
  useEffect,
  useState,
} from "react";
import {
  adminPauseExperience,
  adminReleaseExperienceModeration,
} from "@/services/moderation";

interface ModerationActionDialogProps {
  open: boolean;
  mode: "pause" | "release";
  experienceId: string;
  experienceTitle: string;
  reportId?: string;
  onClose: () => void;
  onCompleted: () => void;
}

export function ModerationActionDialog({
  open,
  mode,
  experienceId,
  experienceTitle,
  reportId,
  onClose,
  onCompleted,
}: ModerationActionDialogProps) {
  const [reason, setReason] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setSubmitting(false);
      setErrorMessage(null);
    }
  }, [open, mode]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      if (mode === "pause") {
        await adminPauseExperience(
          experienceId,
          reason,
          reportId,
        );
      } else {
        await adminReleaseExperienceModeration(
          experienceId,
          reason,
        );
      }

      onCompleted();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "İşlem tamamlanamadı.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div className="w-full max-w-[520px] rounded-t-[28px] bg-white p-5 sm:rounded-[28px] sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary">
              Moderasyon
            </p>

            <h2 className="mt-2 text-[23px] font-black tracking-[-0.04em]">
              {mode === "pause"
                ? "Experience’ı duraklat"
                : "Moderasyon kilidini kaldır"}
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
              {experienceTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl"
          >
            ×
          </button>
        </div>

        <label
          htmlFor="moderation-reason"
          className="mt-5 block text-[10px] font-black"
        >
          {mode === "pause"
            ? "Gerekçe"
            : "Not"}
        </label>

        <textarea
          id="moderation-reason"
          value={reason}
          onChange={(event) =>
            setReason(
              event.target.value,
            )
          }
          placeholder={
            mode === "pause"
              ? "Neden duraklatılıyor?"
              : "İsteğe bağlı admin notu..."
          }
          className="mt-2 min-h-[110px] w-full resize-none rounded-[18px] border border-border bg-white p-4 text-[11px] outline-none focus:border-primary"
        />

        {errorMessage ? (
          <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-11 flex-1 rounded-full border border-border text-[10px] font-black"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              (
                mode === "pause" &&
                reason.trim().length < 3
              )
            }
            className={`h-11 flex-1 rounded-full text-[10px] font-black text-white disabled:opacity-50 ${
              mode === "pause"
                ? "bg-red-700"
                : "bg-black"
            }`}
          >
            {submitting
              ? "İşleniyor..."
              : mode === "pause"
                ? "Duraklat"
                : "Kilidi kaldır"}
          </button>
        </div>
      </div>
    </div>
  );
}