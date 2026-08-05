import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "AQRYO — Interactive Experiences for Creators",
      },
      {
        name: "description",
        content:
          "Testler, hikayeler, bulmacalar ve interaktif deneyimler oluştur. Kitlenle paylaş, etkileşimini artır ve gelir elde et.",
      },
      {
        property: "og:title",
        content:
          "AQRYO — Interactive Experiences for Creators",
      },
      {
        property: "og:description",
        content:
          "Sıradan içerik yerine insanların katıldığı interaktif deneyimler oluştur.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
  }),
  component: HomePage,
});