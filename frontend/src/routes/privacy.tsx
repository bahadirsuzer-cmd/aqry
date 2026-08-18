import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Gizlilik ve Kişisel Verilerin Korunması Politikası"
      description="AQRYO hizmetlerinin kullanılması sırasında kişisel verilerin nasıl işlendiğini, korunduğunu ve kullanıcıların haklarını açıklar."
      sections={[
        {
          title: "Veri sorumlusu",
          content: (
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri
              sorumlusu BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi'dir.
              <br />
              <br />
              Adres: Büyükesat Mahallesi Koza 1 Caddesi No: 153/4 Çankaya /
              Ankara
              <br />
              E-posta: hey@buum-e.com
              <br />
              Telefon: 0541 291 49 35
            </p>
          ),
        },
        {
          title: "İşlenen kişisel veriler",
          content: (
            <p>
              AQRYO'nun kullanım şekline göre kimlik ve iletişim bilgileri,
              e-posta adresi, kullanıcı hesabı bilgileri, creator profil
              bilgileri, Experience içerikleri, satın alma ve ödeme işlem
              kayıtları, kullanıcı tarafından gönüllü olarak sağlanan iletişim
              bilgileri, cihaz ve bağlantı bilgileri, IP adresi, teknik loglar
              ve güvenlik kayıtları işlenebilir.
            </p>
          ),
        },
        {
          title: "Kişisel verilerin işlenme amaçları",
          content: (
            <p>
              Kişisel veriler; kullanıcı hesaplarının oluşturulması ve
              yönetilmesi, Experience oluşturma ve yayınlama hizmetlerinin
              sağlanması, satın alma ve ödeme işlemlerinin yürütülmesi, Gift ve
              Offer işlemlerinin takibi, kullanıcı desteğinin sağlanması,
              sistem güvenliğinin korunması, kötüye kullanım ve
              dolandırıcılığın önlenmesi, yasal yükümlülüklerin yerine
              getirilmesi ve AQRYO hizmetlerinin geliştirilmesi amaçlarıyla
              işlenir.
            </p>
          ),
        },
        {
          title: "Hukuki sebepler",
          content: (
            <p>
              Kişisel veriler; bir sözleşmenin kurulması veya ifasıyla doğrudan
              doğruya ilgili olması, veri sorumlusunun hukuki yükümlülüğünü
              yerine getirebilmesi için zorunlu olması, bir hakkın tesisi,
              kullanılması veya korunması için veri işlemenin zorunlu olması ve
              ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla
              veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu
              olması hukuki sebeplerine dayanılarak işlenebilir. Açık rıza
              gerektiren işlemlerde ayrıca ilgili kişinin açık rızası alınır.
            </p>
          ),
        },
        {
          title: "Verilerin aktarılması",
          content: (
            <p>
              Kişisel veriler, hizmetin sunulması için gerekli olduğu ölçüde
              ödeme hizmeti sağlayıcıları, barındırma ve altyapı sağlayıcıları,
              kimlik doğrulama sağlayıcıları, e-posta ve iletişim hizmetleri,
              güvenlik ve dolandırıcılık önleme hizmetleri ile mevzuat gereği
              yetkili kamu kurum ve kuruluşlarına aktarılabilir.
            </p>
          ),
        },
        {
          title: "Participant ve creator verileri",
          content: (
            <p>
              Public Experience'lara katılım için hesap oluşturulması zorunlu
              olmayabilir. Participant tarafından belirli bir creator ile
              iletişim kurulması amacıyla gönüllü olarak paylaşılan iletişim
              bilgileri, yalnızca belirtilen amaç kapsamında ilgili creator ile
              paylaşılabilir.
            </p>
          ),
        },
        {
          title: "Ödeme bilgileri",
          content: (
            <p>
              Ödeme işlemleri yetkili ödeme hizmeti sağlayıcıları üzerinden
              gerçekleştirilir. AQRYO, ödeme kartının tam kart numarası veya
              kart güvenlik kodu gibi hassas kart bilgilerini kendi
              sistemlerinde saklamaz.
            </p>
          ),
        },
        {
          title: "Saklama ve güvenlik",
          content: (
            <p>
              Kişisel veriler ilgili işleme amacının gerektirdiği süre boyunca
              ve uygulanabilir mevzuatta öngörülen saklama süreleri kapsamında
              muhafaza edilir. Saklama gerekliliğinin sona ermesi halinde
              veriler mevzuata uygun şekilde silinir, yok edilir veya anonim
              hale getirilir.
            </p>
          ),
        },
        {
          title: "KVKK kapsamındaki haklarınız",
          content: (
            <p>
              İlgili kişiler 6698 sayılı Kanun'un 11. maddesi kapsamında
              kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse
              bilgi talep etme, işlenme amacını öğrenme, aktarıldığı üçüncü
              kişileri bilme, eksik veya yanlış işlenmiş verilerin
              düzeltilmesini isteme ve mevzuatta belirtilen şartlarda
              silinmesini veya yok edilmesini isteme haklarına sahiptir.
            </p>
          ),
        },
        {
          title: "Başvuru",
          content: (
            <p>
              Kişisel verilerinize ilişkin taleplerinizi BUUME Bilişim
              Teknoloji Reklamcılık Anonim Şirketi'ne hey@buum-e.com adresi
              üzerinden iletebilirsiniz.
            </p>
          ),
        },
      ]}
    />
  );
}