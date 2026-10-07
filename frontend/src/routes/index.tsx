import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";

const title =
  "AQRYO | Takipçilerinle Etkileşimli İçerikler Oluştur";

const description =
  "AQRYO ile Soru mu İtiraf mı, Aşk Metre, akış ve puzzle içerikleri oluştur. Linkini paylaş, takipçilerini etkileşime davet et.";

export const Route = createFileRoute("/")({
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
        content: "index,follow,max-image-preview:large",
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
        content: "website",
      },
      {
        property: "og:url",
        content: "https://www.aqryo.com/",
      },
      {
        property: "og:image",
        content: "https://www.aqryo.com/aqryo-social-cover-v2.jpg",
      },
      {
        property: "og:image:secure_url",
        content: "https://www.aqryo.com/aqryo-social-cover-v2.jpg",
      },
      {
        property: "og:image:type",
        content: "image/jpeg",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "600",
      },
      {
        property: "og:image:alt",
        content: "AQRYO — Create your content in 5 seconds",
      },
      {
        name: "twitter:image",
        content: "https://www.aqryo.com/aqryo-social-cover-v2.jpg",
      },
      {
        name: "twitter:image:alt",
        content: "AQRYO — Create your content in 5 seconds",
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
      { rel: "canonical", href: "https://www.aqryo.com/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://www.aqryo.com/" },
      { rel: "alternate", hrefLang: "tr", href: "https://www.aqryo.com/?lang=tr" },
      { rel: "alternate", hrefLang: "en", href: "https://www.aqryo.com/?lang=en" },
      { rel: "alternate", hrefLang: "es", href: "https://www.aqryo.com/?lang=es" },
      { rel: "alternate", hrefLang: "pt", href: "https://www.aqryo.com/?lang=pt" },
      { rel: "alternate", hrefLang: "fr", href: "https://www.aqryo.com/?lang=fr" },
      { rel: "alternate", hrefLang: "de", href: "https://www.aqryo.com/?lang=de" },
      { rel: "alternate", hrefLang: "it", href: "https://www.aqryo.com/?lang=it" },
      { rel: "alternate", hrefLang: "ar", href: "https://www.aqryo.com/?lang=ar" },
      { rel: "alternate", hrefLang: "hi", href: "https://www.aqryo.com/?lang=hi" },
      { rel: "alternate", hrefLang: "id", href: "https://www.aqryo.com/?lang=id" },
      { rel: "alternate", hrefLang: "ru", href: "https://www.aqryo.com/?lang=ru" },
      { rel: "alternate", hrefLang: "bn", href: "https://www.aqryo.com/?lang=bn" },
      { rel: "alternate", hrefLang: "ur", href: "https://www.aqryo.com/?lang=ur" },
      { rel: "alternate", hrefLang: "vi", href: "https://www.aqryo.com/?lang=vi" },
      { rel: "alternate", hrefLang: "fil", href: "https://www.aqryo.com/?lang=fil" },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.aqryo.com/#organization",
              name: "AQRYO",
              legalName:
                "BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi",
              url: "https://www.aqryo.com/",
              email: "hey@buum-e.com",
              telephone: "+905412914935",
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Büyükesat Mahallesi Koza 1 Caddesi No: 153/4",
                addressLocality: "Çankaya",
                addressRegion: "Ankara",
                addressCountry: "TR",
              },
            },
            {
              "@type": "WebSite",
              "@id": "https://www.aqryo.com/#website",
              url: "https://www.aqryo.com/",
              name: "AQRYO",
              description,
              inLanguage: "tr-TR",
              publisher: {
                "@id": "https://www.aqryo.com/#organization",
              },
            },
            {
              "@type": "SoftwareApplication",
              name: "AQRYO",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://www.aqryo.com/",
              description:
                "İçerik üreticilerinin takipçileriyle paylaşabilecekleri interaktif içerikler ve deneyimler oluşturmasına yardımcı olan web tabanlı creator aracı.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "TRY",
              },
            },
          ],
        }),
      },
    ],
  }),

  component: HomePage,
});
