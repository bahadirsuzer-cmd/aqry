import { useMemo, useRef, useState } from "react";
import {
  defaultCreatorAvatarSettings,
  type CreatorAvatarBackground,
  type CreatorAvatarSettings,
  type CreatorAvatarStyle,
  uploadCreatorAvatar,
} from "@/services/creatorAvatar";

interface AvatarCustomizerProps {
  value: CreatorAvatarSettings;
  onChange: (value: CreatorAvatarSettings) => void;
  disabled?: boolean;
  displayName?: string;
  username?: string;
  bio?: string;
}

const STYLE_OPTIONS: Array<{
  value: CreatorAvatarStyle;
  label: string;
  description: string;
}> = [
  {
    value: "classic",
    label: "Klasik",
    description: "Temiz ve sade görünüm",
  },
  {
    value: "soft",
    label: "Soft",
    description: "Yumuşak gölge ve halka",
  },
  {
    value: "glow",
    label: "Glow",
    description: "Daha canlı, hafif parlak",
  },
  {
    value: "outline",
    label: "Çerçeveli",
    description: "Belirgin dış halka",
  },
  {
    value: "aqryo",
    label: "AQRYO",
    description: "Mor ve turkuaz vurgu",
  },
  {
    value: "card",
    label: "Kart",
    description: "Profil kartlarına uyumlu",
  },
];

const BACKGROUND_OPTIONS: Array<{
  value: CreatorAvatarBackground;
  label: string;
  className: string;
}> = [
  {
    value: "violet",
    label: "Mor",
    className: "from-violet-500 to-fuchsia-500",
  },
  {
    value: "pink",
    label: "Pembe",
    className: "from-pink-500 to-rose-500",
  },
  {
    value: "blue",
    label: "Mavi",
    className: "from-blue-500 to-cyan-500",
  },
  {
    value: "mint",
    label: "Mint",
    className: "from-emerald-400 to-teal-500",
  },
  {
    value: "orange",
    label: "Turuncu",
    className: "from-orange-400 to-amber-500",
  },
  {
    value: "dark",
    label: "Koyu",
    className: "from-slate-800 to-slate-950",
  },
];

function getBackgroundClass(value: CreatorAvatarBackground) {
  return (
    BACKGROUND_OPTIONS.find((item) => item.value === value)?.className ??
    "from-violet-500 to-fuchsia-500"
  );
}

function getFrameClass(style: CreatorAvatarStyle) {
  if (style === "soft") {
    return "ring-4 ring-white/70 shadow-[0_12px_28px_rgba(15,23,42,0.16)]";
  }

  if (style === "glow") {
    return "ring-4 ring-white/80 shadow-[0_0_0_8px_rgba(168,85,247,0.12),0_16px_34px_rgba(168,85,247,0.28)]";
  }

  if (style === "outline") {
    return "ring-4 ring-foreground/15 shadow-[0_12px_28px_rgba(15,23,42,0.15)]";
  }

  if (style === "aqryo") {
    return "ring-4 ring-cyan-300/80 shadow-[0_0_0_8px_rgba(34,211,238,0.10),0_16px_34px_rgba(124,58,237,0.24)]";
  }

  if (style === "card") {
    return "ring-4 ring-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]";
  }

  return "ring-2 ring-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]";
}

function getInitials(displayName: string, username: string) {
  const source =
    displayName.trim() ||
    username.trim() ||
    "AQ";

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.slice(0, 1).toLocaleUpperCase("tr-TR"),
    )
    .join("");
}

export function AvatarCustomizer({
  value,
  onChange,
  disabled = false,
  displayName = "AQRYO kullanıcısı",
  username = "",
  bio = "",
}: AvatarCustomizerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const safeValue = value ?? defaultCreatorAvatarSettings;

  const previewStyle = useMemo(
    () => ({
      objectPosition: `${safeValue.avatarX}% ${safeValue.avatarY}%`,
      transform: `scale(${safeValue.avatarZoom})`,
      transformOrigin: "center center",
    }),
    [
      safeValue.avatarX,
      safeValue.avatarY,
      safeValue.avatarZoom,
    ],
  );

  const initials = useMemo(
    () => getInitials(displayName, username),
    [displayName, username],
  );

  const cropWarning =
    !safeValue.avatarUrl
      ? null
      : safeValue.avatarZoom < 0.85
        ? "Fotoğraf biraz uzak. Profil kartında yüz küçük kalabilir."
        : safeValue.avatarZoom > 2.4
          ? "Fotoğraf çok yakın. Küçük avatar alanlarında yüz kesilebilir."
          : safeValue.avatarX < 10 ||
              safeValue.avatarX > 90 ||
              safeValue.avatarY < 10 ||
              safeValue.avatarY > 90
            ? "Konum kenara çok yakın. Profil kartında önemli bölüm kesilebilir."
            : null;

  async function handleFile(file: File | null) {
    if (!file || disabled || uploading) {
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const uploaded = await uploadCreatorAvatar(file);

      onChange({
        ...safeValue,
        avatarUrl: uploaded.publicUrl,
        avatarZoom: 1,
        avatarX: 50,
        avatarY: 50,
      });
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Avatar yüklenemedi.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <section className="rounded-[28px] border border-border bg-card p-5 sm:p-6">
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
          Avatar
        </p>

        <h3 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-foreground">
          Profil görselini düzenle
        </h3>

        <p className="mt-2 max-w-[760px] text-[14px] leading-6 text-muted-foreground">
          Fotoğrafını yükle, konumlandır ve stilini seç. Profil kartı önizlemesi
          sayesinde kaydetmeden önce nasıl görüneceğini kontrol edebilirsin.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
        }}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-5">
          {!safeValue.avatarUrl ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-primary/30 bg-primary/[0.03] px-5 py-8 text-center transition hover:border-primary/55 hover:bg-primary/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/[0.10] text-[22px] font-black text-primary">
                ↑
              </span>

              <span className="mt-4 text-[16px] font-black text-foreground">
                {uploading ? "Yükleniyor..." : "Fotoğraf yükle"}
              </span>

              <span className="mt-1 text-[13px] leading-5 text-muted-foreground">
                JPG veya PNG · en fazla 5 MB
              </span>
            </button>
          ) : (
            <div className="rounded-[24px] border border-border bg-background p-4 sm:p-5">
              <div
                className={`relative mx-auto h-[300px] w-full max-w-[430px] overflow-hidden rounded-[30px] bg-gradient-to-br ${getBackgroundClass(
                  safeValue.avatarBg,
                )}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.30),transparent_42%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_36%)]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`relative h-[190px] w-[190px] overflow-hidden rounded-full bg-white/90 ${
                      safeValue.avatarFrame
                        ? getFrameClass(safeValue.avatarStyle)
                        : ""
                    }`}
                  >
                    <img
                      src={safeValue.avatarUrl}
                      alt="Avatar önizleme"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={previewStyle}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-4 text-[13px] font-black text-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {uploading ? "Yükleniyor..." : "Fotoğrafı değiştir"}
                </button>

                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() =>
                    onChange({
                      ...safeValue,
                      avatarZoom: 1,
                      avatarX: 50,
                      avatarY: 50,
                    })
                  }
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-4 text-[13px] font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
                >
                  Konumu sıfırla
                </button>
              </div>
            </div>
          )}

          {uploadError ? (
            <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold leading-5 text-red-700">
              {uploadError}
            </p>
          ) : null}

          {cropWarning ? (
            <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold leading-5 text-amber-700">
              {cropWarning}
            </p>
          ) : null}

          <div className="rounded-[24px] border border-border p-4 sm:p-5">
            <h4 className="text-[16px] font-black text-foreground">
              Fotoğrafı konumlandır
            </h4>

            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              Yüzü dairenin merkezinde tutman küçük profil kartlarında daha iyi
              sonuç verir.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-[14px] font-black text-foreground">
                    Yakınlaştır
                  </label>

                  <span className="text-[13px] font-bold text-primary">
                    {Math.round(safeValue.avatarZoom * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.8"
                  max="2.6"
                  step="0.01"
                  value={safeValue.avatarZoom}
                  disabled={!safeValue.avatarUrl || disabled}
                  onChange={(event) =>
                    onChange({
                      ...safeValue,
                      avatarZoom: Number(event.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-[14px] font-black text-foreground">
                    Sağa / sola
                  </label>

                  <span className="text-[13px] font-bold text-primary">
                    {Math.round(safeValue.avatarX)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={safeValue.avatarX}
                  disabled={!safeValue.avatarUrl || disabled}
                  onChange={(event) =>
                    onChange({
                      ...safeValue,
                      avatarX: Number(event.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-[14px] font-black text-foreground">
                    Yukarı / aşağı
                  </label>

                  <span className="text-[13px] font-bold text-primary">
                    {Math.round(safeValue.avatarY)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={safeValue.avatarY}
                  disabled={!safeValue.avatarUrl || disabled}
                  onChange={(event) =>
                    onChange({
                      ...safeValue,
                      avatarY: Number(event.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-border p-4 sm:p-5">
            <h4 className="text-[16px] font-black text-foreground">
              Stil seç
            </h4>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {STYLE_OPTIONS.map((item) => {
                const active = safeValue.avatarStyle === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        ...safeValue,
                        avatarStyle: item.value,
                      })
                    }
                    className={`rounded-[18px] border p-4 text-left transition ${
                      active
                        ? "border-primary bg-primary/[0.05]"
                        : "border-border hover:border-primary/40 hover:bg-background"
                    }`}
                  >
                    <div className="text-[14px] font-black text-foreground">
                      {item.label}
                    </div>

                    <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                      {item.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-border p-4 sm:p-5">
            <h4 className="text-[16px] font-black text-foreground">
              Arka plan
            </h4>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BACKGROUND_OPTIONS.map((item) => {
                const active = safeValue.avatarBg === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        ...safeValue,
                        avatarBg: item.value,
                      })
                    }
                    className={`rounded-[18px] border p-3 text-left transition ${
                      active
                        ? "border-primary bg-primary/[0.05]"
                        : "border-border hover:border-primary/40 hover:bg-background"
                    }`}
                  >
                    <div
                      className={`h-12 rounded-[14px] bg-gradient-to-br ${item.className}`}
                    />

                    <div className="mt-2 text-[13px] font-black text-foreground">
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-[16px] border border-border px-4 py-3">
              <input
                type="checkbox"
                checked={safeValue.avatarFrame}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...safeValue,
                    avatarFrame: event.target.checked,
                  })
                }
                className="h-4 w-4 accent-primary"
              />

              <span className="text-[13px] font-bold text-foreground">
                Avatar çerçevesini göster
              </span>
            </label>
          </div>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[24px] border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-[16px] font-black text-foreground">
                  Profil kartı önizlemesi
                </h4>

                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  Kullanıcıların göreceği boyuta yakın.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                Canlı
              </span>
            </div>

            <div className="mt-5 rounded-[30px] border border-border bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-4">
                <div
                  className={`relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${getBackgroundClass(
                    safeValue.avatarBg,
                  )}`}
                >
                  {safeValue.avatarUrl ? (
                    <div
                      className={`absolute inset-[3px] overflow-hidden rounded-full ${
                        safeValue.avatarFrame
                          ? getFrameClass(safeValue.avatarStyle)
                          : ""
                      }`}
                    >
                      <img
                        src={safeValue.avatarUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        style={previewStyle}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[24px] font-black text-white">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[19px] font-black tracking-[-0.03em] text-foreground">
                    {displayName.trim() || "AQRYO kullanıcısı"}
                  </p>

                  {username.trim() ? (
                    <p className="mt-1 truncate text-[14px] font-semibold text-primary">
                      @{username.replace(/^@/, "")}
                    </p>
                  ) : null}

                  <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                    {bio.trim() ||
                      "Profil açıklaman burada görünecek."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                tabIndex={-1}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full border border-primary/20 bg-primary/[0.04] px-5 text-[14px] font-black text-primary"
              >
                Profili düzenle
              </button>
            </div>

            <div className="mt-4 rounded-[18px] bg-white p-4">
              <p className="text-[13px] font-black text-foreground">
                Güvenli görünüm
              </p>

              <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                Yakınlaştırma ve konum sınırları, fotoğrafın profil kartında
                tamamen kaybolmasını veya aşırı kesilmesini azaltacak şekilde
                sınırlandı.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}