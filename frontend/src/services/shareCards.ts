export type ShareExperienceType =
  | "compatibility"
  | "test"
  | "guess"
  | "story"
  | string;

export type ShareTestMode =
  | "score"
  | "profile"
  | "spectrum"
  | "archetype"
  | null;

export type ShareFormat =
  | "square"
  | "story";

export interface ShareCardSource {
  id: string;
  title: string;
  type: ShareExperienceType;
  coverImageUrl: string;
  coverLabel?: string;
  testMode?: ShareTestMode;
}

export interface ShareCardTheme {
  accent: string;
  accentDark: string;
  background: string;
  squareBackground: string;
}

const THEMES: Record<
  string,
  ShareCardTheme
> = {
  guess: {
    accent: "#ff7a00",
    accentDark: "#c84e00",
    background: "#080604",
    squareBackground: "#f5f0ff",
  },

  story: {
    accent: "#8b5cf6",
    accentDark: "#5b21b6",
    background: "#090812",
    squareBackground: "#f3efff",
  },

  score: {
    accent: "#22c55e",
    accentDark: "#15803d",
    background: "#06110a",
    squareBackground: "#effcf3",
  },

  spectrum: {
    accent: "#ec4899",
    accentDark: "#be185d",
    background: "#12070d",
    squareBackground: "#fff0f7",
  },

  archetype: {
    accent: "#3b82f6",
    accentDark: "#1d4ed8",
    background: "#06101f",
    squareBackground: "#eef5ff",
  },

  compatibility: {
    accent: "#f43f5e",
    accentDark: "#be123c",
    background: "#14070a",
    squareBackground: "#fff0f2",
  },

  default: {
    accent: "#7c3aed",
    accentDark: "#5b21b6",
    background: "#09070f",
    squareBackground: "#f4f0ff",
  },
};

export function getShareTheme(
  source: ShareCardSource,
): ShareCardTheme {
  if (source.type === "guess") {
    return THEMES.guess;
  }

  if (source.type === "story") {
    return THEMES.story;
  }

  if (
    source.type ===
    "compatibility"
  ) {
    return THEMES.compatibility;
  }

  if (source.type === "test") {
    if (
      source.testMode ===
      "spectrum"
    ) {
      return THEMES.spectrum;
    }

    if (
      source.testMode ===
        "archetype" ||
      source.testMode ===
        "profile"
    ) {
      return THEMES.archetype;
    }

    return THEMES.score;
  }

  return THEMES.default;
}

function getShareCopy(
  source: ShareCardSource,
) {
  const label =
    source.coverLabel?.trim() ||
    (source.type === "story"
      ? "HİKÂYE"
      : source.type === "guess"
        ? "TAHMİN"
        : source.type === "compatibility"
          ? "UYUM"
          : source.type === "test"
            ? "TEST"
            : "AQRYO");

  const cta =
    source.type === "story"
      ? "Hikâyeyi aç"
      : source.type === "guess"
        ? "Tahmin et"
        : source.type === "compatibility"
          ? "Uyumunu gör"
          : source.type === "test"
            ? "Sonucunu gör"
            : "Başla";

  const helper =
    source.type === "story"
      ? "Devamını AQRYO’da gör."
      : source.type === "guess"
        ? "Tahmin et. Cevabı AQRYO’da gör."
        : source.type === "compatibility"
          ? "Cevapla. Ne kadar uyumlu olduğunuzu gör."
          : source.type === "test"
            ? "Cevapla. Sana en yakın sonucu gör."
            : "İçeriği aç. Sonucunu AQRYO’da gör.";

  return {
    label,
    cta,
    helper,
  };
}

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

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight = 900,
) {
  let size = startSize;

  while (
    size > minSize
  ) {
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

  return minSize;
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
    let i = 0;
    i < words.length;
    i += 1
  ) {
    const word = words[i];

    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      ctx.measureText(
        candidate,
      ).width <= maxWidth
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
      const rest = [
        current,
        ...words.slice(
          i + 1,
        ),
      ].join(" ");

      let clipped = rest;

      while (
        clipped.length > 0 &&
        ctx.measureText(
          `${clipped}…`,
        ).width > maxWidth
      ) {
        clipped =
          clipped.slice(
            0,
            -1,
          );
      }

      lines.push(
        `${clipped.trim()}…`,
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

async function loadImage(
  url: string,
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
      throw new Error(
        `Görsel alınamadı (${response.status})`,
      );
    }

    const blob =
      await response.blob();

    const objectUrl =
      URL.createObjectURL(
        blob,
      );

    const image =
      new Image();

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
  } catch (error) {
    console.error(
      "Share card görseli yüklenemedi:",
      error,
    );

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
    (width -
      drawWidth) /
      2;

  const drawY =
    y +
    (height -
      drawHeight) /
      2;

  ctx.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
}

function drawBrand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number,
) {
  ctx.fillStyle = color;

  ctx.font =
    `900 ${size}px Inter, Arial, sans-serif`;

  ctx.fillText(
    "AQRYO.",
    x,
    y,
  );
}

function drawSquare(
  ctx: CanvasRenderingContext2D,
  source: ShareCardSource,
  image: HTMLImageElement | null,
  theme: ShareCardTheme,
) {
  const {
    label,
    cta,
    helper,
  } = getShareCopy(source);

  const width = 1080;
  const height = 1080;

  ctx.fillStyle =
    theme.squareBackground;

  ctx.fillRect(
    0,
    0,
    width,
    height,
  );

  const topGradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height,
    );

  topGradient.addColorStop(
    0,
    "rgba(255,255,255,0.94)",
  );

  topGradient.addColorStop(
    1,
    "rgba(255,255,255,0.32)",
  );

  ctx.fillStyle =
    topGradient;

  ctx.fillRect(
    0,
    0,
    width,
    height,
  );

  ctx.fillStyle =
    theme.accentDark;

  ctx.font =
    "800 22px Inter, Arial, sans-serif";

  ctx.textAlign =
    "center";

  ctx.letterSpacing =
    "7px";

  ctx.fillText(
    label,
    width / 2,
    62,
  );

  ctx.letterSpacing =
    "0px";

  const titleSize =
    fitFontSize(
      ctx,
      source.title,
      920,
      92,
      64,
      900,
    );

  ctx.font =
    `900 ${titleSize}px Inter, Arial, sans-serif`;

  const titleLines =
    wrapText(
      ctx,
      source.title,
      920,
      2,
    );

  ctx.fillStyle =
    "#170a35";

  ctx.textAlign =
    "center";

  const lineHeight =
    titleSize * 0.94;

  titleLines.forEach(
    (line, index) => {
      ctx.fillText(
        line,
        width / 2,
        150 +
          index *
            lineHeight,
      );
    },
  );

  const imageY =
    titleLines.length === 1
      ? 250
      : 300;

  const imageHeight =
    titleLines.length === 1
      ? 540
      : 490;

  roundedRect(
    ctx,
    64,
    imageY,
    952,
    imageHeight,
    44,
  );

  ctx.save();
  ctx.clip();

  if (image) {
    drawImageCover(
      ctx,
      image,
      64,
      imageY,
      952,
      imageHeight,
    );
  } else {
    const fallback =
      ctx.createLinearGradient(
        64,
        imageY,
        1016,
        imageY +
          imageHeight,
      );

    fallback.addColorStop(
      0,
      theme.accent,
    );

    fallback.addColorStop(
      1,
      theme.accentDark,
    );

    ctx.fillStyle =
      fallback;

    ctx.fillRect(
      64,
      imageY,
      952,
      imageHeight,
    );
  }

  ctx.restore();

  ctx.lineWidth = 8;

  ctx.strokeStyle =
    "rgba(255,255,255,0.96)";

  roundedRect(
    ctx,
    64,
    imageY,
    952,
    imageHeight,
    44,
  );

  ctx.stroke();

  ctx.fillStyle =
    "#24183d";

  ctx.textAlign =
    "center";

  ctx.font =
    "500 33px Inter, Arial, sans-serif";

  ctx.fillText(
    helper,
    width / 2,
    870,
  );

  const buttonGradient =
    ctx.createLinearGradient(
      220,
      920,
      860,
      1015,
    );

  buttonGradient.addColorStop(
    0,
    theme.accent,
  );

  buttonGradient.addColorStop(
    1,
    theme.accentDark,
  );

  ctx.fillStyle =
    buttonGradient;

  roundedRect(
    ctx,
    205,
    908,
    670,
    94,
    47,
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 38px Inter, Arial, sans-serif";

  ctx.fillText(
    `${cta}  →`,
    width / 2,
    970,
  );

  drawBrand(
    ctx,
    455,
    1050,
    "#28115e",
    30,
  );
}

function drawStory(
  ctx: CanvasRenderingContext2D,
  source: ShareCardSource,
  image: HTMLImageElement | null,
  theme: ShareCardTheme,
) {
  const {
    label,
    cta,
    helper,
  } = getShareCopy(source);

  const width = 1080;
  const height = 1920;

  ctx.fillStyle =
    theme.background;

  ctx.fillRect(
    0,
    0,
    width,
    height,
  );

  if (image) {
    ctx.save();

    roundedRect(
      ctx,
      0,
      0,
      width,
      1240,
      0,
    );

    ctx.clip();

    drawImageCover(
      ctx,
      image,
      0,
      0,
      width,
      1240,
    );

    const shade =
      ctx.createLinearGradient(
        0,
        430,
        0,
        1250,
      );

    shade.addColorStop(
      0,
      "rgba(0,0,0,0.02)",
    );

    shade.addColorStop(
      1,
      theme.background,
    );

    ctx.fillStyle =
      shade;

    ctx.fillRect(
      0,
      400,
      width,
      900,
    );

    ctx.restore();
  } else {
    const fallback =
      ctx.createRadialGradient(
        540,
        400,
        20,
        540,
        520,
        750,
      );

    fallback.addColorStop(
      0,
      theme.accent,
    );

    fallback.addColorStop(
      1,
      theme.background,
    );

    ctx.fillStyle =
      fallback;

    ctx.fillRect(
      0,
      0,
      width,
      1240,
    );
  }

  ctx.fillStyle =
    theme.accent;

  roundedRect(
    ctx,
    80,
    85,
    320,
    78,
    39,
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 30px Inter, Arial, sans-serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    label,
    240,
    135,
  );

  ctx.textAlign =
    "left";

  const titleSize =
    fitFontSize(
      ctx,
      source.title,
      910,
      88,
      58,
      900,
    );

  ctx.font =
    `900 ${titleSize}px Inter, Arial, sans-serif`;

  const titleLines =
    wrapText(
      ctx,
      source.title,
      900,
      3,
    );

  const titleY =
    1250;

  titleLines.forEach(
    (line, index) => {
      const y =
        titleY +
        index *
          (titleSize *
            0.98);

      ctx.fillStyle =
        index ===
        titleLines.length -
          1
          ? theme.accent
          : "#ffffff";

      ctx.fillText(
        line,
        80,
        y,
      );
    },
  );

  const helperY =
    titleY +
    titleLines.length *
      titleSize +
    42;

  ctx.fillStyle =
    "rgba(255,255,255,0.84)";

  ctx.font =
    "500 34px Inter, Arial, sans-serif";

  ctx.fillText(
    helper,
    82,
    helperY,
  );

  const buttonY =
    1690;

  const buttonGradient =
    ctx.createLinearGradient(
      120,
      buttonY,
      960,
      buttonY +
        120,
    );

  buttonGradient.addColorStop(
    0,
    theme.accent,
  );

  buttonGradient.addColorStop(
    1,
    theme.accentDark,
  );

  ctx.fillStyle =
    buttonGradient;

  roundedRect(
    ctx,
    110,
    buttonY,
    860,
    120,
    60,
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 46px Inter, Arial, sans-serif";

  ctx.textAlign =
    "center";

  ctx.fillText(
    `${cta}  →`,
    width / 2,
    buttonY + 76,
  );

  drawBrand(
    ctx,
    430,
    1880,
    "#ffffff",
    34,
  );
}

export async function renderShareCard(
  source: ShareCardSource,
  format: ShareFormat,
) {
  const theme =
    getShareTheme(source);

  const canvas =
    document.createElement(
      "canvas",
    );

  if (
    format ===
    "square"
  ) {
    canvas.width = 1080;
    canvas.height = 1080;
  } else {
    canvas.width = 1080;
    canvas.height = 1920;
  }

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Paylaşım görseli oluşturulamadı.",
    );
  }

  const image =
    await loadImage(
      source.coverImageUrl,
    );

  if (
    format ===
    "square"
  ) {
    drawSquare(
      ctx,
      source,
      image,
      theme,
    );
  } else {
    drawStory(
      ctx,
      source,
      image,
      theme,
    );
  }

  return canvas;
}

function sanitizeFileName(
  value: string,
) {
  return value
    .toLocaleLowerCase(
      "tr-TR",
    )
    .replace(
      /[^a-z0-9çğıöşü]+/gi,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(
      0,
      56,
    );
}

export async function downloadShareCard(
  source: ShareCardSource,
  format: ShareFormat,
) {
  const canvas =
    await renderShareCard(
      source,
      format,
    );

  const blob =
    await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (value) =>
            value
              ? resolve(
                  value,
                )
              : reject(
                  new Error(
                    "PNG oluşturulamadı.",
                  ),
                ),
          "image/png",
          1,
        );
      },
    );

  const href =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href = href;

  link.download =
    `aqryo-${sanitizeFileName(
      source.title,
    )}-${format}.png`;

  document.body.appendChild(
    link,
  );

  link.click();
  link.remove();

  URL.revokeObjectURL(
    href,
  );
}

export async function createShareCardBlob(
  source: ShareCardSource,
  format: ShareFormat,
) {
  const canvas =
    await renderShareCard(
      source,
      format,
    );

  return await new Promise<Blob>(
    (resolve, reject) => {
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(
                new Error(
                  "Paylaşım görseli oluşturulamadı.",
                ),
              ),
        "image/png",
        1,
      );
    },
  );
}

export async function copyShareCardToClipboard(
  source: ShareCardSource,
  format: ShareFormat,
) {
  if (
    !navigator.clipboard ||
    typeof ClipboardItem ===
      "undefined"
  ) {
    throw new Error(
      "Bu tarayıcı görseli panoya kopyalamayı desteklemiyor.",
    );
  }

  const blob =
    await createShareCardBlob(
      source,
      format,
    );

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": blob,
    }),
  ]);
}