import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute(
  "/cookies",
)({
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPageLayout
      title="Çerez Politikası"
      description="AQRYO’nun oturum, güvenlik ve ileride eklenebilecek analitik/marketing çerezlerini nasıl ele alacağını açıklayan taslak."
      sections={[
        {
          title: "Zorunlu çerezler",
          content: (
            <p>
              Giriş oturumu, güvenlik, yönlendirme ve temel ürün fonksiyonlarının çalışması için zorunlu teknik çerezler veya benzer browser storage yöntemleri kullanılabilir.
            </p>
          ),
        },
        {
          title: "Analitik",
          content: (
            <p>
              Ürün analitiği veya performans ölçümü için kullanılan araçlar production öncesinde netleştirilecektir. Zorunlu olmayan analitik çerezleri kullanılırsa gerekli consent mekanizması uygulanmalıdır.
            </p>
          ),
        },
        {
          title: "Marketing ve pixel",
          content: (
            <p>
              Google Ads, Meta Pixel, TikTok Pixel veya benzeri marketing araçları ileride eklenirse, kullanıcı onayı ve bölgesel mevzuat gereklilikleri dikkate alınmalıdır.
            </p>
          ),
        },
        {
          title: "Tercih yönetimi",
          content: (
            <p>
              Zorunlu olmayan çerezler devreye alınırsa kullanıcıya tercihlerini değiştirebileceği açık bir cookie settings arayüzü sunulmalıdır.
            </p>
          ),
        },
      ]}
    />
  );
}