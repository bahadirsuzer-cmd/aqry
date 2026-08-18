import {
    createFileRoute,
    Link,
} from "@tanstack/react-router";

import { PublicNavigation } from "@/components/home/PublicNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";

const title =
    "İnternetten Para Kazanma ve Vergi Rehberi 2026 | AQRYO";

const description =
    "İnternetten para kazanırken vergi ödenir mi, şirket kurmak gerekir mi, fatura kesilir mi? 2026 sosyal içerik üreticisi vergi istisnası, %15 stopaj, KDV ve örnek hesaplamalar.";

export const Route = createFileRoute(
    "/internetten-para-kazanma",
)({
    head: () => ({
        meta: [
            {
                title,
            },
            {
                name: "description",
                content: description,
            },
            {
                name: "robots",
                content:
                    "index,follow,max-image-preview:large",
            },
            {
                property: "og:site_name",
                content: "AQRYO",
            },
            {
                property: "og:title",
                content: title,
            },
            {
                property: "og:description",
                content: description,
            },
            {
                property: "og:type",
                content: "article",
            },
            {
                property: "og:url",
                content:
                    "https://aqryo.com/internetten-para-kazanma",
            },
            {
                name: "twitter:card",
                content: "summary_large_image",
            },
            {
                name: "twitter:title",
                content: title,
            },
            {
                name: "twitter:description",
                content: description,
            },
        ],

        links: [
            {
                rel: "canonical",
                href:
                    "https://aqryo.com/internetten-para-kazanma",
            },
        ],

        scripts: [
            {
                type: "application/ld+json",
                children: JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "Article",
                            headline:
                                "İnternetten Para Kazanma ve Vergi Rehberi 2026",
                            description,
                            url:
                                "https://aqryo.com/internetten-para-kazanma",
                            mainEntityOfPage:
                                "https://aqryo.com/internetten-para-kazanma",
                            inLanguage: "tr-TR",
                            dateModified: "2026-08-18",
                            author: {
                                "@type": "Organization",
                                name: "AQRYO",
                            },
                            publisher: {
                                "@type": "Organization",
                                name: "AQRYO",
                                url: "https://aqryo.com",
                            },
                        },
                        {
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                {
                                    "@type": "ListItem",
                                    position: 1,
                                    name: "AQRYO",
                                    item: "https://aqryo.com/",
                                },
                                {
                                    "@type": "ListItem",
                                    position: 2,
                                    name: "İnternetten Para Kazanma",
                                    item:
                                        "https://aqryo.com/internetten-para-kazanma",
                                },
                            ],
                        },
                    ],
                }),
            },
        ],
    }),

    component: InternettenParaKazanmaPage,
});

function InfoBox({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-[22px] border border-primary/15 bg-primary/[0.04] p-5 text-[14px] leading-7 text-muted-foreground">
            {children}
        </div>
    );
}

function Calculation({
    rows,
}: {
    rows: Array<{
        label: string;
        value: string;
        strong?: boolean;
    }>;
}) {
    return (
        <div className="overflow-hidden rounded-[22px] border border-border">
            {rows.map((row, index) => (
                <div
                    key={row.label}
                    className={`flex items-center justify-between gap-5 px-5 py-4 text-[13px] ${index !== rows.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                >
                    <span
                        className={
                            row.strong
                                ? "font-black text-foreground"
                                : "text-muted-foreground"
                        }
                    >
                        {row.label}
                    </span>

                    <span
                        className={
                            row.strong
                                ? "font-black text-foreground"
                                : "font-bold text-foreground"
                        }
                    >
                        {row.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

function InternettenParaKazanmaPage() {
    return (
        <div className="min-h-screen bg-white text-foreground">
            <PublicNavigation />

            <main>
                <section className="border-b border-border bg-gradient-to-b from-violet-50/70 via-white to-white">
                    <div className="mx-auto w-full max-w-[1050px] px-5 pb-12 pt-14 sm:px-7 sm:pb-16 sm:pt-16 lg:px-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">
                            Güncel Rehber · 2026
                        </p>

                        <h1 className="mt-4 max-w-[900px] text-[38px] font-black leading-[1.02] tracking-[-0.055em] sm:text-[54px]">
                            İnternetten para kazanma ve vergi rehberi
                        </h1>

                        <p className="mt-6 max-w-[820px] text-[16px] leading-8 text-muted-foreground">
                            İnternetten gelir elde etmeye başladığınızda en
                            önemli sorulardan biri şudur: Vergi ödemek
                            gerekiyor mu, şirket kurmak şart mı ve fatura
                            kesmek gerekiyor mu? Bu rehber Türkiye'deki
                            sosyal içerik üreticileri ve internet üzerinden
                            belirli hizmetleri sunan gerçek kişiler için
                            temel sistemi anlaşılır şekilde anlatır.
                        </p>

                        <p className="mt-4 max-w-[820px] text-[11px] leading-6 text-muted-foreground">
                            Son güncelleme: 18 Ağustos 2026. Vergi uygulamaları
                            kişinin faaliyet türüne göre değişebilir. Bu
                            rehber genel bilgilendirme amaçlıdır.
                        </p>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-[1050px] px-5 py-12 sm:px-7 sm:py-16 lg:px-10">
                    <div className="grid gap-12 lg:grid-cols-[230px_1fr]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 rounded-[22px] border border-border bg-white p-5">
                                <p className="text-[11px] font-black">
                                    Bu rehberde
                                </p>

                                <nav className="mt-4 flex flex-col gap-3 text-[11px] leading-5 text-muted-foreground">
                                    <a
                                        href="#vergi"
                                        className="transition hover:text-primary"
                                    >
                                        Vergi ödenir mi?
                                    </a>

                                    <a
                                        href="#20b"
                                        className="transition hover:text-primary"
                                    >
                                        20/B sistemi nedir?
                                    </a>

                                    <a
                                        href="#oran"
                                        className="transition hover:text-primary"
                                    >
                                        Vergi oranı
                                    </a>

                                    <a
                                        href="#platform"
                                        className="transition hover:text-primary"
                                    >
                                        Platform komisyonu
                                    </a>

                                    <a
                                        href="#sirket"
                                        className="transition hover:text-primary"
                                    >
                                        Şirket gerekli mi?
                                    </a>

                                    <a
                                        href="#fatura"
                                        className="transition hover:text-primary"
                                    >
                                        Fatura gerekir mi?
                                    </a>

                                    <a
                                        href="#kdv"
                                        className="transition hover:text-primary"
                                    >
                                        KDV
                                    </a>

                                    <a
                                        href="#limit"
                                        className="transition hover:text-primary"
                                    >
                                        2026 sınırı
                                    </a>

                                    <a
                                        href="#basvuru"
                                        className="transition hover:text-primary"
                                    >
                                        Nasıl başlanır?
                                    </a>
                                </nav>
                            </div>
                        </aside>

                        <article className="space-y-12">
                            <section
                                id="vergi"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    İnternetten para kazanırken vergi ödenir mi?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Evet. İnternet üzerinden elde edilen gelirler
                                        de vergi mevzuatına tabidir. Ancak her
                                        internet geliri aynı şekilde
                                        vergilendirilmez.
                                    </p>

                                    <p>
                                        Türkiye'de sosyal içerik üreticileri ile
                                        internet ve benzeri elektronik ortamlarda
                                        belirli hizmetleri sunan gerçek kişiler için
                                        Gelir Vergisi Kanunu'nun mükerrer 20/B
                                        maddesinde özel bir sistem bulunur.
                                    </p>

                                    <p>
                                        Bu sistem şartları sağlayan kişiler için
                                        klasik şirket ve muhasebe düzenine göre daha
                                        basit bir vergilendirme yöntemi sağlayabilir.
                                    </p>
                                </div>
                            </section>

                            <section
                                id="20b"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    Sosyal içerik üreticisi 20/B istisnası nedir?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Mükerrer 20/B kapsamında internet ve benzeri
                                        elektronik ortamlarda metin, görüntü, ses
                                        veya video içeriği paylaşan sosyal içerik
                                        üreticilerinin belirli faaliyetlerden elde
                                        ettiği kazançlar özel vergilendirme
                                        sisteminden yararlanabilir.
                                    </p>

                                    <p>
                                        Ayrıca internet üzerinden verilen bireysel
                                        kurs, eğitim, veri işleme ve geliştirme,
                                        ürün tanıtımı gibi belirli hizmetler de
                                        kapsamda değerlendirilebilir.
                                    </p>
                                </div>

                                <InfoBox>
                                    <p className="font-black text-foreground">
                                        Önemli:
                                    </p>

                                    <p className="mt-2">
                                        Her internet işi 20/B kapsamında değildir.
                                        Örneğin normal e-ticaret veya fiziksel ürün
                                        satışı otomatik olarak bu sisteme girmez.
                                    </p>
                                </InfoBox>
                            </section>

                            <section
                                id="oran"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    Sosyal içerik üreticisi vergisi ne kadar?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Sistemin temel avantajı verginin banka
                                        üzerinden otomatik olarak kesilmesidir.
                                    </p>

                                    <p>
                                        20/B için kullanılan banka hesabına aktarılan
                                        hasılat üzerinden banka yüzde 15 gelir
                                        vergisi stopajı yapar ve bu vergiyi devlete
                                        beyan edip öder.
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <Calculation
                                        rows={[
                                            {
                                                label:
                                                    "20/B banka hesabına aktarılan gelir",
                                                value: "10.000 TL",
                                            },
                                            {
                                                label:
                                                    "Banka stopajı (%15)",
                                                value: "-1.500 TL",
                                            },
                                            {
                                                label:
                                                    "Stopaj sonrası kalan",
                                                value: "8.500 TL",
                                                strong: true,
                                            },
                                        ]}
                                    />
                                </div>

                                <p className="mt-4 text-[12px] leading-6 text-muted-foreground">
                                    Bu örnek yalnızca yüzde 15 banka stopajının
                                    nasıl çalıştığını göstermek içindir.
                                </p>
                            </section>

                            <section
                                id="platform"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    Platform komisyonu varsa vergi nasıl hesaplanır?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Bir dijital platform üzerinden gelir elde
                                        ettiğinizde müşterinin ödediği tutarın
                                        tamamı doğrudan size gönderilmeyebilir.
                                        Platform kendi hizmet veya komisyon bedelini
                                        düşerek kalan tutarı size aktarabilir.
                                    </p>

                                    <p>
                                        Örneğin müşterinin 100 TL ödediği ve
                                        platformun 20 TL hizmet bedeli aldığı bir
                                        işlem düşünelim.
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <Calculation
                                        rows={[
                                            {
                                                label:
                                                    "Müşterinin ödediği",
                                                value: "100 TL",
                                            },
                                            {
                                                label:
                                                    "Platform hizmet bedeli",
                                                value: "-20 TL",
                                            },
                                            {
                                                label:
                                                    "Creator'a aktarılacak tutar",
                                                value: "80 TL",
                                                strong: true,
                                            },
                                        ]}
                                    />
                                </div>

                                <div className="mt-5 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Eğer ödeme sisteminde creator'ın 20/B
                                        hesabına fiilen 80 TL aktarılıyorsa, banka
                                        hesabındaki stopaj mekanizmasının örnek
                                        görünümü şu şekilde olur:
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <Calculation
                                        rows={[
                                            {
                                                label:
                                                    "Creator'ın 20/B hesabına aktarılan",
                                                value: "80 TL",
                                            },
                                            {
                                                label:
                                                    "Banka stopajı (%15)",
                                                value: "-12 TL",
                                            },
                                            {
                                                label:
                                                    "Stopaj sonrası kalan",
                                                value: "68 TL",
                                                strong: true,
                                            },
                                        ]}
                                    />
                                </div>

                                <InfoBox>
                                    <p>
                                        Platform komisyonunun hukuki ve vergisel
                                        olarak hasılat hesabına nasıl yansıyacağı,
                                        sözleşme ve ödeme mimarisine bağlı olabilir.
                                        Bu nedenle düzenli gelir elde eden
                                        kullanıcıların kendi ödeme akışlarını mali
                                        müşavirleriyle teyit etmeleri önerilir.
                                    </p>
                                </InfoBox>
                            </section>

                            <section
                                id="sirket"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    İnternetten para kazanmak için şirket kurmak
                                    şart mı?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Hayır. Her internetten gelir elde eden
                                        kişinin doğrudan limited veya anonim şirket
                                        kurması gerektiği söylenemez.
                                    </p>

                                    <p>
                                        20/B kapsamına giren ve gerekli şartları
                                        sağlayan gerçek kişiler bu özel
                                        vergilendirme sisteminden yararlanabilir.
                                    </p>

                                    <p>
                                        Ancak faaliyetiniz 20/B kapsamında değilse,
                                        fiziksel ürün satıyorsanız veya ayrıca
                                        ticari ya da serbest meslek faaliyetiniz
                                        bulunuyorsa genel vergi hükümleri devreye
                                        girebilir.
                                    </p>
                                </div>
                            </section>

                            <section
                                id="fatura"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    İçerik üreticileri fatura kesmek zorunda mı?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Yalnızca 20/B kapsamında istisna edilen
                                        faaliyetleri yapan ve istisnadan yararlanan
                                        kişiler için önemli bir kolaylık bulunuyor.
                                    </p>

                                    <p>
                                        Bu kişiler açısından defter tasdik ettirme,
                                        defter tutma ve belge düzenleme
                                        zorunlulukları kaldırılabiliyor.
                                    </p>

                                    <p>
                                        Başka ticari, zirai veya serbest meslek
                                        faaliyetleri de bulunuyorsa bu diğer
                                        faaliyetlere ilişkin normal defter ve belge
                                        yükümlülükleri devam edebilir.
                                    </p>
                                </div>
                            </section>

                            <section
                                id="kdv"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    Sosyal içerik üreticileri KDV öder mi?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        Gelir Vergisi Kanunu mükerrer 20/B
                                        kapsamında vergilendirilen kazançlara konu
                                        teslim ve hizmetler KDV'den istisnadır.
                                    </p>

                                    <p>
                                        Bu nedenle 20/B şartlarını sağlayan
                                        faaliyetlerde normal şekilde KDV
                                        hesaplanmaz.
                                    </p>

                                    <p>
                                        Ancak 20/B kapsamına girmeyen faaliyetler
                                        için genel KDV kuralları uygulanabilir.
                                    </p>
                                </div>
                            </section>

                            <section
                                id="limit"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    2026 sosyal içerik üreticisi gelir sınırı ne
                                    kadar?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        2026 gelir vergisi tarifesinde dördüncü gelir
                                        diliminin üst sınırı 5.300.000 TL olarak
                                        belirlenmiştir.
                                    </p>

                                    <p>
                                        Bu nedenle yüksek hacimli kazançlarda yıllık
                                        gelir ve beyan yükümlülüklerinin ayrıca
                                        değerlendirilmesi gerekir.
                                    </p>

                                    <p>
                                        Özellikle milyon TL seviyesinde yıllık gelir
                                        oluşmaya başladığında yalnızca genel internet
                                        rehberlerine güvenmek yerine mali müşavirden
                                        kişisel durumunuza ilişkin değerlendirme
                                        alınması doğru olur.
                                    </p>
                                </div>
                            </section>

                            <section
                                id="basvuru"
                                className="scroll-mt-28"
                            >
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    İnternetten gelir elde etmeye başlayan biri ne
                                    yapmalı?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        İlk olarak yaptığınız faaliyetin 20/B
                                        kapsamına girip girmediğini belirlemeniz
                                        gerekir.
                                    </p>

                                    <p>
                                        İstisnadan yararlanacak kişiler ilgili vergi
                                        dairesi üzerinden istisna işlemlerini
                                        tamamlar ve Türkiye'de kurulu bir bankada bu
                                        faaliyet için kullanılacak hesabı tanımlar.
                                    </p>

                                    <p>
                                        İstisna kapsamındaki hasılatın bu hesap
                                        üzerinden tahsil edilmesi gerekir.
                                    </p>
                                </div>

                                <div className="mt-6 overflow-hidden rounded-[22px] border border-border">
                                    {[
                                        "Faaliyetinin 20/B kapsamına girip girmediğini kontrol et",
                                        "Vergi dairesinden istisna işlemlerini tamamla",
                                        "20/B kapsamında kullanılacak banka hesabını tanımla",
                                        "İstisna kapsamındaki gelirleri bu hesaptan tahsil et",
                                        "Bankanın %15 stopajı otomatik uygulamasını sağla",
                                        "Yıllık gelirini ve faaliyet kapsamını takip et",
                                    ].map((item, index) => (
                                        <div
                                            key={item}
                                            className={`flex gap-4 px-5 py-4 ${index !== 5
                                                    ? "border-b border-border"
                                                    : ""
                                                }`}
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-[11px] font-black text-primary">
                                                {index + 1}
                                            </span>

                                            <p className="pt-1 text-[13px] leading-6 text-muted-foreground">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-[27px] font-black tracking-[-0.04em]">
                                    Hangi internet gelirleri bu sisteme girmez?
                                </h2>

                                <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted-foreground">
                                    <p>
                                        20/B, internette kazanılan her parayı
                                        kapsayan genel bir vergi muafiyeti değildir.
                                    </p>

                                    <p>
                                        Fiziksel ürün satışı, klasik e-ticaret veya
                                        istisna maddesinde sayılan faaliyetlerin
                                        dışında kalan işler farklı şekilde
                                        vergilendirilebilir.
                                    </p>

                                    <p>
                                        Bu yüzden internette para kazanmaya
                                        başladığınızda en önemli adım, önce gelir
                                        modelinizin hangi vergi kategorisine
                                        girdiğini doğru belirlemektir.
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-[28px] border border-primary/15 bg-primary/[0.04] p-6 sm:p-8">
                                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-primary">
                                    Gelir elde etmeye başla
                                </p>

                                <h2 className="mt-3 text-[28px] font-black tracking-[-0.045em]">
                                    İçeriğini gelire dönüştür
                                </h2>

                                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                                    Kitlen varsa yalnızca görüntülenme ve reklam
                                    gelirine bağlı kalmak zorunda değilsin. AQRYO
                                    ile insanların katıldığı interaktif
                                    deneyimler oluşturabilir ve deneyim sonunda
                                    isteğe bağlı ücretli teklifler sunabilirsin.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        to="/creator-auth"
                                        className="inline-flex rounded-full bg-primary px-6 py-3 text-[13px] font-black text-white transition hover:opacity-90"
                                    >
                                        Creator ol ve kazanmaya başla
                                    </Link>

                                    <Link
                                        to="/how-it-works"
                                        className="inline-flex rounded-full border border-border bg-white px-6 py-3 text-[13px] font-black transition hover:border-primary/30"
                                    >
                                        Nasıl çalışıyor?
                                    </Link>
                                </div>
                            </section>

                            <section className="border-t border-border pt-8">
                                <h2 className="text-[20px] font-black tracking-[-0.035em]">
                                    Resmî kaynaklar
                                </h2>

                                <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
                                    Vergi oranları ve istisna şartları için güncel
                                    bilgileri Gelir İdaresi Başkanlığı
                                    kaynaklarından doğrulamanız önerilir.
                                </p>

                                <div className="mt-4 flex flex-col gap-2 text-[12px] font-bold">
                                    <a
                                        href="https://www.gib.gov.tr/mevzuat/kanun/436/ozelge/38960"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary"
                                    >
                                        Gelir İdaresi Başkanlığı — Mükerrer 20/B
                                        açıklaması →
                                    </a>

                                    <a
                                        href="https://www.gib.gov.tr/vergi-konulari/1_bireysel/11_ucret_geliri/11"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary"
                                    >
                                        Gelir İdaresi Başkanlığı — 2026 gelir vergisi
                                        tarifesi →
                                    </a>
                                </div>
                            </section>
                        </article>
                    </div>
                </section>
            </main>

            <HomeFooter />
        </div>
    );
}