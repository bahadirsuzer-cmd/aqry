import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useAqryoLocale, type AqryoLocale } from "@/lib/i18n";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SOCIAL_CHANNELS, channelLabel, downloadShareFile, type SocialChannel } from "@/services/socialShare";

const SHARE_COPY: Record<AqryoLocale, [string, string, string]> = {
  tr: ["PNG’yi indir, metni kopyala ve platformunu seç. Platform bağlantıları görseli otomatik eklemez; indirdiğin PNG’yi paylaşımına ekle.", "Diğer uygulamalar", "İşlem tamamlanamadı. Tekrar dene veya metni aşağıdan kopyala."],
  en: ["Download the PNG, copy the text and choose a platform. Platform links do not attach the image automatically; add the downloaded PNG to your post.", "Other apps", "Could not complete the action. Retry or copy the text below."],
  es: ["Descarga el PNG, copia el texto y elige una plataforma. Los enlaces no adjuntan la imagen automáticamente; añádela a tu publicación.", "Otras aplicaciones", "No se pudo completar. Reintenta o copia el texto de abajo."],
  pt: ["Baixe o PNG, copie o texto e escolha uma plataforma. Os links não anexam a imagem automaticamente; adicione-a à publicação.", "Outros aplicativos", "Não foi possível concluir. Tente novamente ou copie o texto abaixo."],
  fr: ["Téléchargez le PNG, copiez le texte et choisissez une plateforme. Les liens ne joignent pas l’image automatiquement ; ajoutez-la à votre publication.", "Autres applications", "Action impossible. Réessayez ou copiez le texte ci-dessous."],
  de: ["Lade das PNG herunter, kopiere den Text und wähle eine Plattform. Links hängen das Bild nicht automatisch an; füge es deinem Beitrag hinzu.", "Andere Apps", "Aktion fehlgeschlagen. Erneut versuchen oder den Text unten kopieren."],
  it: ["Scarica il PNG, copia il testo e scegli una piattaforma. I link non allegano automaticamente l’immagine; aggiungila al post.", "Altre app", "Operazione non riuscita. Riprova o copia il testo qui sotto."],
  ar: ["نزّل PNG وانسخ النص واختر المنصة. الروابط لا ترفق الصورة تلقائيًا؛ أضف الصورة إلى منشورك.", "تطبيقات أخرى", "تعذر إكمال الإجراء. حاول مجددًا أو انسخ النص أدناه."],
  hi: ["PNG डाउनलोड करें, टेक्स्ट कॉपी करें और प्लेटफ़ॉर्म चुनें। लिंक अपने आप चित्र नहीं जोड़ते; डाउनलोड किया चित्र पोस्ट में जोड़ें।", "अन्य ऐप", "प्रक्रिया पूरी नहीं हुई। फिर प्रयास करें या नीचे का टेक्स्ट कॉपी करें।"],
  id: ["Unduh PNG, salin teks dan pilih platform. Tautan tidak melampirkan gambar otomatis; tambahkan PNG ke postingan Anda.", "Aplikasi lain", "Tidak dapat menyelesaikan. Coba lagi atau salin teks di bawah."],
  ru: ["Скачайте PNG, скопируйте текст и выберите платформу. Ссылки не прикрепляют изображение автоматически; добавьте его к публикации.", "Другие приложения", "Не удалось завершить. Повторите или скопируйте текст ниже."],
  bn: ["PNG ডাউনলোড করুন, টেক্সট কপি করুন এবং প্ল্যাটফর্ম বাছুন। লিঙ্ক ছবিটি স্বয়ংক্রিয়ভাবে যোগ করে না; পোস্টে PNG যোগ করুন।", "অন্য অ্যাপ", "সম্পূর্ণ করা যায়নি। আবার চেষ্টা করুন বা নিচের টেক্সট কপি করুন।"],
  ur: ["PNG ڈاؤنلوڈ کریں، متن کاپی کریں اور پلیٹ فارم منتخب کریں۔ لنکس خود تصویر شامل نہیں کرتے؛ پوسٹ میں PNG شامل کریں۔", "دیگر ایپس", "مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں یا نیچے کا متن کاپی کریں۔"],
  vi: ["Tải PNG, sao chép văn bản và chọn nền tảng. Liên kết không tự đính kèm ảnh; hãy thêm PNG vào bài đăng.", "Ứng dụng khác", "Không thể hoàn tất. Thử lại hoặc sao chép văn bản bên dưới."],
  fil: ["I-download ang PNG, kopyahin ang text at pumili ng platform. Hindi awtomatikong kasama ang larawan sa link; idagdag ang PNG sa post.", "Ibang apps", "Hindi makumpleto. Subukan muli o kopyahin ang text sa ibaba."],
};

function imageShareDestination(channel: SocialChannel, text: string) {
  if (channel === "x") {
    const url = new URL("https://x.com/intent/tweet"); url.searchParams.set("text", text); return url.toString();
  }
  if (channel === "whatsapp") {
    const url = new URL("https://wa.me/"); url.searchParams.set("text", text); return url.toString();
  }
  if (channel === "telegram") {
    return "https://web.telegram.org/";
  }
  return { instagram: "https://www.instagram.com/", facebook: "https://www.facebook.com/", linkedin: "https://www.linkedin.com/feed/" }[channel];
}

const COPY_IMAGE: Record<AqryoLocale, string> = {
  tr: "Görseli kopyala", en: "Copy image", es: "Copiar imagen", pt: "Copiar imagem", fr: "Copier l’image", de: "Bild kopieren", it: "Copia immagine", ar: "نسخ الصورة", hi: "चित्र कॉपी करें", id: "Salin gambar", ru: "Копировать изображение", bn: "ছবি কপি করুন", ur: "تصویر کاپی کریں", vi: "Sao chép ảnh", fil: "Kopyahin ang larawan",
};
const PASTE_IMAGE: Record<AqryoLocale, string> = {
  tr: "Platformu seçince görsel panoya kopyalanır. X’te gönderi alanına tıkla ve Ctrl+V (Mac: ⌘V) ile yapıştır. Desteklenmiyorsa PNG’yi indirip ekle.",
  en: "Choosing a platform copies the image. Click the post field and paste with Ctrl+V (Mac: ⌘V). If unsupported, download and attach the PNG.",
  es: "Elegir una plataforma copia la imagen. Pégala con Ctrl+V (Mac: ⌘V). Si no funciona, descarga y adjunta el PNG.",
  pt: "Escolher a plataforma copia a imagem. Cole com Ctrl+V (Mac: ⌘V). Se não funcionar, baixe e anexe o PNG.",
  fr: "Choisir une plateforme copie l’image. Collez avec Ctrl+V (Mac : ⌘V). Sinon, téléchargez et joignez le PNG.",
  de: "Bei der Plattformauswahl wird das Bild kopiert. Mit Strg+V (Mac: ⌘V) einfügen. Andernfalls PNG herunterladen und anhängen.",
  it: "La scelta della piattaforma copia l’immagine. Incolla con Ctrl+V (Mac: ⌘V). Altrimenti scarica e allega il PNG.",
  ar: "اختيار المنصة ينسخ الصورة. الصقها عبر Ctrl+V (Mac: ⌘V). إن لم يعمل، نزّل PNG وأرفقه.",
  hi: "प्लेटफ़ॉर्म चुनने पर चित्र कॉपी होता है। Ctrl+V (Mac: ⌘V) से पेस्ट करें। न चले तो PNG डाउनलोड करके जोड़ें।",
  id: "Memilih platform menyalin gambar. Tempel dengan Ctrl+V (Mac: ⌘V). Jika tidak didukung, unduh dan lampirkan PNG.",
  ru: "Выбор платформы копирует изображение. Вставьте через Ctrl+V (Mac: ⌘V). Если не работает, скачайте и прикрепите PNG.",
  bn: "প্ল্যাটফর্ম বাছলে ছবি কপি হয়। Ctrl+V (Mac: ⌘V) দিয়ে পেস্ট করুন। না হলে PNG ডাউনলোড করে যোগ করুন।",
  ur: "پلیٹ فارم منتخب کرنے پر تصویر کاپی ہوتی ہے۔ Ctrl+V (Mac: ⌘V) سے پیسٹ کریں۔ ورنہ PNG ڈاؤنلوڈ کر کے شامل کریں۔",
  vi: "Chọn nền tảng sẽ sao chép ảnh. Dán bằng Ctrl+V (Mac: ⌘V). Nếu không hỗ trợ, tải và đính kèm PNG.",
  fil: "Kinokopya ang larawan kapag pumili ng platform. I-paste gamit ang Ctrl+V (Mac: ⌘V). Kung hindi suportado, i-download at idagdag ang PNG.",
};

// Touch devices use the system share sheet; desktop platform links stay unchanged.
function isTouchDevice() {
  return typeof navigator !== "undefined" && (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
const MOBILE_SHARE: Record<AqryoLocale, [string, string, string]> = {
  tr: ["Görseli paylaş", "Görsel ve metinle paylaşmak için telefonunun paylaşım menüsünden uygulamanı seç.", "Bu tarayıcı görsel paylaşımını desteklemiyor. PNG’yi indir ve uygulamanda gönderine ekle."],
  en: ["Share image", "Choose an app in your phone’s share menu to share the image and text.", "This browser cannot share image files. Download the PNG and attach it in your app."],
  es: ["Compartir imagen", "Elige una aplicación en el menú del teléfono para compartir la imagen y el texto.", "Descarga el PNG y adjúntalo en tu aplicación; este navegador no admite compartir imágenes."],
  pt: ["Compartilhar imagem", "Escolha um aplicativo no menu do celular para compartilhar a imagem e o texto.", "Este navegador não compartilha imagens. Baixe o PNG e anexe no aplicativo."],
  fr: ["Partager l’image", "Choisissez une application dans le menu de partage du téléphone pour partager l’image et le texte.", "Ce navigateur ne partage pas les images. Téléchargez le PNG et joignez-le dans votre application."],
  de: ["Bild teilen", "Wähle eine App im Teilen-Menü deines Telefons, um Bild und Text zu teilen.", "Dieser Browser kann keine Bilder teilen. Lade das PNG herunter und füge es in deiner App hinzu."],
  it: ["Condividi immagine", "Scegli un’app nel menu di condivisione del telefono per condividere immagine e testo.", "Questo browser non condivide immagini. Scarica il PNG e allegalo nella tua app."],
  ar: ["مشاركة الصورة", "اختر تطبيقًا من قائمة المشاركة في هاتفك لمشاركة الصورة والنص.", "هذا المتصفح لا يدعم مشاركة الصور. نزّل PNG وأرفقه في تطبيقك."],
  hi: ["चित्र साझा करें", "चित्र और टेक्स्ट साझा करने के लिए फ़ोन के शेयर मेन्यू में ऐप चुनें।", "यह ब्राउज़र चित्र साझा नहीं कर सकता। PNG डाउनलोड करके ऐप में जोड़ें।"],
  id: ["Bagikan gambar", "Pilih aplikasi di menu berbagi ponsel untuk membagikan gambar dan teks.", "Browser ini tidak mendukung berbagi gambar. Unduh PNG dan lampirkan di aplikasi."],
  ru: ["Поделиться изображением", "Выберите приложение в меню телефона, чтобы поделиться изображением и текстом.", "Браузер не поддерживает отправку изображений. Скачайте PNG и прикрепите его в приложении."],
  bn: ["ছবি শেয়ার করুন", "ছবি ও টেক্সট শেয়ার করতে ফোনের শেয়ার মেনুতে অ্যাপ বাছুন।", "এই ব্রাউজার ছবি শেয়ার করতে পারে না। PNG ডাউনলোড করে অ্যাপে যোগ করুন।"],
  ur: ["تصویر شیئر کریں", "تصویر اور متن شیئر کرنے کے لیے فون کے شیئر مینو میں ایپ منتخب کریں۔", "یہ براؤزر تصویر شیئر نہیں کر سکتا۔ PNG ڈاؤنلوڈ کر کے ایپ میں شامل کریں۔"],
  vi: ["Chia sẻ ảnh", "Chọn ứng dụng trong menu chia sẻ của điện thoại để chia sẻ ảnh và văn bản.", "Trình duyệt không hỗ trợ chia sẻ ảnh. Tải PNG và đính kèm trong ứng dụng."],
  fil: ["Ibahagi ang larawan", "Pumili ng app sa share menu ng telepono para ibahagi ang larawan at text.", "Hindi suportado ng browser ang pagbabahagi ng larawan. I-download ang PNG at idagdag sa app."],
};

export async function copyShareImage(file: Blob) {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) throw new Error("image_clipboard_unavailable");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
}

type ShareSnapshot = { file: File; text: string };
export function useImageShare() {
  const [snapshot, setSnapshot] = useState<ShareSnapshot | null>(null);
  return {
    openImageShare: (file: File, text: string) => setSnapshot({ file, text }),
    imageShareDialog: <ImageShareDialog snapshot={snapshot} onChange={setSnapshot} />,
  };
}

function ImageShareDialog({ snapshot, onChange }: { snapshot: ShareSnapshot | null; onChange: (snapshot: ShareSnapshot | null) => void }) {
  const { locale, t } = useAqryoLocale();
  const copy = SHARE_COPY[locale] ?? SHARE_COPY.en;
  const mobile = isTouchDevice();
  const mobileCopy = MOBILE_SHARE[locale] ?? MOBILE_SHARE.en;
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<"image" | "text" | null>(null);
  const [error, setError] = useState<File | null>(null);
  const [sharing, setSharing] = useState(false);
  const nativeHandoff = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setCopied(null);
    if (!snapshot) { setPreview(null); return; }
    const url = URL.createObjectURL(snapshot.file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [snapshot]);
  async function copyImage() {
    if (!snapshot) return;
    try { await copyShareImage(snapshot.file); setCopied("image"); setError(null); }
    catch { setCopied(null); setError(snapshot.file); }
  }
  async function copyText() {
    if (!snapshot) return;
    try { await navigator.clipboard.writeText(snapshot.text); setCopied("text"); setError(null); }
    catch { setCopied(null); setError(snapshot.file); }
  }
  async function nativeShare() {
    if (!snapshot || sharing) return;
    const saved = snapshot;
    setError(null);
    nativeHandoff.current = true;
    flushSync(() => { setSharing(true); onChange(null); });
    try { await navigator.share({ files: [saved.file], text: saved.text, title: "AQRYO" }); }
    catch (err) {
      onChange(saved);
      if (!(err instanceof DOMException && err.name === "AbortError")) setError(saved.file);
    } finally { nativeHandoff.current = false; setSharing(false); }
  }
  let nativeAvailable = false;
  try { nativeAvailable = Boolean(snapshot && typeof navigator !== "undefined" && typeof navigator.share === "function" && navigator.canShare?.({ files: [snapshot.file] })); } catch {}
  return <Dialog open={snapshot !== null} onOpenChange={(open) => { if (!open) onChange(null); }}>
    {snapshot && <DialogContent onOpenAutoFocus={(event) => { if (mobile) { event.preventDefault(); titleRef.current?.focus({ preventScroll: true }); } }} onCloseAutoFocus={(event) => { if (nativeHandoff.current) event.preventDefault(); }} overlayClassName="z-[110]" className="top-[max(0.75rem,env(safe-area-inset-top))] z-[120] max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-[calc(100%-2rem)] max-w-[650px] translate-y-0 overflow-y-auto rounded-3xl p-4 md:top-1/2 md:max-h-[92dvh] md:-translate-y-1/2 sm:p-6">
      <DialogTitle ref={titleRef} tabIndex={-1} className="pr-8 text-2xl font-black">{t("shareVisual")}</DialogTitle>
      <DialogDescription>{mobile ? (nativeAvailable ? mobileCopy[1] : mobileCopy[2]) : copy[0]}</DialogDescription>
      <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
        <div className="flex justify-center rounded-2xl bg-violet-50 p-2">
          {preview && <img src={preview} alt={t("shareVisual")} className="max-h-[30dvh] w-auto rounded-xl object-contain sm:max-h-[280px]" />}
        </div>
        <div className="space-y-3">
          {mobile && nativeAvailable ?
            <button type="button" disabled={sharing} onClick={() => void nativeShare()} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-bold text-white disabled:opacity-60">{mobileCopy[0]}</button> :
            !mobile && <button type="button" onClick={() => void copyImage()} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-bold text-white">{copied === "image" ? "✓ " : ""}{COPY_IMAGE[locale]}</button>}
          <button type="button" onClick={() => downloadShareFile(snapshot.file)} className="w-full rounded-xl border border-violet-200 px-4 py-3 font-bold text-violet-900">↓ {t("downloadSvg").replace("SVG", "PNG")}</button>
          <textarea readOnly value={snapshot.text} aria-label={t("cta")} rows={3} className="w-full resize-none rounded-xl border border-violet-200 p-3 text-sm" />
          <button type="button" onClick={() => void copyText()} className="w-full rounded-xl border border-violet-200 px-4 py-3 font-bold text-violet-900">{copied === "text" ? "✓ " : ""}{t("copyText")}</button>
        </div>
      </div>
      {!mobile && <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-950">{PASTE_IMAGE[locale]}</p>}
      {!mobile && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SOCIAL_CHANNELS.map((channel) => <a key={channel} href={imageShareDestination(channel, snapshot.text)} onClick={() => { if (copied !== "image") void copyImage(); }} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-center font-bold text-violet-950 hover:bg-violet-100">{channelLabel(channel)} ↗</a>)}
      </div>}
      {!mobile && nativeAvailable && <button type="button" disabled={sharing} onClick={() => void nativeShare()} className="rounded-xl border border-border px-4 py-3 font-bold">{copy[1]}</button>}
      {error === snapshot.file && <p role="alert" className="text-sm text-red-700">{copy[2]} {t("downloadSvg").replace("SVG", "PNG")}</p>}
      {copied === "image" && <p role="status" className="text-sm font-bold text-violet-900">✓ {COPY_IMAGE[locale]} · Ctrl+V / ⌘V</p>}
    </DialogContent>}
  </Dialog>;
}
