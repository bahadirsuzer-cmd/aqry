import {
  useEffect,
  useRef,
  useState,
} from "react";

import { getCurrentCreator } from "@/services/auth";
import { uploadExperienceImage } from "@/services/media";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
}

type EditorState = {
  file: File;
  previewUrl: string;
};

const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = 900;

export function ImageUploader({
  value,
  onChange,
  label = "Görsel",
  helperText = "JPG veya PNG yükleyebilirsin.",
}: ImageUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [editor, setEditor] =
    useState<EditorState | null>(
      null,
    );

  const [zoom, setZoom] =
    useState(1);

  const [positionX, setPositionX] =
    useState(50);

  const [positionY, setPositionY] =
    useState(50);

  useEffect(() => {
    return () => {
      if (editor?.previewUrl) {
        URL.revokeObjectURL(
          editor.previewUrl,
        );
      }
    };
  }, [editor?.previewUrl]);

  function resetEditor() {
    if (editor?.previewUrl) {
      URL.revokeObjectURL(
        editor.previewUrl,
      );
    }

    setEditor(null);
    setZoom(1);
    setPositionX(50);
    setPositionY(50);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker() {
    if (uploading) {
      return;
    }

    inputRef.current?.click();
  }

  function handleSelectedFile(
    file: File | null,
  ) {
    if (!file || uploading) {
      return;
    }

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png"
    ) {
      setError(
        "Yalnızca JPG ve PNG görseller yüklenebilir.",
      );
      return;
    }

    setError(null);

    if (editor?.previewUrl) {
      URL.revokeObjectURL(
        editor.previewUrl,
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setEditor({
      file,
      previewUrl,
    });

    setZoom(1);
    setPositionX(50);
    setPositionY(50);
  }

  async function createCroppedFile(
    file: File,
    previewUrl: string,
  ) {
    const image =
      await loadImage(previewUrl);

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Görsel düzenleyici başlatılamadı.",
      );
    }

    const baseScale = Math.max(
      OUTPUT_WIDTH /
        image.naturalWidth,
      OUTPUT_HEIGHT /
        image.naturalHeight,
    );

    const scale =
      baseScale * zoom;

    const renderedWidth =
      image.naturalWidth * scale;

    const renderedHeight =
      image.naturalHeight * scale;

    const overflowX =
      Math.max(
        0,
        renderedWidth -
          OUTPUT_WIDTH,
      );

    const overflowY =
      Math.max(
        0,
        renderedHeight -
          OUTPUT_HEIGHT,
      );

    const drawX =
      -overflowX *
      (positionX / 100);

    const drawY =
      -overflowY *
      (positionY / 100);

    context.clearRect(
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT,
    );

    context.drawImage(
      image,
      drawX,
      drawY,
      renderedWidth,
      renderedHeight,
    );

    const outputType =
      file.type === "image/png"
        ? "image/png"
        : "image/jpeg";

    const blob =
      await canvasToBlob(
        canvas,
        outputType,
      );

    const extension =
      outputType === "image/png"
        ? "png"
        : "jpg";

    return new File(
      [
        blob,
      ],
      `aqryo-cover-${crypto.randomUUID()}.${extension}`,
      {
        type: outputType,
      },
    );
  }

  async function saveEditedImage() {
    if (!editor || uploading) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const creator =
        await getCurrentCreator();

      if (!creator) {
        throw new Error(
          "Görsel yüklemek için creator hesabına giriş yapmalısın.",
        );
      }

      const croppedFile =
        await createCroppedFile(
          editor.file,
          editor.previewUrl,
        );

      const uploaded =
        await uploadExperienceImage(
          creator.id,
          croppedFile,
        );

      onChange(
        uploaded.publicUrl,
      );

      resetEditor();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Görsel yüklenemedi.";

      setError(message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    onChange("");
    resetEditor();
    setError(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold">
          {label}
        </span>

        {value && !editor ? (
          <button
            type="button"
            onClick={removeImage}
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
          handleSelectedFile(
            event.target.files?.[0] ??
              null,
          );
        }}
      />

      {editor ? (
        <div className="mt-2 overflow-hidden rounded-[18px] border border-primary/20 bg-white">
          <div className="border-b border-border bg-primary/[0.025] p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-black text-foreground">
                  Görseli ayarla
                </p>

                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  Yakınlaştır ve görselin
                  görünmesini istediğin
                  alanı belirle.
                </p>
              </div>

              <span className="mt-2 rounded-full bg-primary/[0.08] px-3 py-1.5 text-[12px] font-black text-primary sm:mt-0">
                16:9 kapak
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[16px] bg-muted">
              <img
                src={editor.previewUrl}
                alt="Düzenlenen görsel önizlemesi"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{
                  objectPosition: `${positionX}% ${positionY}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${positionX}% ${positionY}%`,
                }}
              />

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />

              <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-white/35" />

              <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-white/35" />
            </div>

            <div className="mt-5 grid gap-4">
              <label>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-foreground">
                    Yakınlaştır
                  </span>

                  <span className="text-[12px] font-black text-primary">
                    {Math.round(
                      zoom * 100,
                    )}
                    %
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.01"
                  value={zoom}
                  onChange={(event) =>
                    setZoom(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="mt-2 w-full accent-violet-600"
                />
              </label>

              <label>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-foreground">
                    Yatay konum
                  </span>

                  <span className="text-[12px] font-black text-primary">
                    {positionX}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={positionX}
                  onChange={(event) =>
                    setPositionX(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="mt-2 w-full accent-violet-600"
                />
              </label>

              <label>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-foreground">
                    Dikey konum
                  </span>

                  <span className="text-[12px] font-black text-primary">
                    {positionY}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={positionY}
                  onChange={(event) =>
                    setPositionY(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="mt-2 w-full accent-violet-600"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={uploading}
                onClick={resetEditor}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-[12px] font-black text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
              >
                Vazgeç
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={openFilePicker}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-[12px] font-black text-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  Başka görsel seç
                </button>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    void saveEditedImage();
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[12px] font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading
                    ? "Kaydediliyor..."
                    : "Ayarı kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : value ? (
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
              Görsel hazır. Yeni bir
              görsel yükleyip konumunu
              ayarlayabilirsin.
            </p>

            <button
              type="button"
              disabled={uploading}
              onClick={openFilePicker}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border bg-white px-4 text-[12px] font-black text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Görseli değiştir
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={openFilePicker}
          className="mt-2 flex min-h-[120px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-primary/30 bg-primary/[0.025] px-5 py-6 text-center transition hover:border-primary/55 hover:bg-primary/[0.045] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-[20px] text-primary">
            ↑
          </span>

          <span className="mt-3 text-[14px] font-black text-foreground">
            Görsel yükle
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

function loadImage(
  src: string,
) {
  return new Promise<HTMLImageElement>(
    (resolve, reject) => {
      const image = new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Görsel düzenlemek için açılamadı.",
          ),
        );

      image.src = src;
    },
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality = 0.92,
) {
  return new Promise<Blob>(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Görsel kaydedilemedi.",
              ),
            );
            return;
          }

          resolve(blob);
        },
        type,
        quality,
      );
    },
  );
}