import type {
  ExperienceTone,
} from "@/types/experienceBlueprint";

import type {
  ExperienceResult,
} from "@/services/resultEngine";

export type InterpretedResult = {
  headline: string;
  description: string;
  badge: string | null;
  scoreLabel: string | null;
  disclaimer: string;
};

function getScoreLabel(
  result: ExperienceResult,
) {
  if (result.score === null) {
    return null;
  }

  if (result.mode === "similarity") {
    return `%${result.score} uyum`;
  }

  if (result.mode === "score") {
    return `%${result.score} skor`;
  }

  return `%${result.score}`;
}

function getDefaultDescription(
  result: ExperienceResult,
) {
  const firstDetail =
    result.details[0];

  if (firstDetail) {
    return firstDetail;
  }

  return result.summary;
}

function interpretFun(
  result: ExperienceResult,
): Pick<
  InterpretedResult,
  "headline" | "description"
> {
  const score = result.score;

  if (
    result.mode === "similarity" &&
    score !== null
  ) {
    if (score >= 80) {
      return {
        headline:
          result.profile?.title ??
          "Bu kadar benzerlik biraz şüpheli 👀",
        description:
          result.profile?.description ??
          "Birçok konuda aynı frekanstasınız. Aynı anda aynı şeyi söylemeye başlarsanız şaşırmayın.",
      };
    }

    if (score >= 60) {
      return {
        headline:
          result.profile?.title ??
          "Gayet iyi gidiyorsunuz",
        description:
          result.profile?.description ??
          "Ortak noktanız bol. Birkaç yerde yollar ayrılıyor ama zaten biraz fark iyidir.",
      };
    }

    if (score >= 40) {
      return {
        headline:
          result.profile?.title ??
          "Biraz aynı, biraz başka gezegen",
        description:
          result.profile?.description ??
          "Bazı konularda aynı dili konuşuyorsunuz, bazılarında altyazı gerekebilir.",
      };
    }

    return {
      headline:
        result.profile?.title ??
        "Farklı dünyaların insanısınız",
      description:
        result.profile?.description ??
        "Ortak noktalar var ama aynı kafada olduğunuzu söylemek biraz cesur olur.",
    };
  }

  return {
    headline: result.summary,
    description:
      getDefaultDescription(
        result,
      ),
  };
}

function interpretSharp(
  result: ExperienceResult,
): Pick<
  InterpretedResult,
  "headline" | "description"
> {
  const score = result.score;

  if (
    result.mode === "similarity" &&
    score !== null
  ) {
    if (score >= 80) {
      return {
        headline:
          result.profile?.title ??
          "Neredeyse aynı kişisiniz",
        description:
          result.profile?.description ??
          "Bu kadar ortak cevap tesadüfse bile oldukça iddialı bir tesadüf.",
      };
    }

    if (score >= 60) {
      return {
        headline:
          result.profile?.title ??
          "Olur bu iş",
        description:
          result.profile?.description ??
          "Her konuda aynı değilsiniz ama birbirinizi anlamak için tercümana da ihtiyacınız yok.",
      };
    }

    if (score >= 40) {
      return {
        headline:
          result.profile?.title ??
          "İdare eder",
        description:
          result.profile?.description ??
          "Bazı cevaplarda çok iyisiniz. Bazılarında ise birbirinizi sinir etme potansiyeliniz gayet yüksek.",
      };
    }

    return {
      headline:
        result.profile?.title ??
        "Bu ilişki toplantı ister",
      description:
        result.profile?.description ??
        "Birbirinize benzemek konusunda pek çalışmamışsınız. Belki de olay tam olarak budur.",
    };
  }

  return {
    headline: result.summary,
    description:
      getDefaultDescription(
        result,
      ),
  };
}

function interpretFlirty(
  result: ExperienceResult,
): Pick<
  InterpretedResult,
  "headline" | "description"
> {
  const score = result.score;

  if (
    result.mode === "similarity" &&
    score !== null
  ) {
    if (score >= 80) {
      return {
        headline:
          result.profile?.title ??
          "Burada bir şeyler oluyor ✨",
        description:
          result.profile?.description ??
          "Cevaplarınız birbirine fazlasıyla yakın. Bu kadar uyum biraz daha yakından incelenmeyi hak ediyor.",
      };
    }

    if (score >= 60) {
      return {
        headline:
          result.profile?.title ??
          "Elektrik var",
        description:
          result.profile?.description ??
          "Her şey aynı değil ama zaten biraz merak bırakmak kötü bir şey sayılmaz.",
      };
    }

    if (score >= 40) {
      return {
        headline:
          result.profile?.title ??
          "Karışık sinyaller",
        description:
          result.profile?.description ??
          "Bazı yerlerde çok yakınsınız, bazı yerlerde ise birbirinizi çözmek biraz zaman isteyebilir.",
      };
    }

    return {
      headline:
        result.profile?.title ??
        "Zıt kutuplar modu",
      description:
        result.profile?.description ??
        "Cevaplar çok benzemiyor. Ama bazen hikâyeyi ilginç yapan şey de tam olarak budur.",
    };
  }

  return {
    headline: result.summary,
    description:
      getDefaultDescription(
        result,
      ),
  };
}

function interpretAbsurd(
  result: ExperienceResult,
): Pick<
  InterpretedResult,
  "headline" | "description"
> {
  const score = result.score;

  if (score !== null) {
    if (score >= 80) {
      return {
        headline:
          result.profile?.title ??
          "Aynı Wi-Fi’ye bağlı gibisiniz",
        description:
          result.profile?.description ??
          "Beyinleriniz aynı güncellemeyi almış olabilir. Araştırıyoruz.",
      };
    }

    if (score >= 60) {
      return {
        headline:
          result.profile?.title ??
          "Sistem sizi uyumlu buldu",
        description:
          result.profile?.description ??
          "AQRY laboratuvarındaki tamamen hayalî bilim insanları sonuçtan memnun.",
      };
    }

    if (score >= 40) {
      return {
        headline:
          result.profile?.title ??
          "Sonuçlar hafif karışık",
        description:
          result.profile?.description ??
          "Bir taraf kahve diyor, diğer taraf çay. Medeniyet hâlâ ayakta.",
      };
    }

    return {
      headline:
        result.profile?.title ??
        "Aynı evrenden olmayabilirsiniz",
      description:
        result.profile?.description ??
        "Şimdilik paralel evren teorisini dışlayamıyoruz.",
    };
  }

  return {
    headline: result.summary,
    description:
      getDefaultDescription(
        result,
      ),
  };
}

function interpretDramatic(
  result: ExperienceResult,
): Pick<
  InterpretedResult,
  "headline" | "description"
> {
  const score = result.score;

  if (
    result.mode === "similarity" &&
    score !== null
  ) {
    if (score >= 80) {
      return {
        headline:
          result.profile?.title ??
          "Yollarınız tesadüfen kesişmemiş olabilir",
        description:
          result.profile?.description ??
          "Cevaplarınız arasında güçlü bir ritim var. Bazı karşılaşmaların açıklaması rakamlardan daha fazlasıdır.",
      };
    }

    if (score >= 60) {
      return {
        headline:
          result.profile?.title ??
          "Aranızdaki bağ hissediliyor",
        description:
          result.profile?.description ??
          "Aynı değilsiniz ama birbirinizi anlayabileceğiniz yeterince ortak alanınız var.",
      };
    }

    if (score >= 40) {
      return {
        headline:
          result.profile?.title ??
          "İki farklı hikâye",
        description:
          result.profile?.description ??
          "Bazı sayfalarda buluşuyorsunuz, bazı sayfalarda yollarınız tamamen ayrılıyor.",
      };
    }

    return {
      headline:
        result.profile?.title ??
        "Yollarınız farklı",
      description:
        result.profile?.description ??
        "Aynı sorulara çok farklı yerlerden bakıyorsunuz. Bazen en büyük hikâyeler de buradan çıkar.",
    };
  }

  return {
    headline: result.summary,
    description:
      getDefaultDescription(
        result,
      ),
  };
}

function interpretNeutral(
  result: ExperienceResult,
): Pick<
  InterpretedResult,
  "headline" | "description"
> {
  return {
    headline:
      result.profile?.title ??
      result.summary,

    description:
      result.profile?.description ??
      getDefaultDescription(
        result,
      ),
  };
}

export function interpretExperienceResult(
  result: ExperienceResult,
  tone: ExperienceTone,
): InterpretedResult {
  let interpretation:
    Pick<
      InterpretedResult,
      "headline" | "description"
    >;

  if (tone === "fun") {
    interpretation =
      interpretFun(result);
  } else if (
    tone === "sharp"
  ) {
    interpretation =
      interpretSharp(result);
  } else if (
    tone === "flirty"
  ) {
    interpretation =
      interpretFlirty(result);
  } else if (
    tone === "absurd"
  ) {
    interpretation =
      interpretAbsurd(result);
  } else if (
    tone === "dramatic"
  ) {
    interpretation =
      interpretDramatic(result);
  } else {
    interpretation =
      interpretNeutral(result);
  }

  return {
    ...interpretation,

    badge:
      result.profile?.title ??
      null,

    scoreLabel:
      getScoreLabel(result),

    disclaimer:
      "Bu Experience eğlence amaçlıdır; bilimsel veya profesyonel değerlendirme değildir.",
  };
}