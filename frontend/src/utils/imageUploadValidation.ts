export const AQRYO_ALLOWED_IMAGE_MIME_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
  ]);

export const AQRYO_ALLOWED_IMAGE_EXTENSIONS =
  new Set([
    "jpg",
    "jpeg",
    "png",
  ]);

export const AQRYO_MAX_IMAGE_BYTES =
  8 * 1024 * 1024;

export interface ValidateAqryoImageOptions {
  maxBytes?: number;
}

export function validateAqryoImageFile(
  file: File,
  options: ValidateAqryoImageOptions = {},
) {
  const maxBytes =
    options.maxBytes ??
    AQRYO_MAX_IMAGE_BYTES;

  if (
    !AQRYO_ALLOWED_IMAGE_MIME_TYPES.has(
      file.type,
    )
  ) {
    throw new Error(
      "Yalnızca JPG veya PNG görsel yükleyebilirsin.",
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "";

  if (
    !AQRYO_ALLOWED_IMAGE_EXTENSIONS.has(
      extension,
    )
  ) {
    throw new Error(
      "Dosya uzantısı JPG veya PNG olmalı.",
    );
  }

  if (
    file.size <= 0
  ) {
    throw new Error(
      "Dosya boş.",
    );
  }

  if (
    file.size > maxBytes
  ) {
    throw new Error(
      `Görsel en fazla ${Math.round(
        maxBytes /
          1024 /
          1024,
      )} MB olabilir.`,
    );
  }

  return true;
}

export function createSafeImageObjectName(
  file: File,
) {
  const extension =
    file.type === "image/png"
      ? "png"
      : "jpg";

  return `${crypto.randomUUID()}.${extension}`;
}