const SAFE_WEB_PROTOCOLS = new Set([
  "http:",
  "https:",
]);

export interface ValidateExternalUrlOptions {
  allowEmpty?: boolean;
}

export function validateExternalUrl(
  value: string,
  options: ValidateExternalUrlOptions = {},
): string | null {
  const normalized =
    value.trim();

  if (!normalized) {
    if (options.allowEmpty) {
      return null;
    }

    throw new Error(
      "Geçerli bir bağlantı gerekli.",
    );
  }

  let url: URL;

  try {
    url = new URL(normalized);
  } catch {
    throw new Error(
      "Geçerli bir bağlantı gir.",
    );
  }

  if (
    !SAFE_WEB_PROTOCOLS.has(
      url.protocol,
    )
  ) {
    throw new Error(
      "Yalnızca http veya https bağlantıları kullanılabilir.",
    );
  }

  return url.toString();
}