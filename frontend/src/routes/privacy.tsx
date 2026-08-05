import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute(
  "/privacy",
)({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Gizlilik Politikası"
      description="AQRYO’nun hangi verileri neden işlediğini ve kullanıcıların veri haklarının nasıl ele alınacağını açıklayan taslak politika."
      sections={[
        {
          title: "Toplanan veriler",
          content: (
            <p>
              Hesap e-postası, Google identity bilgileri, creator profil verileri, Experience içerikleri, ödeme referansları, işlem kayıtları, participant tarafından creator’a bırakılan iletişim bilgileri, teknik loglar ve güvenlik sinyalleri işlenebilir.
            </p>
          ),
        },
        {
          title: "Verileri neden kullanıyoruz?",
          content: (
            <p>
              Hesap yönetimi, Experience yayınlama, ödeme işlemleri, Gift ve Offer takibi, güvenlik, dolandırıcılık önleme, destek, ürün analitiği ve yasal yükümlülükler için gerekli veriler işlenebilir.
            </p>
          ),
        },
        {
          title: "Participant verileri",
          content: (
            <p>
              Public Experience’a katılmak için hesap zorunlu değildir. Participant bir Gift veya creator ile iletişim amacıyla iletişim bilgisi verirse, bu bilgi ilgili creator ile paylaşılabilir.
            </p>
          ),
        },
        {
          title: "Üçüncü taraf hizmetler",
          content: (
            <p>
              Kimlik doğrulama, hosting, ödeme, e-posta, AI ve benzeri altyapı sağlayıcıları hizmetin çalışması için gerekli ölçüde veri işleyebilir. Production sağlayıcı listesi final politikada açıkça belirtilmelidir.
            </p>
          ),
        },
        {
          title: "Saklama ve silme",
          content: (
            <p>
              Veriler yalnızca ürünün çalışması, finansal kayıt, fraud/chargeback incelemesi ve yasal saklama gereklilikleri için gerekli süre boyunca tutulmalıdır. Hesap silme talepleri, açık finansal veya yasal yükümlülükler dikkate alınarak işlenir.
            </p>
          ),
        },
        {
          title: "KVKK ve GDPR hakları",
          content: (
            <p>
              Uygulanabilir mevzuata göre erişim, düzeltme, silme, veri taşınabilirliği, işlemeye itiraz ve benzeri haklar bulunabilir. Production gizlilik politikası Türkiye’de KVKK ve gerekli pazarlarda GDPR gerekliliklerine göre finalize edilmelidir.
            </p>
          ),
        },
      ]}
    />
  );
}