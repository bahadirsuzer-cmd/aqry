// deploy-retry: 2026-09-26
export type SocialChannel =
  | "x"
  | "threads"
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
  if (channel === "threads") {
    const url = new URL("https://www.threads.com/intent/post");
    url.searchParams.set("text", text);
    if (shareUrl) url.searchParams.set("url", shareUrl);
    openPopup(url);
    return;
  }

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
  if (
    file &&
    navigator.share &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    await navigator.share({
      files: [file],
      title: "AQRYO",
    });
    return;
  }

  if (!file && navigator.share) {
    await navigator.share({
      title: "AQRYO",
      text,
      url: shareUrl,
    });
    return;
  }

  const fullText = `${text}\n\n${shareUrl}`;

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
    threads: "Threads",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    telegram: "Telegram",
    instagram: "Instagram",
  }[channel];
}

export const SOCIAL_CHANNELS: SocialChannel[] = [
  "x",
  "threads",
  "linkedin",
  "whatsapp",
  "facebook",
  "telegram",
  "instagram",
];
