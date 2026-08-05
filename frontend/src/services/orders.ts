import { getParticipantKey } from "./completions";
import { supabase } from "./supabase";

export const STANDARD_OFFER_AMOUNT_MINOR = 900;
export const MIN_GIFT_AMOUNT_MINOR = 2900;

export type GiftKey =
  | "coffee"
  | "heart"
  | "crown"
  | "rocket";

export type GiftMessageKey =
  | "liked"
  | "support"
  | "notice"
  | "more";

export type GiftContactType =
  | "none"
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "email";

export type CreateGiftOrderInput = {
  experienceId: string;
  giftKey: GiftKey;
  messageKey: GiftMessageKey;
  contactType: GiftContactType;
  contactValue?: string;
};

interface CreatedOrder {
  id: string;
  amount_minor: number;
  currency: string;
  status: string;
  created_at: string;
}

interface CreateOrderResponse {
  order?: CreatedOrder;
  alreadyPaid?: boolean;
  reused?: boolean;
  error?: string;
}

interface StartPaymentResponse {
  orderId?: string;
  paymentUrl?: string;
  providerOrderId?: string | null;
  reused?: boolean;
  alreadyPaid?: boolean;
  error?: string;
}

interface PaidOfferBaseResult {
  orderId: string;
  experienceId: string;
  experienceTitle: string;
  offerTitle: string;
  offerDescription?: string;
  score: number;
}

export interface PaidOfferMatchingAnswer {
  question: string;
  answer: string;
}

export interface PaidOfferDifferentAnswer {
  question: string;
  participantAnswer: string;
  creatorAnswer: string;
}

export interface CompatibilityPaidOfferResult
  extends PaidOfferBaseResult {
  kind: "compatibility";
  matchingAnswers: PaidOfferMatchingAnswer[];
  differentAnswers: PaidOfferDifferentAnswer[];
}

export interface TestScoreAnswer {
  question: string;
  participantAnswer: string;
  correctAnswer: string;
}

export interface TestScorePaidOfferResult
  extends PaidOfferBaseResult {
  kind: "test_score";
  resultTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  correctAnswers: TestScoreAnswer[];
  incorrectAnswers: TestScoreAnswer[];
}

export interface TestSpectrumAnswer {
  question: string;
  answer: string;
  weight: number;
}

export interface TestSpectrumPaidOfferResult
  extends PaidOfferBaseResult {
  kind: "test_spectrum";
  resultTitle: string;
  spectrumKey: string;
  mappedAnswerCount: number;
  totalQuestions: number;
  answers: TestSpectrumAnswer[];
  insights: {
    strongestTrigger: {
      question: string;
      answer: string;
      intensity: number;
    } | null;
    calmestArea: {
      question: string;
      answer: string;
      intensity: number;
    } | null;
    reactionPattern: string;
    redZone: string[];
    surpriseInsight: string;
    highIntensityCount: number;
    lowIntensityCount: number;
  };
}

export interface TestProfileBreakdownItem {
  profileId: string;
  title: string;
  description: string;
  count?: number;
  percentage: number;
}

export interface TestProfileAnswer {
  question: string;
  answer: string;
  profileId?: string;
  profileTitle?: string;
  signals?: Array<{
    key: string;
    weight: number;
  }>;
}

export interface TestProfilePaidOfferResult
  extends PaidOfferBaseResult {
  kind: "test_profile";
  resultTitle: string;
  mappedAnswerCount?: number;
  totalQuestions: number;
  winningProfile:
    | TestProfileBreakdownItem
    | null;
  breakdown: TestProfileBreakdownItem[];
  answers: TestProfileAnswer[];
}

export interface TestArchetypePaidOfferResult
  extends PaidOfferBaseResult {
  kind: "test_archetype";
  resultTitle: string;
  totalQuestions: number;
  winningProfile:
    | TestProfileBreakdownItem
    | null;
  breakdown: TestProfileBreakdownItem[];
  answers: TestProfileAnswer[];
}

export interface GuessPaidOfferResult
  extends PaidOfferBaseResult {
  kind: "guess";
  resultTitle: string;
  premiumDescription: string;
}

export type StoryPremiumItem =
  | {
      id: string;
      type: "text";
      text: string;
    }
  | {
      id: string;
      type: "image";
      imageUrl: string;
    };

export interface StoryPaidOfferResult
  extends PaidOfferBaseResult {
  kind: "story";
  resultTitle: string;
  premiumDescription: string;
  premiumItems: StoryPremiumItem[];
}

export type PaidOfferResult =
  | CompatibilityPaidOfferResult
  | TestScorePaidOfferResult
  | TestSpectrumPaidOfferResult
  | TestProfilePaidOfferResult
  | TestArchetypePaidOfferResult
  | GuessPaidOfferResult
  | StoryPaidOfferResult;

interface PaidOfferResultResponse {
  error?: string;

  orderId?: string;
  experienceId?: string;
  experienceTitle?: string;
  offerTitle?: string;
  offerDescription?: string;
  score?: number;

  kind?:
    | "compatibility"
    | "test_score"
    | "test_spectrum"
    | "test_profile"
    | "test_archetype"
    | "guess"
    | "story";

  matchingAnswers?: PaidOfferMatchingAnswer[];
  differentAnswers?: PaidOfferDifferentAnswer[];

  resultTitle?: string;

  totalQuestions?: number;
  correctCount?: number;
  incorrectCount?: number;

  correctAnswers?: TestScoreAnswer[];
  incorrectAnswers?: TestScoreAnswer[];

  mappedAnswerCount?: number;
  spectrumKey?: string;
  insights?: TestSpectrumPaidOfferResult["insights"];

  winningProfile?:
    | TestProfileBreakdownItem
    | null;

  breakdown?: TestProfileBreakdownItem[];

  answers?: TestProfileAnswer[] | TestSpectrumAnswer[];

  premiumDescription?: string;
  premiumItems?: StoryPremiumItem[];
}

function assertOfferOrderAmount(
  order: CreatedOrder,
) {
  if (
    order.amount_minor !==
    STANDARD_OFFER_AMOUNT_MINOR
  ) {
    throw new Error(
      `Offer tutarı geçersiz. Beklenen tutar ${STANDARD_OFFER_AMOUNT_MINOR} kuruş.`,
    );
  }
}

function assertGiftOrderAmount(
  order: CreatedOrder,
) {
  if (
    order.amount_minor <
    MIN_GIFT_AMOUNT_MINOR
  ) {
    throw new Error(
      `Hediye tutarı geçersiz. Minimum tutar ${MIN_GIFT_AMOUNT_MINOR} kuruş.`,
    );
  }
}

export async function createOrder(
  experienceId: string,
) {
  const participantKey =
    getParticipantKey();

  const { data, error } =
    await supabase.functions.invoke<CreateOrderResponse>(
      "create-order",
      {
        body: {
          experienceId,
          participantKey,
        },
      },
    );

  if (error) {
    throw new Error(
      `Sipariş başlatılamadı: ${error.message}`,
    );
  }

  if (!data?.order) {
    throw new Error(
      data?.error ??
        "Sipariş oluşturulamadı.",
    );
  }

  assertOfferOrderAmount(
    data.order,
  );

  return {
    order: data.order,
    alreadyPaid:
      data.alreadyPaid === true,
    reused:
      data.reused === true,
  };
}

export async function startSipayPayment(
  orderId: string,
) {
  const { data, error } =
    await supabase.functions.invoke<StartPaymentResponse>(
      "start-sipay-payment",
      {
        body: {
          orderId,
        },
      },
    );

  if (error) {
    throw new Error(
      `Ödeme başlatılamadı: ${error.message}`,
    );
  }

  if (
    data?.alreadyPaid === true
  ) {
    throw new Error(
      data?.error ??
        "Bu sipariş zaten ödenmiş.",
    );
  }

  if (!data?.paymentUrl) {
    throw new Error(
      data?.error ??
        "Ödeme bağlantısı oluşturulamadı.",
    );
  }

  return data;
}

export async function createOrderAndStartPayment(
  experienceId: string,
) {
  const {
    order,
    alreadyPaid,
    reused,
  } = await createOrder(experienceId);

  if (alreadyPaid) {
    return {
      order,
      alreadyPaid: true,
      reused: true,
      payment: null,
    };
  }

  const payment =
    await startSipayPayment(order.id);

  return {
    order,
    alreadyPaid: false,
    reused:
      reused === true ||
      payment.reused === true,
    payment,
  };
}


export async function createGiftOrder(
  input: CreateGiftOrderInput,
) {
  const participantKey =
    getParticipantKey();

  const { data, error } =
    await supabase.functions.invoke<CreateOrderResponse>(
      "create-order",
      {
        body: {
          experienceId:
            input.experienceId,
          participantKey,
          purchaseType: "gift",
          giftKey: input.giftKey,
          messageKey:
            input.messageKey,
          contactType:
            input.contactType,
          contactValue:
            input.contactValue ?? "",
        },
      },
    );

  if (error) {
    throw new Error(
      `Hediye siparişi başlatılamadı: ${error.message}`,
    );
  }

  if (!data?.order) {
    throw new Error(
      data?.error ??
        "Hediye siparişi oluşturulamadı.",
    );
  }

  assertGiftOrderAmount(
    data.order,
  );

  return data.order;
}

export async function createGiftOrderAndStartPayment(
  input: CreateGiftOrderInput,
) {
  const order =
    await createGiftOrder(input);

  const payment =
    await startSipayPayment(
      order.id,
    );

  return {
    order,
    payment,
  };
}

function requireBaseResult(
  data: PaidOfferResultResponse,
) {
  if (
    !data.orderId ||
    !data.experienceId ||
    typeof data.score !== "number" ||
    !data.kind
  ) {
    throw new Error(
      "Ücretli sonuç verisi eksik veya geçersiz.",
    );
  }

  return {
    orderId: data.orderId,
    experienceId: data.experienceId,
    experienceTitle:
      data.experienceTitle ?? "",
    offerTitle:
      data.offerTitle ??
      "Premium sonuç",
    offerDescription:
      data.offerDescription ?? "",
    score: data.score,
  };
}

export async function getPaidOfferResult(
  orderId: string,
): Promise<PaidOfferResult> {
  const participantKey =
    getParticipantKey();

  const { data, error } =
    await supabase.functions.invoke<PaidOfferResultResponse>(
      "get-paid-offer-result",
      {
        body: {
          orderId,
          participantKey,
        },
      },
    );

  if (error) {
    throw new Error(
      `Ücretli sonuç doğrulanamadı: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Ücretli sonuç verisi alınamadı.",
    );
  }

  if (data.error) {
    throw new Error(
      data.error,
    );
  }

  const base =
    requireBaseResult(data);

  if (
    data.kind ===
    "compatibility"
  ) {
    if (
      !Array.isArray(
        data.matchingAnswers,
      ) ||
      !Array.isArray(
        data.differentAnswers,
      )
    ) {
      throw new Error(
        "Uyumluluk premium sonucu eksik.",
      );
    }

    return {
      ...base,
      kind:
        "compatibility",
      matchingAnswers:
        data.matchingAnswers,
      differentAnswers:
        data.differentAnswers,
    };
  }

  if (
    data.kind ===
    "test_score"
  ) {
    if (
      typeof data.totalQuestions !==
        "number" ||
      typeof data.correctCount !==
        "number" ||
      typeof data.incorrectCount !==
        "number" ||
      !Array.isArray(
        data.correctAnswers,
      ) ||
      !Array.isArray(
        data.incorrectAnswers,
      )
    ) {
      throw new Error(
        "Test performans sonucu eksik.",
      );
    }

    return {
      ...base,
      kind:
        "test_score",
      resultTitle:
        data.resultTitle ?? "",
      totalQuestions:
        data.totalQuestions,
      correctCount:
        data.correctCount,
      incorrectCount:
        data.incorrectCount,
      correctAnswers:
        data.correctAnswers,
      incorrectAnswers:
        data.incorrectAnswers,
    };
  }

  if (
    data.kind ===
    "test_spectrum"
  ) {
    if (
      typeof data.totalQuestions !==
        "number" ||
      typeof data.mappedAnswerCount !==
        "number" ||
      typeof data.spectrumKey !==
        "string" ||
      !Array.isArray(
        data.answers,
      ) ||
      !data.insights
    ) {
      throw new Error(
        "Seviye premium sonucu eksik.",
      );
    }

    return {
      ...base,
      kind:
        "test_spectrum",
      resultTitle:
        data.resultTitle ?? "",
      spectrumKey:
        data.spectrumKey,
      mappedAnswerCount:
        data.mappedAnswerCount,
      totalQuestions:
        data.totalQuestions,
      answers:
        data.answers as TestSpectrumAnswer[],
      insights:
        data.insights,
    };
  }

  if (
    data.kind ===
    "test_profile"
  ) {
    if (
      typeof data.totalQuestions !==
        "number" ||
      !Array.isArray(
        data.breakdown,
      ) ||
      !Array.isArray(
        data.answers,
      )
    ) {
      throw new Error(
        "Profil premium sonucu eksik.",
      );
    }

    return {
      ...base,
      kind:
        "test_profile",
      resultTitle:
        data.resultTitle ?? "",
      mappedAnswerCount:
        data.mappedAnswerCount,
      totalQuestions:
        data.totalQuestions,
      winningProfile:
        data.winningProfile ??
        null,
      breakdown:
        data.breakdown,
      answers:
        data.answers as TestProfileAnswer[],
    };
  }

  if (
    data.kind ===
    "test_archetype"
  ) {
    if (
      typeof data.totalQuestions !==
        "number" ||
      !Array.isArray(
        data.breakdown,
      ) ||
      !Array.isArray(
        data.answers,
      )
    ) {
      throw new Error(
        "Eşleşme premium sonucu eksik.",
      );
    }

    return {
      ...base,
      kind:
        "test_archetype",
      resultTitle:
        data.resultTitle ?? "",
      totalQuestions:
        data.totalQuestions,
      winningProfile:
        data.winningProfile ??
        null,
      breakdown:
        data.breakdown,
      answers:
        data.answers as TestProfileAnswer[],
    };
  }

  if (
    data.kind ===
    "guess"
  ) {
    return {
      ...base,
      kind:
        "guess",
      resultTitle:
        data.resultTitle ??
        "Doğru cevap",
      premiumDescription:
        data.premiumDescription ??
        data.offerDescription ??
        "",
    };
  }

  if (
    data.kind ===
    "story"
  ) {
    if (
      !Array.isArray(
        data.premiumItems,
      )
    ) {
      throw new Error(
        "Story premium devamı eksik.",
      );
    }

    return {
      ...base,
      kind:
        "story",
      resultTitle:
        data.resultTitle ??
        "İçerik tamamlandı",
      premiumDescription:
        data.premiumDescription ??
        data.offerDescription ??
        "",
      premiumItems:
        data.premiumItems,
    };
  }

  throw new Error(
    "Bilinmeyen premium sonuç türü.",
  );
}

interface ExistingPaidOrderResponse {
  paid?: boolean;
  orderId?: string | null;
  error?: string;
}

export async function getExistingPaidOrder(
  experienceId: string,
) {
  const participantKey =
    getParticipantKey();

  const { data, error } =
    await supabase.functions.invoke<ExistingPaidOrderResponse>(
      "get-existing-paid-order",
      {
        body: {
          experienceId,
          participantKey,
        },
      },
    );

  if (error) {
    throw new Error(
      `Önceki satın alma kontrol edilemedi: ${error.message}`,
    );
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    paid:
      data?.paid === true,
    orderId:
      data?.orderId ?? null,
  };
}