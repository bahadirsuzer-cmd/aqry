import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute(
  "/payment-terms",
)({
  component: PaymentTermsPage,
});

function PaymentTermsPage() {
  return (
    <LegalPageLayout
      title="Ödeme, Gift ve Dijital İçerik Koşulları"
      description="AQRYO üzerinden yapılan Gift ve ücretli ek değer ödemelerinde uygulanacak temel ürün kuralları."
      sections={[
        {
          title: "Ücretli ek Result / Offer",
          content: (
            <p>
              Mevcut MVP yapısında ücretli ek değer Result sonrasında sunulur. Satın alma, kullanıcının ücretsiz Result’ını görmesine engel olmamalıdır.
            </p>
          ),
        },
        {
          title: "Gift",
          content: (
            <p>
              Gift, ücretli Result’ın kilidini açmaz. Gift ve ücretli ek değer ayrı satın alma türleridir. Repeat Gift ürün kuralları izin verdiği ölçüde tekrar satın alınabilir.
            </p>
          ),
        },
        {
          title: "Ödeme durumu",
          content: (
            <p>
              Ödemeler pending, payment_started, paid, failed, cancelled, refunded veya disputed gibi durumlara sahip olabilir. Kullanıcı yalnızca başarıyla paid olan satın alma için ücretli içeriğe erişmelidir.
            </p>
          ),
        },
        {
          title: "Refund ve chargeback",
          content: (
            <p>
              Refund, chargeback ve dispute politikası henüz finalize edilmemiştir. Production öncesinde Gift, dijital içerik ve ödeme sağlayıcı kurallarına göre ayrı refund senaryoları belirlenmelidir.
            </p>
          ),
        },
        {
          title: "Para birimi",
          content: (
            <p>
              Satın alma tutarı ve para birimi sipariş anında immutable işlem verisi olarak saklanmalıdır. Global pazarlarda fiyatlar basit günlük kur çevirisi yerine market bazlı lokal fiyatlandırma ile belirlenebilir.
            </p>
          ),
        },
      ]}
    />
  );
}