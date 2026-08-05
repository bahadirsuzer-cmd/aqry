import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute(
  "/community-guidelines",
)({
  component: CommunityGuidelinesPage,
});

function CommunityGuidelinesPage() {
  return (
    <LegalPageLayout
      title="İçerik Kuralları"
      description="AQRYO’nun creator içeriğinde izin verdiği ve yasakladığı temel içerik kategorileri."
      sections={[
        {
          title: "Yaratıcılık serbest",
          content: (
            <p>
              Clickbait, mizah, tartışmalı başlıklar, merak uyandıran hikayeler, testler ve provokatif ama yasal içerikler tek başına yasak değildir.
            </p>
          ),
        },
        {
          title: "Yasa dışı içerik",
          content: (
            <p>
              Yasa dışı faaliyetlerin teşviki, suç işleme talimatı, dolandırıcılık veya yasak ürün/hizmetlerin satışı için AQRYO kullanılamaz.
            </p>
          ),
        },
        {
          title: "Cinsel ve çocuk güvenliği",
          content: (
            <p>
              Pornografik içerik yasaktır. Çocukların cinsel istismarı veya sömürüsüyle ilgili içerik hiçbir koşulda kabul edilmez.
            </p>
          ),
        },
        {
          title: "Taciz ve tehdit",
          content: (
            <p>
              Gerçek kişilere yönelik ciddi tehdit, hedefli taciz, doxxing veya güvenlik riski yaratacak kişisel bilgi paylaşımı yasaktır.
            </p>
          ),
        },
        {
          title: "Telif ve kişilik hakları",
          content: (
            <p>
              Creator, kullandığı görsel, ses, metin ve diğer materyaller için gerekli haklara sahip olmalıdır. İhlal bildirimleri için production takedown süreci oluşturulmalıdır.
            </p>
          ),
        },
        {
          title: "Report ve enforcement",
          content: (
            <p>
              Participant içerikleri raporlayabilir. AQRYO gerekli durumlarda Experience’ı inceleyebilir, pasife alabilir, kaldırabilir veya creator hesabına yaptırım uygulayabilir.
            </p>
          ),
        },
      ]}
    />
  );
}