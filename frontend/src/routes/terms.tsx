import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute(
  "/terms",
)({
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageLayout
      title="Kullanım Koşulları"
      description="AQRYO web sitesini, creator araçlarını ve public Experience’ları kullanırken geçerli olacak temel ürün kuralları."
      sections={[
        {
          title: "AQRYO nedir?",
          content: (
            <>
              <p>
                AQRYO, creator’ların dış kaynaklardan getirdiği trafiği interaktif Experience’lara dönüştürmesine yardımcı olan web tabanlı bir araçtır.
              </p>
              <p>
                AQRYO bir sosyal ağ, keşfet akışı veya kullanıcı kitlesi vaat eden dağıtım platformu değildir.
              </p>
            </>
          ),
        },
        {
          title: "Hesap kullanımı",
          content: (
            <p>
              Creator hesapları doğru ve güncel bilgilerle kullanılmalıdır. Hesabın güvenliğini korumak ve erişim bilgilerinin üçüncü kişilerle paylaşılmamasını sağlamak hesap sahibinin sorumluluğundadır.
            </p>
          ),
        },
        {
          title: "Experience kullanımı",
          content: (
            <p>
              Katılımcılar public Experience’lara hesap oluşturmadan erişebilir. Experience sonucu ücretsiz değer sunmalıdır; ücretli ek değer veya Gift, Result sonrasında isteğe bağlı olabilir.
            </p>
          ),
        },
        {
          title: "Yasak kullanım",
          content: (
            <p>
              Yasa dışı faaliyetler, dolandırıcılık, yetkisiz kişisel veri kullanımı, zararlı yazılım, taciz, pornografik içerik, çocukların cinsel istismarı, ciddi tehditler ve üçüncü kişilerin haklarını ihlal eden kullanım yasaktır.
            </p>
          ),
        },
        {
          title: "Hizmet değişiklikleri",
          content: (
            <p>
              AQRYO ürün özelliklerini, fiyatlandırmayı, AI kredi kurallarını ve hizmet kapsamını zaman içinde değiştirebilir. Önemli değişiklikler yayınlanmadan önce kullanıcıya açık şekilde belirtilmelidir.
            </p>
          ),
        },
        {
          title: "Sorumluluk sınırı",
          content: (
            <p>
              Creator tarafından oluşturulan içerik ve creator’ın sunduğu vaatler creator’ın sorumluluğundadır. AQRYO, creator görüşlerini veya Experience içeriğini kendi görüşü olarak sunmaz.
            </p>
          ),
        },
      ]}
    />
  );
}