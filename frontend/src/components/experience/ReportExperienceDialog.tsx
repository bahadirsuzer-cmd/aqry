import {
  useEffect,
  useState,
} from "react";
import {
  submitExperienceReport,
  type ExperienceReportReason,
} from "@/services/experienceReports";

interface ReportExperienceDialogProps {
  experienceId: string;
  open: boolean;
  onClose: () => void;
}

const REASONS: Array<{
  key: ExperienceReportReason;
  label: string;
  description: string;
}> = [
  {
    key: "spam",
    label: "Spam",
    description:
      "Yanıltıcı veya anlamsız tekrar eden içerik.",
  },
  {
    key: "fraud",
    label: "Dolandırıcılık",
    description:
      "Para, kimlik veya kişisel bilgi almaya yönelik şüpheli davranış.",
  },
  {
    key: "harassment",
    label: "Taciz veya tehdit",
    description:
      "Bir kişiyi hedef alan taciz, tehdit veya ifşa.",
  },
  {
    key: "illegal",
    label: "Yasa dışı içerik",
    description:
      "Yasa dışı faaliyet veya hizmet.",
  },
  {
    key: "sexual",
    label: "Cinsel içerik",
    description:
      "AQRYO içerik kurallarını ihlal eden cinsel içerik.",
  },
  {
    key: "copyright",
    label: "Telif / hak ihlali",
    description:
      "İzinsiz kullanılan içerik veya başka bir hak ihlali.",
  },
  {
    key: "other",
    label: "Diğer",
    description:
      "Yukarıdaki kategorilere girmeyen başka bir sorun.",
  },
];

export function ReportExperienceDialog({
  experienceId,
  open,
  onClose,
}: ReportExperienceDialogProps) {
  const [reason, setReason] =
    useState<ExperienceReportReason | null>(
      null,
    );
  const [details, setDetails] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason(null);
    setDetails("");
    setSubmitting(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !submitting
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [
    open,
    submitting,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (!reason) {
      setErrorMessage(
        "Lütfen bir bildirim nedeni seç.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const result =
        await submitExperienceReport({
          experienceId,
          reason,
          details,
        });

      setSuccessMessage(
        result.alreadyReported
          ? "Bu Experience’ı daha önce bildirmişsin. Mevcut bildirimin korunuyor."
          : "Bildirimin alındı. Teşekkürler.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Bildirim gönderilemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-experience-title"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-[0_30px_90px_rgba(20,10,35,0.25)] sm:rounded-[28px] sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary">
              AQRYO güvenlik
            </p>

            <h2
              id="report-experience-title"
              className="mt-2 text-[24px] font-black tracking-[-0.04em]"
            >
              Bu içeriği bildir
            </h2>

            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              En uygun nedeni seç. Bildirimin creator’a açık şekilde gösterilmez.
            </p>
          </div>

          <button
            type="button"
            aria-label="Kapat"
            disabled={submitting}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[20px] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-[12px] font-black text-emerald-800">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-5 text-[10px] font-black text-white"
            >
              Kapat
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-2">
              {REASONS.map((item) => {
                const selected =
                  reason === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setReason(item.key)
                    }
                    className={`w-full rounded-[18px] border p-4 text-left transition ${
                      selected
                        ? "border-primary bg-primary/[0.05]"
                        : "border-border bg-white hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-border"
                        }`}
                      >
                        {selected
                          ? "✓"
                          : ""}
                      </span>

                      <span>
                        <span className="block text-[11px] font-black">
                          {item.label}
                        </span>

                        <span className="mt-1 block text-[9px] leading-4 text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <label
                htmlFor="report-details"
                className="text-[10px] font-black"
              >
                Ek açıklama
                {reason === "other"
                  ? " *"
                  : " (isteğe bağlı)"}
              </label>

              <textarea
                id="report-details"
                value={details}
                maxLength={1000}
                onChange={(event) =>
                  setDetails(
                    event.target.value,
                  )
                }
                placeholder="Sorunu kısaca açıkla..."
                className="mt-2 min-h-[105px] w-full resize-none rounded-[18px] border border-border bg-white p-4 text-[12px] outline-none transition placeholder:text-muted-foreground/60 focus:border-primary"
              />

              <p className="mt-1 text-right text-[9px] text-muted-foreground">
                {details.length}/1000
              </p>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-black px-6 text-[11px] font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Gönderiliyor..."
                : "Bildirimi gönder"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}