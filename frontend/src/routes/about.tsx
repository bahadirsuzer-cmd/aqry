import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/about")({
    component: AboutPage,
});

function AboutPage() {
    return (
        <LegalPageLayout
            title="Hakkımızda"
            description="AQRYO, içerik üreticilerinin kendi kitleleri için interaktif dijital içerikler ve deneyimler oluşturmasını sağlayan web tabanlı bir teknoloji platformudur."
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
                    title: "Nasıl kullanılır?",
                    content: (
                        <p>
                            Creator bir içerik formatı seçer, metnini veya görselini hazırlar
                            ve oluşan bağlantıyı kendi kitlesiyle paylaşır. AQRYO keşfet akışı
                            oluşturmak yerine creator ile takipçisi arasındaki etkileşimi
                            kolaylaştıran bir araç olarak çalışır.
                        </p>
                    ),
                },
                {
                    title: "Amacımız",
                    content: (
                        <p>
                            Amacımız içerik üreticilerinin mevcut kitleleriyle daha
                            etkileşimli ilişkiler kurmasını, kolayca paylaşılabilir içerikler
                            üretmesini ve takipçileriyle yeni konuşmalar başlatmasını sağlayan
                            sade araçlar geliştirmektir.
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