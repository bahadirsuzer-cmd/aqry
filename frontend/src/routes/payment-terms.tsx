import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/payment-terms")({
  component: PaymentTermsPage,
});

function PaymentTermsPage() {
  return (
    <LegalPageLayout
      title="Ödeme, Gift ve Dijital İçerik Koşulları"
      description="AQRYO üzerinden gerçekleştirilen ücretli dijital içerik, Offer ve Gift işlemlerinde geçerli temel ödeme koşulları."
      sections={[
        {
          title: "Ücretli dijital içerik ve Offer",
          content: (
            <p>
              Bir Experience kapsamında ücretli ek içerik veya Offer
              sunulduğunda, satın alınacak dijital içeriğin kapsamı ve toplam
              fiyatı ödeme öncesinde kullanıcıya açıkça gösterilir.
            </p>
          ),
        },
        {
          title: "Ücretsiz Result",
          content: (
            <p>
              Bir Experience'ın ücretsiz olarak sunduğu temel Result,
              sonrasında sunulan isteğe bağlı ücretli Offer'dan ayrı
              değerlendirilir. Ücretli Offer satın alınması ücretsiz Result'ın
              görüntülenmesi için zorunlu değildir.
            </p>
          ),
        },
        {
          title: "Gift",
          content: (
            <p>
              Gift, kullanıcının bir creator'a destek olmak amacıyla
              gerçekleştirebildiği ayrı bir ödeme türüdür. Gift satın alınması
              tek başına ücretli bir Result veya Offer içeriğinin erişimini
              sağlamaz.
            </p>
          ),
        },
        {
          title: "Ödemenin tamamlanması",
          content: (
            <p>
              Bir satın alma işlemi yalnızca ödeme hizmeti sağlayıcısından
              başarılı ödeme sonucu alınması halinde tamamlanmış kabul edilir.
              Başarısız, iptal edilmiş veya tamamlanmamış işlemlerde ücretli
              içerik erişime açılmaz.
            </p>
          ),
        },
        {
          title: "Fiyat ve para birimi",
          content: (
            <p>
              Kullanıcıdan tahsil edilecek toplam tutar ve para birimi ödeme
              işlemi tamamlanmadan önce gösterilir. Kullanıcının açıkça
              onaylamadığı ek bir ücret tahsil edilmez.
            </p>
          ),
        },
        {
          title: "İade",
          content: (
            <p>
              İptal ve iade talepleri Teslimat ve İade Koşulları ile
              yürürlükteki tüketici mevzuatı kapsamında değerlendirilir.
            </p>
          ),
        },
        {
          title: "Güvenlik",
          content: (
            <p>
              Dolandırıcılık, yetkisiz ödeme aracı kullanımı, kötüye kullanım
              veya güvenlik riski şüphesi bulunan işlemler reddedilebilir,
              askıya alınabilir veya incelemeye alınabilir.
            </p>
          ),
        },
        {
          title: "İletişim",
          content: (
            <p>
              Ödeme işlemleriyle ilgili destek talepleri hey@buum-e.com
              adresine iletilebilir.
            </p>
          ),
        },
      ]}
    />
  );
}