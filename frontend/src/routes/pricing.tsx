import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { useAqryoLocale, type AqryoLocale } from "@/lib/i18n";
import { visualPackCopy, visualPackName } from "@/lib/visualPackCopy";

export const Route = createFileRoute("/pricing")({ component: PricingPage });
type Copy = [title: string, description: string, free: string, tax: string, launch: string, cta: string];
const COPY: Record<AqryoLocale, Copy> = {
  "tr": [
    "Ücretsiz oluştur. Görsel paketini seç.",
    "Üç paket ayrı satılır; her biri AQRYO içinde 30 dijital şablon açar.",
    "Temel içerik üretimi ve Klasik görseller ücretsizdir.",
    "USD - Vergiler dahil - Paket başına",
    "Satın alma yakında açılacak. Şu anda paketleri deneyebilirsin.",
    "İçerik oluştur →"
  ],
  "en": [
    "Create for free. Choose your visual pack.",
    "Three packs sold separately; each unlocks 30 digital templates within AQRYO.",
    "Core content creation and Classic visuals are free.",
    "USD - Tax included - Per pack",
    "Paid checkout is coming soon. You can currently try the packs.",
    "Create content →"
  ],
  "de": [
    "Kostenlos erstellen. Bildpaket wählen.",
    "Drei einzeln verkaufte Pakete mit je 30 digitalen Vorlagen für AQRYO.",
    "Grundfunktionen und klassische Bilder sind kostenlos.",
    "USD - Inklusive Steuern - Pro Paket",
    "Der Kauf wird bald verfügbar. Pakete jetzt ausprobieren.",
    "Inhalt erstellen →"
  ],
  "es": [
    "Crea gratis. Elige tu paquete visual.",
    "Tres paquetes vendidos por separado, con 30 plantillas digitales para AQRYO cada uno.",
    "La creación básica y las imágenes clásicas son gratuitas.",
    "USD - Impuestos incluidos - Por paquete",
    "La compra estará disponible pronto. Ya puedes probar los paquetes.",
    "Crear contenido →"
  ],
  "pt": [
    "Crie grátis. Escolha seu pacote visual.",
    "Três pacotes vendidos separadamente, com 30 modelos digitais para AQRYO em cada um.",
    "A criação básica e os visuais clássicos são gratuitos.",
    "USD - Impostos incluídos - Por pacote",
    "A compra estará disponível em breve. Já pode experimentar os pacotes.",
    "Criar conteúdo →"
  ],
  "fr": [
    "Créez gratuitement. Choisissez votre pack visuel.",
    "Trois packs vendus séparément, chacun avec 30 modèles numériques pour AQRYO.",
    "La création de base et les visuels classiques sont gratuits.",
    "USD - Taxes incluses - Par pack",
    "L’achat sera bientôt disponible. Vous pouvez déjà essayer les packs.",
    "Créer du contenu →"
  ],
  "it": [
    "Crea gratis. Scegli il pacchetto visivo.",
    "Tre pacchetti venduti separatamente, ciascuno con 30 modelli digitali per AQRYO.",
    "La creazione di base e le immagini classiche sono gratuite.",
    "USD - Imposte incluse - Per pacchetto",
    "L’acquisto sarà presto disponibile. Puoi già provare i pacchetti.",
    "Crea contenuti →"
  ],
  "ar": [
    "أنشئ مجانًا. اختر حزمة الصور.",
    "ثلاث حزم تباع منفصلة، كل منها يفتح 30 قالبًا رقميًا داخل AQRYO.",
    "إنشاء المحتوى الأساسي والصور الكلاسيكية مجانيان.",
    "USD - شامل الضرائب - لكل حزمة",
    "الشراء متاح قريبًا. يمكنك حاليًا تجربة الحزم.",
    "إنشاء محتوى ←"
  ],
  "hi": [
    "मुफ़्त बनाएँ। विज़ुअल पैक चुनें।",
    "तीन पैक अलग बिकते हैं; हर पैक AQRYO में 30 डिजिटल टेम्पलेट खोलता है।",
    "बुनियादी कंटेंट निर्माण और क्लासिक विज़ुअल मुफ़्त हैं।",
    "USD - कर शामिल - प्रति पैक",
    "खरीदारी जल्द उपलब्ध होगी। अभी पैक आज़मा सकते हैं।",
    "कंटेंट बनाएँ →"
  ],
  "id": [
    "Buat gratis. Pilih paket visualmu.",
    "Tiga paket dijual terpisah, masing-masing membuka 30 templat digital di AQRYO.",
    "Pembuatan konten dasar dan visual Klasik gratis.",
    "USD - Termasuk pajak - Per paket",
    "Pembelian segera tersedia. Saat ini kamu bisa mencoba paket.",
    "Buat konten →"
  ],
  "ru": [
    "Создавайте бесплатно. Выберите пакет изображений.",
    "Три пакета продаются отдельно; каждый открывает 30 цифровых шаблонов в AQRYO.",
    "Базовое создание контента и классические изображения бесплатны.",
    "USD - Налоги включены - За пакет",
    "Покупки скоро откроются. Сейчас пакеты можно попробовать.",
    "Создать контент →"
  ],
  "bn": [
    "বিনামূল্যে তৈরি করুন। ভিজ্যুয়াল প্যাক বেছে নিন।",
    "তিনটি প্যাক আলাদা বিক্রি হয়; প্রতিটি AQRYO-তে 30টি ডিজিটাল টেমপ্লেট খুলে দেয়।",
    "সাধারণ কনটেন্ট তৈরি এবং ক্লাসিক ছবি বিনামূল্যে।",
    "USD - কর অন্তর্ভুক্ত - প্রতি প্যাক",
    "কেনাকাটা শীঘ্রই চালু হবে। এখন প্যাক চেষ্টা করতে পারেন।",
    "কনটেন্ট তৈরি করুন →"
  ],
  "ur": [
    "مفت بنائیں۔ بصری پیک منتخب کریں۔",
    "تین پیک الگ فروخت ہوتے ہیں؛ ہر پیک AQRYO میں 30 ڈیجیٹل ٹیمپلیٹس کھولتا ہے۔",
    "بنیادی مواد کی تیاری اور کلاسک تصاویر مفت ہیں۔",
    "USD - ٹیکس شامل - فی پیک",
    "خریداری جلد دستیاب ہوگی۔ ابھی پیک آزما سکتے ہیں۔",
    "مواد بنائیں ←"
  ],
  "vi": [
    "Tạo miễn phí. Chọn gói hình ảnh.",
    "Ba gói bán riêng; mỗi gói mở khóa 30 mẫu kỹ thuật số trong AQRYO.",
    "Tạo nội dung cơ bản và hình ảnh Cổ điển miễn phí.",
    "USD - Đã gồm thuế - Mỗi gói",
    "Thanh toán sẽ sớm mở. Hiện bạn có thể dùng thử các gói.",
    "Tạo nội dung →"
  ],
  "fil": [
    "Gumawa nang libre. Piliin ang visual pack.",
    "Tatlong pack ang hiwalay na ibinebenta; bawat isa ay may 30 digital template sa AQRYO.",
    "Libre ang pangunahing paggawa ng content at Classic visuals.",
    "USD - Kasama ang buwis - Bawat pack",
    "Malapit nang buksan ang pagbili. Maaari mong subukan ang mga pack ngayon.",
    "Gumawa ng content →"
  ]
};
const PACKS = ["anime", "magic", "arena"] as const;
function PricingPage() {
  const { locale } = useAqryoLocale();
  const [title, description, free, tax, launch, cta] = COPY[locale];
  const packCopy = visualPackCopy(locale);
  return <PublicPageShell title={title} description={description}>
    <section className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-7 lg:px-10">
      <p className="mb-7 text-base text-muted-foreground">{free}</p>
      <div className="grid gap-5 lg:grid-cols-3">
        {PACKS.map(pack => <article key={pack} className="rounded-[26px] border border-primary/15 bg-violet-50/60 p-6">
          <h2 className="text-[24px] font-black tracking-[-0.04em]">{visualPackName(pack, locale)}</h2>
          <p className="mt-5 text-[40px] font-black text-primary" dir="ltr">$0.99</p>
          <p className="mt-1 text-sm text-muted-foreground">{tax}</p>
          <p className="mt-5 text-sm font-bold">{packCopy.permanent}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{packCopy.contents}</p>
        </article>)}
      </div>
      <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-black p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <p className="max-w-xl text-sm leading-6 text-white/80">{launch}</p>
        <Link to="/puzzle-builder" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-black">{cta}</Link>
      </div>
    </section>
  </PublicPageShell>;
}
