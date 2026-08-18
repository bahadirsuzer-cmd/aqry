import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/about")({
    component: AboutPage,
});

function AboutPage() {
    return (
        <LegalPageLayout
            title="Hakkımızda"
            description="AQRYO, içerik üreticilerinin kendi kitleleri için interaktif dijital deneyimler oluşturmasını ve bu deneyimler üzerinden gelir elde etmesini sağlayan web tabanlı bir teknoloji platformudur."
            sections={[
                {
                    title: "AQRYO nedir?",
                    content: (
                        <>
                            <p>
                                AQRYO, içerik üreticilerinin mevcut kitlelerini interaktif
                                dijital deneyimlere dönüştürmelerine yardımcı olan web tabanlı
                                bir teknoloji platformudur.
                            </p>
                            <p>
                                AQRYO bir sosyal medya ağı veya kullanıcı trafiği sağlayan bir
                                keşfet platformu değildir. İçerik üreticileri kendi mevcut
                                kitlelerini AQRYO üzerinde oluşturdukları deneyimlere
                                yönlendirebilir.
                            </p>
                        </>
                    ),
                },
                {
                    title: "Neler oluşturulabilir?",
                    content: (
                        <p>
                            AQRYO üzerinde testler, kişilik deneyimleri, tahminler, interaktif
                            hikâyeler, karar deneyimleri, sohbet tabanlı deneyimler ve benzeri
                            dijital içerikler oluşturulabilir.
                        </p>
                    ),
                },
                {
                    title: "Ücretsiz ve ücretli içerikler",
                    content: (
                        <p>
                            AQRYO üzerindeki deneyimler ücretsiz bir temel sonuç sunabilir.
                            İçerik üreticileri bunun ardından isteğe bağlı ücretli dijital
                            içerikler, ek sonuçlar, teklifler veya Gift seçenekleri sunabilir.
                            Ücretli işlemin kapsamı ve toplam fiyatı ödeme öncesinde
                            kullanıcıya gösterilir.
                        </p>
                    ),
                },
                {
                    title: "Amacımız",
                    content: (
                        <p>
                            Amacımız içerik üreticilerinin mevcut kitleleriyle daha
                            etkileşimli ilişkiler kurmasını ve dijital üretimlerinden doğrudan
                            gelir elde edebilmesini sağlayan sade ve güvenli araçlar
                            geliştirmektir.
                        </p>
                    ),
                },
                {
                    title: "İşletmeci",
                    content: (
                        <p>
                            AQRYO, BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi
                            tarafından işletilmektedir.
                        </p>
                    ),
                },
            ]}
        />
    );
}