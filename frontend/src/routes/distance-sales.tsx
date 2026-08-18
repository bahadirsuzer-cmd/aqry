import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/distance-sales")({
    component: DistanceSalesPage,
});

function DistanceSalesPage() {
    return (
        <LegalPageLayout
            title="Mesafeli Satış Sözleşmesi"
            description="AQRYO üzerinden gerçekleştirilen ücretli dijital içerik ve hizmet satın alımlarına ilişkin sözleşme koşulları."
            sections={[
                {
                    title: "1. Taraflar",
                    content: (
                        <>
                            <p>
                                İşbu Mesafeli Satış Sözleşmesi, AQRYO üzerinden dijital ürün
                                veya hizmet satın alan tüketici ile ilgili işlemde satıcı veya
                                sağlayıcı sıfatını taşıyan taraf arasında elektronik ortamda
                                kurulur.
                            </p>

                            <p>
                                <strong>Platform işletmecisi:</strong>
                                <br />
                                BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi
                                <br />
                                Büyükesat Mahallesi Koza 1 Caddesi No: 153/4 Çankaya / Ankara
                                <br />
                                E-posta: hey@buum-e.com
                                <br />
                                Telefon: 0541 291 49 35
                            </p>
                        </>
                    ),
                },
                {
                    title: "2. Sözleşmenin konusu",
                    content: (
                        <p>
                            İşbu sözleşmenin konusu, tüketicinin AQRYO üzerinden elektronik
                            ortamda satın aldığı dijital içerik veya hizmetin sunulması ve
                            tarafların bu satın alma işlemine ilişkin hak ve
                            yükümlülüklerinin belirlenmesidir.
                        </p>
                    ),
                },
                {
                    title: "3. Ürün veya hizmet bilgileri",
                    content: (
                        <p>
                            Satın alınacak dijital ürün veya hizmetin temel özellikleri,
                            kapsamı, vergiler dahil toplam satış fiyatı ve varsa ek
                            maliyetleri ödeme tamamlanmadan önce kullanıcıya gösterilir.
                        </p>
                    ),
                },
                {
                    title: "4. Satıcı veya sağlayıcı bilgisi",
                    content: (
                        <p>
                            AQRYO üzerinde üçüncü taraf creator tarafından sunulan bir ürün
                            veya hizmet söz konusu olduğunda ilgili creator veya sağlayıcıya
                            ilişkin gerekli bilgiler satın alma işlemi kapsamında kullanıcıya
                            ayrıca gösterilebilir. AQRYO'nun ilgili işlemdeki hukuki sıfatı
                            işlemin niteliğine göre belirlenir.
                        </p>
                    ),
                },
                {
                    title: "5. Ödeme",
                    content: (
                        <p>
                            Ödeme, AQRYO tarafından desteklenen güvenli ödeme yöntemlerinden
                            biri kullanılarak gerçekleştirilir. Satın alma işlemi, ödeme
                            hizmeti sağlayıcısından başarılı ödeme sonucu alınması halinde
                            tamamlanmış sayılır.
                        </p>
                    ),
                },
                {
                    title: "6. Dijital teslimat",
                    content: (
                        <p>
                            Dijital ürün veya hizmet, başarılı ödeme sonrasında elektronik
                            ortamda ilgili Experience veya kullanıcı ekranı üzerinden erişime
                            açılır. Ürün açıklamasında aksi belirtilmedikçe fiziksel teslimat
                            yapılmaz.
                        </p>
                    ),
                },
                {
                    title: "7. Cayma hakkı ve istisnalar",
                    content: (
                        <>
                            <p>
                                Tüketicinin cayma hakkı ve bu hakkın kullanım şartları
                                yürürlükteki tüketici mevzuatına tabidir.
                            </p>
                            <p>
                                Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye
                                anında teslim edilen gayri maddi dijital içerikler açısından
                                mevzuatta öngörülen cayma hakkı istisnaları uygulanabilir.
                            </p>
                        </>
                    ),
                },
                {
                    title: "8. İade",
                    content: (
                        <p>
                            Teknik hata, mükerrer ödeme, satın alınan dijital içeriğin erişime
                            sunulamaması veya mevzuattan doğan diğer durumlara ilişkin iade
                            talepleri Teslimat ve İade Koşulları kapsamında değerlendirilir.
                        </p>
                    ),
                },
                {
                    title: "9. Kullanıcının yükümlülükleri",
                    content: (
                        <p>
                            Kullanıcı, satın alma sırasında sunduğu bilgilerin doğru olduğunu
                            ve kullandığı ödeme aracını kullanmaya yetkili olduğunu kabul
                            eder. Yetkisiz ödeme aracı kullanımı, dolandırıcılık veya kötüye
                            kullanım şüphesi bulunan işlemler engellenebilir.
                        </p>
                    ),
                },
                {
                    title: "10. Uyuşmazlıkların çözümü",
                    content: (
                        <p>
                            Tüketici işlemlerinden doğan uyuşmazlıklarda yürürlükteki
                            mevzuatta belirtilen şartlar çerçevesinde Tüketici Hakem
                            Heyetleri, Tüketici Mahkemeleri ve diğer yetkili mercilere
                            başvurulabilir.
                        </p>
                    ),
                },
                {
                    title: "11. İletişim",
                    content: (
                        <p>
                            Sözleşme ve satın alma işlemleriyle ilgili talepler
                            hey@buum-e.com adresine iletilebilir.
                        </p>
                    ),
                },
            ]}
        />
    );
}