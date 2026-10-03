export interface ResultShareCardSource {
  experienceTitle: string;
  resultTitle: string;
  resultDescription: string;
  creatorName?: string | null;
  creatorUsername?: string | null;
  coverImageUrl?: string | null;
  score?: number | null;
  type?: string | null;
  shareUrl: string;
}

export interface ResultShareAsset {
  blob: Blob;
  file: File;
  objectUrl: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(
    radius,
    width / 2,
    height / 2,
  );

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r,
  );
  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r,
  );
  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    r,
  );
  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    r,
  );
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words =
    text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (
    let index = 0;
    index < words.length;
    index += 1
  ) {
    const word = words[index];
    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      ctx.measureText(candidate).width <=
      maxWidth
    ) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;

    if (
      lines.length ===
      maxLines - 1
    ) {
      let rest = [
        current,
        ...words.slice(index + 1),
      ].join(" ");

      while (
        rest.length > 0 &&
        ctx.measureText(
          `${rest}…`,
        ).width > maxWidth
      ) {
        rest = rest.slice(0, -1);
      }

      lines.push(
        rest
          ? `${rest.trim()}…`
          : "…",
      );

      return lines;
    }
  }

  if (
    current &&
    lines.length < maxLines
  ) {
    lines.push(current);
  }

  return lines;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
  weight = 900,
) {
  let size = start;

  while (size > min) {
    ctx.font =
      `${weight} ${size}px Inter, Arial, sans-serif`;

    if (
      ctx.measureText(text).width <=
      maxWidth
    ) {
      return size;
    }

    size -= 2;
  }

  return min;
}

async function loadImage(
  url?: string | null,
) {
  if (!url) {
    return null;
  }

  try {
    const response =
      await fetch(url, {
        mode: "cors",
      });

    if (!response.ok) {
      return null;
    }

    const blob =
      await response.blob();

    const objectUrl =
      URL.createObjectURL(blob);

    const image = new Image();

    await new Promise<void>(
      (resolve, reject) => {
        image.onload = () =>
          resolve();

        image.onerror = () =>
          reject(
            new Error(
              "Görsel okunamadı.",
            ),
          );

        image.src =
          objectUrl;
      },
    );

    URL.revokeObjectURL(
      objectUrl,
    );

    return image;
  } catch {
    return null;
  }
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale =
    Math.max(
      width /
        image.naturalWidth,
      height /
        image.naturalHeight,
    );

  const drawWidth =
    image.naturalWidth *
    scale;

  const drawHeight =
    image.naturalHeight *
    scale;

  const drawX =
    x +
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;

  ctx.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
}

function normalizeDescription(
  value: string,
) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function creatorLabel(
  source: ResultShareCardSource,
) {
  if (source.creatorUsername) {
    return source.creatorUsername.startsWith(
      "@",
    )
      ? source.creatorUsername
      : `@${source.creatorUsername}`;
  }

  return (
    source.creatorName?.trim() ||
    "AQRYO Creator"
  );
}

export async function renderResultShareCard(
  source: ResultShareCardSource,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Sonuç paylaşım görseli oluşturulamadı.",
    );
  }

  const background =
    ctx.createLinearGradient(
      0,
      0,
      WIDTH,
      HEIGHT,
    );

  background.addColorStop(
    0,
    "#5b21b6",
  );
  background.addColorStop(
    0.48,
    "#7c3aed",
  );
  background.addColorStop(
    1,
    "#db2777",
  );

  ctx.fillStyle = background;
  ctx.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT,
  );

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(
    925,
    135,
    250,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    90,
    1180,
    330,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  const cover =
    await loadImage(
      source.coverImageUrl,
    );

  roundedRect(
    ctx,
    58,
    58,
    WIDTH - 116,
    HEIGHT - 116,
    58,
  );

  ctx.fillStyle =
    "rgba(18,10,40,0.30)";
  ctx.fill();

  ctx.fillStyle =
    "rgba(255,255,255,0.88)";
  ctx.font =
    "900 34px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    "AQRYO.",
    96,
    122,
  );

  ctx.font =
    "800 22px Inter, Arial, sans-serif";
  ctx.fillStyle =
    "rgba(255,255,255,0.72)";
  ctx.textAlign = "right";
  ctx.fillText(
    creatorLabel(source),
    WIDTH - 96,
    120,
  );

  if (cover) {
    roundedRect(
      ctx,
      96,
      166,
      WIDTH - 192,
      292,
      42,
    );
    ctx.save();
    ctx.clip();

    drawImageCover(
      ctx,
      cover,
      96,
      166,
      WIDTH - 192,
      292,
    );

    const overlay =
      ctx.createLinearGradient(
        0,
        166,
        0,
        458,
      );

    overlay.addColorStop(
      0,
      "rgba(0,0,0,0.02)",
    );
    overlay.addColorStop(
      1,
      "rgba(0,0,0,0.48)",
    );

    ctx.fillStyle = overlay;
    ctx.fillRect(
      96,
      166,
      WIDTH - 192,
      292,
    );

    ctx.restore();
  } else {
    const coverFallback =
      ctx.createLinearGradient(
        96,
        166,
        WIDTH - 96,
        458,
      );

    coverFallback.addColorStop(
      0,
      "rgba(255,255,255,0.20)",
    );
    coverFallback.addColorStop(
      1,
      "rgba(255,255,255,0.06)",
    );

    ctx.fillStyle =
      coverFallback;

    roundedRect(
      ctx,
      96,
      166,
      WIDTH - 192,
      292,
      42,
    );
    ctx.fill();
  }

  ctx.fillStyle =
    "rgba(255,255,255,0.82)";
  ctx.font =
    "800 20px Inter, Arial, sans-serif";
  ctx.textAlign = "left";

  const experienceLines =
    wrapText(
      ctx,
      source.experienceTitle,
      WIDTH - 260,
      2,
    );

  experienceLines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        124,
        396 + index * 30,
      );
    },
  );

  ctx.fillStyle =
    "rgba(255,255,255,0.66)";
  ctx.font =
    "800 22px Inter, Arial, sans-serif";
  ctx.fillText(
    source.score != null
      ? "SENİN SONUCUN"
      : "SONUCUN",
    96,
    530,
  );

  if (
    source.score != null &&
    Number.isFinite(
      source.score,
    )
  ) {
    ctx.fillStyle = "#ffffff";
    ctx.font =
      "900 86px Inter, Arial, sans-serif";
    ctx.fillText(
      `%${Math.round(
        source.score,
      )}`,
      96,
      636,
    );
  }

  const titleY =
    source.score != null
      ? 716
      : 610;

  const resultTitle =
    source.resultTitle.trim() ||
    "Sonucun hazır";

  const titleSize =
    fitFontSize(
      ctx,
      resultTitle,
      WIDTH - 192,
      72,
      48,
    );

  ctx.fillStyle = "#ffffff";
  ctx.font =
    `900 ${titleSize}px Inter, Arial, sans-serif`;

  const titleLines =
    wrapText(
      ctx,
      resultTitle,
      WIDTH - 192,
      3,
    );

  titleLines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        96,
        titleY +
          index *
            (titleSize * 1.02),
      );
    },
  );

  const descriptionY =
    titleY +
    titleLines.length *
      (titleSize * 1.02) +
    54;

  const description =
    normalizeDescription(
      source.resultDescription,
    );

  ctx.fillStyle =
    "rgba(255,255,255,0.80)";
  ctx.font =
    "500 30px Inter, Arial, sans-serif";

  const descriptionLines =
    wrapText(
      ctx,
      description,
      WIDTH - 192,
      4,
    );

  descriptionLines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        96,
        descriptionY +
          index * 44,
      );
    },
  );

  const buttonY =
    HEIGHT - 210;

  ctx.fillStyle = "#ffffff";
  roundedRect(
    ctx,
    96,
    buttonY,
    WIDTH - 192,
    92,
    46,
  );
  ctx.fill();

  ctx.fillStyle = "#5b21b6";
  ctx.font =
    "900 32px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Sen de çöz  →",
    WIDTH / 2,
    buttonY + 58,
  );

  ctx.textAlign = "left";
  ctx.fillStyle =
    "rgba(255,255,255,0.68)";
  ctx.font =
    "700 20px Inter, Arial, sans-serif";
  ctx.fillText(
    "aqryo.com",
    96,
    HEIGHT - 72,
  );

  return canvas;
}

export async function createResultShareAsset(
  source: ResultShareCardSource,
): Promise<ResultShareAsset> {
  const canvas =
    await renderResultShareCard(
      source,
    );

  const blob =
    await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) {
              resolve(value);
              return;
            }

            reject(
              new Error(
                "Sonuç paylaşım görseli PNG olarak oluşturulamadı.",
              ),
            );
          },
          "image/png",
          0.96,
        );
      },
    );

  const file = new File(
    [blob],
    "aqryo-sonucum.png",
    {
      type: "image/png",
    },
  );

  return {
    blob,
    file,
    objectUrl:
      URL.createObjectURL(
        blob,
      ),
  };
}

export async function shareResultCard(
  source: ResultShareCardSource,
) {
  const asset =
    await createResultShareAsset(
      source,
    );

  const shareText =
    `Benim sonucum: ${source.resultTitle}\n\nSen de çöz: ${source.shareUrl}`;

  try {
    if (
      typeof navigator !==
        "undefined" &&
      navigator.share
    ) {
      const canShareFile =
        typeof navigator.canShare ===
          "function" &&
        navigator.canShare({
          files: [asset.file],
        });

      if (canShareFile) {
        await navigator.share({
          title:
            source.experienceTitle,
          text: shareText,
          url: source.shareUrl,
          files: [asset.file],
        });

        return {
          method:
            "native-with-image" as const,
          asset,
        };
      }

      await navigator.share({
        title:
          source.experienceTitle,
        text: shareText,
        url: source.shareUrl,
      });

      return {
        method:
          "native-link" as const,
        asset,
      };
    }

    if (
      typeof navigator !==
        "undefined" &&
      navigator.clipboard
    ) {
      await navigator.clipboard.writeText(
        shareText,
      );

      return {
        method:
          "clipboard" as const,
        asset,
      };
    }

    return {
      method: "generated" as const,
      asset,
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return {
        method:
          "cancelled" as const,
        asset,
      };
    }

    throw error;
  }
}

export function revokeResultShareAsset(
  asset: ResultShareAsset,
) {
  URL.revokeObjectURL(
    asset.objectUrl,
  );
}