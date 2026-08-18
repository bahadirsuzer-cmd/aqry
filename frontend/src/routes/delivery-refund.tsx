import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/delivery-refund")({
    component: DeliveryRefundPage,
});

function DeliveryRefundPage() {
    return (
        <LegalPageLayout
            title="Teslimat ve İade Koşulları"
            description="AQRYO üzerinden satın alınan dijital içerik ve hizmetlerin teslimat, iptal ve iade esasları."
            sections={[
                {
                    title: "Dijital teslimat",
                    content: (
                        <>
                            <p>
                                AQRYO üzerinden sunulan ürün ve hizmetler ağırlıklı olarak
                                dijital niteliktedir.
                            </p>
                            <p>
                                Satın alınan dijital içerik veya hizmet, ödemenin başarıyla
                                tamamlanmasının ardından ilgili Experience veya kullanıcı
                                ekranı üzerinden elektronik ortamda erişime açılır.
                            </p>
                            <p>
                                Ürün veya hizmet açıklamasında aksi açıkça belirtilmedikçe
                                fiziksel ürün gönderimi veya kargo teslimatı yapılmaz.
                            </p>
                        </>
                    ),
                },
                {
                    title: "Ödeme ve erişim",
                    content: (
                        <p>
                            Ödeme işlemi başarıyla tamamlanmadığı sürece ücretli dijital
                            içerik erişime açılmaz. Başarılı ödeme sonrasında teknik bir
                            nedenle içeriğe erişilememesi halinde hey@buum-e.com adresinden
                            destek talebinde bulunabilirsiniz.
                        </p>
                    ),
                },
                {
                    title: "Cayma hakkı",
                    content: (
                        <>
                            <p>
                                Tüketicilerin mesafeli sözleşmeler kapsamında sahip olduğu
                                cayma hakları yürürlükteki tüketici mevzuatına tabidir.
                            </p>
                            <p>
                                Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye
                                anında teslim edilen gayri maddi dijital içeriklere ilişkin
                                işlemlerde mevzuatta düzenlenen cayma hakkı istisnaları
                                uygulanabilir.
                            </p>
                        </>
                    ),
                },
                {
                    title: "İade talepleri",
                    content: (
                        <p>
                            Teknik hata, mükerrer tahsilat, ödemenin alınmasına rağmen satın
                            alınan içeriğin erişime sunulamaması veya yürürlükteki mevzuattan
                            doğan diğer durumlarda kullanıcı iade talebinde bulunabilir.
                        </p>
                    ),
                },
                {
                    title: "Onaylanan iadeler",
                    content: (
                        <p>
                            Onaylanan iadeler ödemenin gerçekleştirildiği ödeme aracına
                            yapılır. İadenin karta veya hesaba yansıma süresi ilgili banka ve
                            ödeme hizmeti sağlayıcısının işlem sürelerine bağlıdır.
                        </p>
                    ),
                },
                {
                    title: "İletişim",
                    content: (
                        <p>
                            Teslimat, erişim, ödeme veya iade talepleri için
                            hey@buum-e.com adresinden veya 0541 291 49 35 numaralı
                            telefondan bizimle iletişime geçebilirsiniz.
                        </p>
                    ),
                },
            ]}
        />
    );
}