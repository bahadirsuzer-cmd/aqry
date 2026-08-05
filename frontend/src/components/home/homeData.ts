export type HomeExperienceType =
  | "TEST"
  | "HİKAYE"
  | "BULMACA";

export interface HomeExperienceCard {
  id: string;
  type: HomeExperienceType;
  title: string;
  meta: string;
  coverImage?: string;
  accent: string;
  fallbackSymbol: string;
}

export const featuredExperiences: HomeExperienceCard[] = [
  {
    id: "story-2341",
    type: "HİKAYE",
    title: "23:41’de Gelen Mesaj",
    meta: "5 bölüm",
    accent:
      "from-[#170f2e] via-[#30205a] to-[#f0447b]",
    fallbackSymbol: "23:41",
  },
  {
    id: "compatibility",
    type: "TEST",
    title: "Benimle ne kadar uyumlusun?",
    meta: "8 soru",
    accent:
      "from-[#ff6da8] via-[#b96cff] to-[#6d28d9]",
    fallbackSymbol: "♡",
  },
  {
    id: "what-is-this",
    type: "BULMACA",
    title: "Bu nedir?",
    meta: "5 ipucu",
    accent:
      "from-[#f6c85f] via-[#b46f32] to-[#3f281e]",
    fallbackSymbol: "?",
  },
];

export const popularExperiences: HomeExperienceCard[] = [
  {
    id: "jealousy",
    type: "TEST",
    title: "Ne kadar kıskançsın?",
    meta: "7 soru",
    accent:
      "from-[#ff5ca8] via-[#d64aca] to-[#7c3aed]",
    fallbackSymbol: "♥",
  },
  {
    id: "ghosting",
    type: "TEST",
    title: "Ghostlanıyor musun?",
    meta: "6 soru",
    accent:
      "from-[#4338ca] via-[#6d28d9] to-[#111827]",
    fallbackSymbol: "◌",
  },
  {
    id: "love-meter",
    type: "TEST",
    title: "Aşk metre ne durumda?",
    meta: "10 soru",
    accent:
      "from-[#06b6d4] via-[#8b5cf6] to-[#ec4899]",
    fallbackSymbol: "%",
  },
  {
    id: "story-2341",
    type: "HİKAYE",
    title: "23:41’de Gelen Mesaj",
    meta: "5 bölüm",
    accent:
      "from-[#0f172a] via-[#17335c] to-[#ec4899]",
    fallbackSymbol: "23:41",
  },
  {
    id: "what-is-this",
    type: "BULMACA",
    title: "Bu nedir?",
    meta: "5 ipucu",
    accent:
      "from-[#d6ad60] via-[#7c4f28] to-[#20150f]",
    fallbackSymbol: "?",
  },
  {
    id: "elevator-seven",
    type: "BULMACA",
    title: "Asansör 7. katta durdu.",
    meta: "4 ipucu",
    accent:
      "from-[#0f172a] via-[#26334f] to-[#111827]",
    fallbackSymbol: "7",
  },
];