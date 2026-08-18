import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/contact")({
    component: ContactPage,
});

function ContactPage() {
    return (
        <LegalPageLayout
            title="İletişim"
            description="AQRYO ile ilgili destek, ödeme, iade ve yasal talepleriniz için bizimle iletişime geçebilirsiniz."
            sections={[
                {
                    title: "Şirket bilgileri",
                    content: (
                        <p>
                            <strong>Ticari Unvan:</strong>{" "}
                            BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi
                            <br />
                            <strong>Marka:</strong> AQRYO
                            <br />
                            <strong>Merkez Adresi:</strong>{" "}
                            Büyükesat Mahallesi Koza 1 Caddesi No: 153/4 Çankaya / Ankara
                            <br />
                            <strong>E-posta:</strong>{" "}
                            <a href="mailto:hey@buum-e.com">hey@buum-e.com</a>
                            <br />
                            <strong>Telefon:</strong>{" "}
                            <a href="tel:+905412914935">0541 291 49 35</a>
                            <br />
                            <strong>Web:</strong> www.aqryo.com
                        </p>
                    ),
                },
                {
                    title: "Destek",
                    content: (
                        <p>
                            Hesap, Experience, ödeme, Gift, dijital içerik, teknik sorun veya
                            iade talepleriniz için hey@buum-e.com adresi üzerinden bizimle
                            iletişime geçebilirsiniz.
                        </p>
                    ),
                },
                {
                    title: "Kişisel veriler ve yasal talepler",
                    content: (
                        <p>
                            Kişisel verilerin korunması, gizlilik ve diğer yasal konulara
                            ilişkin başvurularınızı hey@buum-e.com adresine
                            gönderebilirsiniz.
                        </p>
                    ),
                },
            ]}
        />
    );
}