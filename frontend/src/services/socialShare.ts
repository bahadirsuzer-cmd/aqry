export type SocialChannel =
  | "x"
  | "linkedin"
  | "whatsapp"
  | "facebook"
  | "telegram"
  | "instagram";

function openPopup(url: URL | string) {
  window.open(
    typeof url === "string" ? url : url.toString(),
    "_blank",
    "noopener,noreferrer",
  );
}

export function openSocialShare(
  channel: Exclude<SocialChannel, "instagram">,
  text: string,
  shareUrl: string,
) {
  if (channel === "x") {
    const url = new URL("https://x.com/intent/tweet");
    url.searchParams.set("text", text);
    url.searchParams.set("url", shareUrl);
    openPopup(url);
    return;
  }

  if (channel === "whatsapp") {
    const url = new URL("https://wa.me/");
    url.searchParams.set("text", `${text}\n\n${shareUrl}`);
    openPopup(url);
    return;
  }

  if (channel === "telegram") {
    const url = new URL("https://t.me/share/url");
    url.searchParams.set("url", shareUrl);
    url.searchParams.set("text", text);
    openPopup(url);
    return;
  }

  if (channel === "facebook") {
    const url = new URL("https://www.facebook.com/sharer/sharer.php");
    url.searchParams.set("u", shareUrl);
    url.searchParams.set("quote", text);
    openPopup(url);
    return;
  }

  void navigator.clipboard?.writeText(text).catch(() => {});
  const url = new URL("https://www.linkedin.com/sharing/share-offsite/");
  url.searchParams.set("url", shareUrl);
  openPopup(url);
}

export async function shareToInstagram({
  file,
  text,
  shareUrl,
}: {
  file?: File | null;
  text: string;
  shareUrl: string;
}) {
  const fullText = `${text}\n\n${shareUrl}`;

  if (
    file &&
    navigator.share &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    await navigator.share({
      files: [file],
      text: fullText,
      title: "AQRYO",
    });
    return;
  }

  if (file) {
    const objectUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  await navigator.clipboard?.writeText(fullText).catch(() => {});
  openPopup("https://www.instagram.com/");
}

export function downloadShareFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function channelLabel(channel: SocialChannel) {
  return {
    x: "X",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    telegram: "Telegram",
    instagram: "Instagram",
  }[channel];
}

export const SOCIAL_CHANNELS: SocialChannel[] = [
  "x",
  "linkedin",
  "whatsapp",
  "facebook",
  "telegram",
  "instagram",
];
