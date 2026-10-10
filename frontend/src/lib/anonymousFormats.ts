export type AnonymousMode = "question" | "confession";
const names: Record<string, [string, string]> = {
 tr: ["Anonim soru sor", "Anonim itiraf et"], en: ["Ask anonymously", "Confess anonymously"],
 de: ["Anonym fragen", "Anonym gestehen"], es: ["Pregunta anónima", "Confesión anónima"],
 pt: ["Pergunte anonimamente", "Confesse anonimamente"], fr: ["Question anonyme", "Confession anonyme"],
 it: ["Domanda anonima", "Confessione anonima"], ar: ["اسأل بشكل مجهول", "اعترف بشكل مجهول"],
 hi: ["गुमनाम सवाल पूछें", "गुमनाम स्वीकारोक्ति करें"], id: ["Tanya anonim", "Pengakuan anonim"],
 ru: ["Анонимный вопрос", "Анонимное признание"], bn: ["বেনামে প্রশ্ন করুন", "বেনামে স্বীকার করুন"],
 ur: ["گمنام سوال پوچھیں", "گمنام اعتراف کریں"], vi: ["Hỏi ẩn danh", "Thú nhận ẩn danh"],
 fil: ["Magtanong nang anonymous", "Umamin nang anonymous"],
};
export function anonymousName(locale: string, mode: AnonymousMode) {
 return (names[locale] ?? names.en)[mode === "confession" ? 1 : 0];
}
export function anonymousMode(value: unknown): AnonymousMode | undefined {
 return value === "question" || value === "confession" ? value : undefined;
}

export function anonymousModeFromLabel(label?: string): AnonymousMode | undefined {
 for (const pair of Object.values(names)) {
  if (label === pair[0]) return "question";
  if (label === pair[1]) return "confession";
 }
 return undefined;
}
