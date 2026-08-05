import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute(
  "/creator-terms",
)({
  component: CreatorTermsPage,
});

function CreatorTermsPage() {
  return (
    <LegalPageLayout
      title="Creator Koşulları"
      description="AQRYO’da Experience yayınlayan ve Gift / ücretli ek değer üzerinden gelir elde eden creator’lar için ürün kuralları."
      sections={[
        {
          title: "İçerik sorumluluğu",
          content: (
            <p>
              Creator, yayınladığı içerik üzerinde gerekli haklara sahip olduğunu ve içeriğin yasa dışı, ihlal edici veya yasaklı olmadığını kabul eder.
            </p>
          ),
        },
        {
          title: "Result ve ücretli ek değer",
          content: (
            <p>
              Experience’ın doğal Result’ı ücretsiz olmalıdır. Creator, Result sonrasında ücretli ek değer sunabilir; ancak satın alma ekranında vaat edilen içeriğin gerçekten sağlanması gerekir.
            </p>
          ),
        },
        {
          title: "Gift",
          content: (
            <p>
              Gift, creator’a destek amaçlı isteğe bağlı ödemedir. Gift gönderilmesi creator’ın cevap vermesini garanti etmez. Creator, participant tarafından paylaşılan iletişim bilgilerini yalnızca ilgili iletişim amacı doğrultusunda kullanmalıdır.
            </p>
          ),
        },
        {
          title: "Gelir ve payout",
          content: (
            <p>
              Creator geliri payment provider fee, refund, chargeback, fraud incelemesi, vergi ve payout kurallarına tabi olabilir. Nihai creator payı ve payout koşulları production sözleşmesinde açıkça belirtilmelidir.
            </p>
          ),
        },
        {
          title: "Vergi ve doğrulama",
          content: (
            <p>
              Creator’dan kimlik, ülke, vergi ve payout doğrulaması istenebilir. Creator’ın kendi vergi yükümlülükleri applicable mevzuata göre ayrıca doğabilir.
            </p>
          ),
        },
        {
          title: "İçeriğin kaldırılması",
          content: (
            <p>
              AQRYO, yasak içerik, fraud, güvenlik riski, hukuki talep veya ürün kurallarının ihlali halinde Experience’ı pasife alabilir veya creator hesabını sınırlayabilir.
            </p>
          ),
        },
      ]}
    />
  );
}