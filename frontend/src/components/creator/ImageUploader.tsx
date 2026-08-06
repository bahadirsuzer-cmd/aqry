import { useRef, useState } from "react";

import { getCurrentCreator } from "@/services/auth";
import { uploadExperienceImage } from "@/services/media";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Görsel",
  helperText = "JPG veya PNG yükleyebilirsin.",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file || uploading) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const creator = await getCurrentCreator();

      if (!creator) {
        throw new Error(
          "Görsel yüklemek için creator hesabına giriş yapmalısın.",
        );
      }

      const uploaded = await uploadExperienceImage(
        creator.id,
        file,
      );

      onChange(uploaded.publicUrl);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Görsel yüklenemedi.";

      setError(message);
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold">
          {label}
        </span>

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={uploading}
            className="text-[12px] font-bold text-red-600 transition hover:text-red-700 disabled:opacity-50"
          >
            Kaldır
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(event) => {
          void handleFile(
            event.target.files?.[0] ?? null,
          );
        }}
      />

      {value ? (
        <div className="mt-2 overflow-hidden rounded-[18px] border border-border bg-background">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <img
              src={value}
              alt="Yüklenen görsel önizlemesi"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-muted-foreground">
              Görsel hazır. İstersen başka bir görselle değiştirebilirsin.
            </p>

            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border bg-white px-4 text-[12px] font-black text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Yükleniyor..."
                : "Görseli değiştir"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex min-h-[120px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-primary/30 bg-primary/[0.025] px-5 py-6 text-center transition hover:border-primary/55 hover:bg-primary/[0.045] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-[20px] text-primary">
            ↑
          </span>

          <span className="mt-3 text-[14px] font-black text-foreground">
            {uploading
              ? "Görsel yükleniyor..."
              : "Görsel yükle"}
          </span>

          <span className="mt-1 max-w-[360px] text-[12px] leading-5 text-muted-foreground">
            {helperText}
          </span>
        </button>
      )}

      {error ? (
        <p className="mt-2 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold leading-5 text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}