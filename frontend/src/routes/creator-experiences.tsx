import { CreatorNavigation } from "@/components/CreatorNavigation";
import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { supabase } from "@/services/supabase";
import {
  getExperienceStats,
  type ExperienceStats,
} from "@/services/experienceStats";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";

type CreatorTestMode =
  | "score"
  | "spectrum"
  | "archetype"
  | null;

interface CreatorExperience {
  id: string;
  title: string;
  description: string | null;
  type: string;
  testMode: CreatorTestMode;
  status: string;
  paused_by: string | null;
  pause_reason: string | null;
  moderated_at: string | null;
  published_at: string | null;
  created_at: string;
  stats: ExperienceStats;
  revenue: {
    giftAmountMinor: number;
    offerAmountMinor: number;
    totalAmountMinor: number;
    currency: string;
  };
}

interface ExperienceRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  paused_by: string | null;
  pause_reason: string | null;
  moderated_at: string | null;
  published_at: string | null;
  created_at: string;
  content: unknown;
}

type ExperienceOrderMetadata = {
  kind?: "gift" | "offer" | string;
};

interface ExperienceRevenueOrder {
  experience_id: string;
  amount_minor: number;
  currency: string;
  status: string;
  metadata: ExperienceOrderMetadata | null;
}

interface ParticipantCompletion {
  participant_key: string;
  score: number;
  result_key: string | null;
  answers: number[];
  completed_at: string;
}

interface ExperienceQuestion {
  id: number;
  text: string;
  options: string[];
}

type JsonObject = Record<string, unknown>;

type SortMode =
  | "newest"
  | "oldest"
  | "most-viewed"
  | "most-started"
  | "most-completed"
  | "highest-revenue";

type StatusFilter =
  | "all"
  | "published"
  | "paused"
  | "draft";

const STANDARD_OFFER_PRICE = 9;

export const Route = createFileRoute(
  "/creator-experiences",
)({
  component: CreatorExperiencesPage,
});

function CreatorExperiencesPage() {
  const [experiences, setExperiences] = useState<
    CreatorExperience[]
  >([]);

  const [
    selectedExperienceId,
    setSelectedExperienceId,
  ] = useState<string | null>(null);

  const [searchValue, setSearchValue] =
    useState("");

  const [sortMode, setSortMode] =
    useState<SortMode>("newest");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExperiences() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const creator =
          await getCurrentCreator();

        if (!creator) {
          window.location.href =
            "/creator-auth";

          return;
        }

        const { data, error } = await supabase
          .from("experiences")
          .select(
            `
              id,
              title,
              description,
              type,
              content,
              status,
              paused_by,
              pause_reason,
              moderated_at,
              published_at,
              created_at
            `,
          )
          .eq("creator_id", creator.id)
          .order("published_at", {
            ascending: false,
          });

        if (error) {
          throw new Error(error.message);
        }

        const rows =
          (data ?? []) as ExperienceRow[];

        const experienceIds =
          rows.map(
            (experience) =>
              experience.id,
          );

        const revenueByExperience =
          new Map<
            string,
            {
              giftAmountMinor: number;
              offerAmountMinor: number;
              totalAmountMinor: number;
              currency: string;
            }
          >();

        if (experienceIds.length > 0) {
          const {
            data: orderData,
            error: orderError,
          } = await supabase
            .from("orders")
            .select(
              `
                experience_id,
                amount_minor,
                currency,
                status,
                metadata
              `,
            )
            .in(
              "experience_id",
              experienceIds,
            )
            .eq("status", "paid");

          if (orderError) {
            throw new Error(
              orderError.message,
            );
          }

          for (const rawOrder of
            (orderData ??
              []) as ExperienceRevenueOrder[]) {
            const current =
              revenueByExperience.get(
                rawOrder.experience_id,
              ) ?? {
                giftAmountMinor: 0,
                offerAmountMinor: 0,
                totalAmountMinor: 0,
                currency:
                  rawOrder.currency ||
                  "TRY",
              };

            const amount =
              normalizeMinorAmount(
                rawOrder.amount_minor,
              );

            if (
              rawOrder.metadata?.kind ===
              "gift"
            ) {
              current.giftAmountMinor +=
                amount;
            } else {
              current.offerAmountMinor +=
                amount;
            }

            current.totalAmountMinor +=
              amount;

            revenueByExperience.set(
              rawOrder.experience_id,
              current,
            );
          }
        }

        const experiencesWithStats =
          await Promise.all(
            rows.map(
              async (
                experience,
              ): Promise<CreatorExperience> => {
                const stats =
                  await getExperienceStats(
                    experience.id,
                  );

                return {
                  ...experience,
                  testMode:
                    getTestModeFromContent(
                      experience.content,
                    ),
                  stats,
                  revenue:
                    revenueByExperience.get(
                      experience.id,
                    ) ?? {
                      giftAmountMinor: 0,
                      offerAmountMinor: 0,
                      totalAmountMinor: 0,
                      currency: "TRY",
                    },
                };
              },
            ),
          );

        if (cancelled) {
          return;
        }

        setExperiences(
          experiencesWithStats,
        );
        setSelectedExperienceId(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Experience’lar yüklenemedi.";

        console.error(
          "Experience listesi yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadExperiences();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeExperienceCount =
    useMemo(
      () =>
        experiences.filter(
          (experience) =>
            experience.status ===
            "published",
        ).length,
      [experiences],
    );

  const totalCompletions = useMemo(
    () =>
      experiences.reduce(
        (total, experience) =>
          total +
          experience.stats
            .totalCompletions,
        0,
      ),
    [experiences],
  );
const totalViews = useMemo(
  () =>
    experiences.reduce(
      (total, experience) =>
        total +
        experience.stats.totalViews,
      0,
    ),
  [experiences],
);

const totalStarts = useMemo(
  () =>
    experiences.reduce(
      (total, experience) =>
        total +
        experience.stats.totalStarts,
      0,
    ),
  [experiences],
);
  const totalRevenueMinor =
    useMemo(
      () =>
        experiences.reduce(
          (total, experience) =>
            total +
            experience.revenue
              .totalAmountMinor,
          0,
        ),
      [experiences],
    );

  const filteredExperiences =
    useMemo(() => {
      const normalizedSearch =
        searchValue
          .trim()
          .toLocaleLowerCase("tr-TR");

      const matchingExperiences =
        experiences.filter(
          (experience) => {
            const matchesStatus =
              statusFilter === "all" ||
              experience.status ===
                statusFilter;

            if (!matchesStatus) {
              return false;
            }

            if (!normalizedSearch) {
              return true;
            }

            return (
              experience.title
                .toLocaleLowerCase(
                  "tr-TR",
                )
                .includes(
                  normalizedSearch,
                ) ||
              experience.type
                .toLocaleLowerCase(
                  "tr-TR",
                )
                .includes(
                  normalizedSearch,
                ) ||
              formatExperienceType(
                experience.type,
                experience.testMode,
              )
                .toLocaleLowerCase(
                  "tr-TR",
                )
                .includes(
                  normalizedSearch,
                )
            );
          },
        );

      return [...matchingExperiences].sort(
        (first, second) => {
          if (sortMode === "oldest") {
            return (
              getExperienceDate(first) -
              getExperienceDate(second)
            );
          }

          if (
            sortMode ===
            "most-viewed"
          ) {
            return (
              second.stats.totalViews -
              first.stats.totalViews
            );
          }

          if (
            sortMode ===
            "most-started"
          ) {
            return (
              second.stats.totalStarts -
              first.stats.totalStarts
            );
          }

          if (
            sortMode ===
            "most-completed"
          ) {
            return (
              second.stats
                .totalCompletions -
              first.stats
                .totalCompletions
            );
          }

          return (
            getExperienceDate(second) -
            getExperienceDate(first)
          );
        },
      );
    }, [
      experiences,
      searchValue,
      sortMode,
      statusFilter,
    ]);

  function toggleExperience(
    experienceId: string,
  ) {
    setSelectedExperienceId(
      (currentId) =>
        currentId === experienceId
          ? null
          : experienceId,
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8fa] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();

          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <h1 className="text-[11px] font-black uppercase tracking-[0.13em] sm:text-xs">
            Experience’larım
          </h1>

          <p className="text-[10px] font-black uppercase tracking-[0.09em] text-muted-foreground">
            Aktif:{" "}
            <span className="text-foreground">
              {activeExperienceCount}
            </span>
          </p>
        </header>

        <section className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
          <SummaryMetric
  label="Experience"
  value={formatCompactNumber(
    experiences.length,
  )}
/>

<SummaryMetric
  label="Görüntüleme"
  value={formatCompactNumber(
    totalViews,
  )}
/>

<SummaryMetric
  label="Başlatma"
  value={formatCompactNumber(
    totalStarts,
  )}
/>

<SummaryMetric
  label="Tamamlama"
  value={formatCompactNumber(
    totalCompletions,
  )}
/>        </section>

        <section className="mt-4 overflow-hidden rounded-[22px] border border-border bg-white shadow-[0_14px_45px_rgba(22,12,34,0.045)]">
          <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.08em]">
                Tüm Experience’lar
              </span>

              <span className="rounded-full bg-background px-2 py-1 text-[8px] font-black text-muted-foreground">
                {filteredExperiences.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <input
                type="search"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(
                    event.target.value,
                  )
                }
                placeholder="Experience ara"
                className="col-span-2 h-9 min-w-0 rounded-[11px] border border-border bg-background px-3 text-[10px] font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary sm:col-span-1 sm:w-52"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
                aria-label="Experience durum filtresi"
                className="h-9 rounded-[11px] border border-border bg-background px-3 text-[9px] font-bold outline-none transition focus:border-primary"
              >
                <option value="all">
                  Tüm durumlar
                </option>

                <option value="published">
                  Aktif
                </option>

                <option value="paused">
                  Pasif
                </option>

                <option value="draft">
                  Taslak
                </option>
              </select>

              <select
                value={sortMode}
                onChange={(event) =>
                  setSortMode(
                    event.target
                      .value as SortMode,
                  )
                }
                aria-label="Experience sıralaması"
                className="h-9 rounded-[11px] border border-border bg-background px-3 text-[9px] font-bold outline-none transition focus:border-primary"
              >
                <option value="newest">
                  En yeni
                </option>

                <option value="oldest">
                  En eski
                </option>

                <option value="most-viewed">
                  En çok görüntülenen
                </option>

                <option value="most-started">
                  En çok başlatılan
                </option>

                <option value="most-completed">
                  En çok tamamlanan
                </option>

                <option value="highest-revenue">
                  En çok kazandıran
                </option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="p-12 text-center">
              <p className="text-xs font-bold text-muted-foreground">
                Experience’lar
                yükleniyor...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="m-4 rounded-[16px] border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-bold text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          {!loading &&
            !errorMessage &&
            experiences.length === 0 && (
              <EmptyExperiences />
            )}
          {!loading &&
            !errorMessage &&
            experiences.length > 0 && (
              <div>
                <div className="hidden grid-cols-[minmax(220px,1fr)_82px_78px_78px_78px_110px_108px_24px] items-center gap-3 border-b border-border bg-[#fafafa] px-4 py-2.5 text-[7px] font-black uppercase tracking-[0.06em] text-muted-foreground lg:grid">
                  <span>Experience</span>
                  <span>Durum</span>
                  <span>Görüntüleme</span>
                  <span>Başlatma</span>
                  <span>Tamamlama</span>
                  <span>Son tamamlama</span>
                  <span>Kazanç</span>
                  <span />
                </div>

                {filteredExperiences.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-xs font-black">
                      Sonuç bulunamadı
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Arama veya filtrelerini değiştir.
                    </p>
                  </div>
                )}

                {filteredExperiences.map(
                  (experience) => {
                    const selected =
                      selectedExperienceId ===
                      experience.id;

                    return (
                      <ExperienceListItem
                        key={experience.id}
                        experience={experience}
                        selected={selected}
                        onToggle={() =>
                          toggleExperience(
                            experience.id,
                          )
                        }
                      />
                    );
                  },
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

function ExperienceListItem({
  experience,
  selected,
  onToggle,
}: {
  experience: CreatorExperience;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={selected}
        className={`w-full text-left transition ${
          selected
            ? "bg-primary/[0.045]"
            : "bg-white hover:bg-[#fafafa]"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-3.5 sm:px-4 lg:grid lg:grid-cols-[minmax(220px,1fr)_82px_78px_78px_78px_110px_108px_24px] lg:gap-3 lg:py-3">
  <div className="min-w-0">
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-foreground text-[9px] font-black text-background">
        {getExperienceInitials(
          experience.title,
        )}
      </span>

      <div className="min-w-0">
        <p className="truncate text-xs font-black sm:text-[13px]">
          {experience.title}
        </p>

        <p className="mt-0.5 truncate text-[7px] font-black uppercase tracking-[0.08em] text-muted-foreground">
          {formatExperienceType(
            experience.type,
            experience.testMode,
          )}{" "}
          ·{" "}
          {formatShortDate(
            experience.published_at ??
              experience.created_at,
          )} tarihinde yayınlandı
        </p>
      </div>
    </div>
  </div>

  <StatusBadge
    status={experience.status}
    pausedBy={experience.paused_by}
    moderatedAt={experience.moderated_at}
  />

  <p className="hidden text-[11px] font-black lg:block">
    {experience.stats.totalViews}
  </p>

  <p className="hidden text-[11px] font-black lg:block">
    {experience.stats.totalStarts}
  </p>

  <p className="hidden text-[11px] font-black lg:block">
    {experience.stats.totalCompletions}
  </p>

  <p className="hidden text-[8px] font-bold text-muted-foreground lg:block">
    {experience.stats.latestCompletionAt
      ? formatShortDate(
          experience.stats.latestCompletionAt,
        )
      : "Henüz yok"}
  </p>

  <div className="hidden lg:block">
    <p className="text-[11px] font-black">
      {formatMoney(
        experience.revenue.totalAmountMinor,
        experience.revenue.currency,
      )}
    </p>
    <p className="mt-0.5 text-[7px] font-bold text-muted-foreground">
      🎁{" "}
      {formatMoney(
        experience.revenue.giftAmountMinor,
        experience.revenue.currency,
      )}{" "}
      · Offer{" "}
      {formatMoney(
        experience.revenue.offerAmountMinor,
        experience.revenue.currency,
      )}
    </p>
  </div>

  <span
    className={`text-sm font-black transition ${
      selected
        ? "rotate-180 text-primary"
        : "text-muted-foreground"
    }`}
  >
    ⌄
  </span>
</div>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3.5 sm:grid-cols-4 sm:px-4 lg:hidden">
  <MobileMetric
    label="Görüntüleme"
    value={`${experience.stats.totalViews}`}
  />

  <MobileMetric
    label="Başlatma"
    value={`${experience.stats.totalStarts}`}
  />

  <MobileMetric
    label="Tamamlama"
    value={`${experience.stats.totalCompletions}`}
  />

  <MobileMetric
    label="Kazanç"
    value={formatMoney(
      experience.revenue.totalAmountMinor,
      experience.revenue.currency,
    )}
  />
</div>
      </button>

      {selected && (
        <div className="border-t border-border bg-[#fafafa] p-3 sm:p-4">
          <ExperienceDetails
  experience={experience}
  compact
/>
        </div>
      )}
    </article>
  );
}

function ExperienceDetails({
  experience,
  compact = false,
}: {
  experience: CreatorExperience;
  compact?: boolean;
}) {
  const [panel, setPanel] = useState<
    "actions" | "participants" | "share"
  >("actions");

  const [participants, setParticipants] =
    useState<ParticipantCompletion[]>([]);

  const [
    participantQuestions,
    setParticipantQuestions,
  ] = useState<ExperienceQuestion[]>([]);

  const [participantsLoading, setParticipantsLoading] =
    useState(false);

  const [participantsLoaded, setParticipantsLoaded] =
    useState(false);

  const [participantsError, setParticipantsError] =
    useState<string | null>(null);

  const [openParticipantKey, setOpenParticipantKey] =
    useState<string | null>(null);

  const [editLoading, setEditLoading] =
    useState(false);
const [statusLoading, setStatusLoading] =
  useState(false);
const [linkCopied, setLinkCopied] =
  useState(false);

  const experienceUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/experience/${experience.id}`;

  async function openParticipants() {
    if (panel === "participants") {
      setPanel("actions");
      return;
    }

    setPanel("participants");

    if (participantsLoaded) {
      return;
    }

    try {
      setParticipantsLoading(true);
      setParticipantsError(null);

      const [
        completionsResult,
        experienceResult,
      ] = await Promise.all([
        supabase
          .from("completions")
          .select(
            `
              participant_key,
              score,
              result_key,
              answers,
              completed_at
            `,
          )
          .eq("experience_id", experience.id)
          .order("completed_at", {
            ascending: false,
          }),
        supabase
          .from("experiences")
          .select("content")
          .eq("id", experience.id)
          .single(),
      ]);

      if (completionsResult.error) {
        throw new Error(
          completionsResult.error.message,
        );
      }

      if (experienceResult.error) {
        throw new Error(
          experienceResult.error.message,
        );
      }

      const experienceContent =
        isJsonObject(
          experienceResult.data?.content,
        )
          ? experienceResult.data.content
          : {};

      const questions =
        Array.isArray(
          experienceContent.questions,
        )
          ? (
              experienceContent.questions as ExperienceQuestion[]
            ).filter(
              (question) =>
                typeof question?.id === "number" &&
                typeof question?.text === "string" &&
                Array.isArray(question?.options),
            )
          : [];

      setParticipants(
        (completionsResult.data ??
          []) as ParticipantCompletion[],
      );

      setParticipantQuestions(questions);
      setParticipantsLoaded(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Katılımcılar yüklenemedi.";

      console.error(
        "Katılımcılar yüklenemedi:",
        error,
      );

      setParticipantsError(message);
    } finally {
      setParticipantsLoading(false);
    }
  }

  async function editExperience() {
    if (editLoading) {
      return;
    }

    if (
      experience.type !== "compatibility" &&
      experience.type !== "test" &&
      experience.type !== "guess" &&
      experience.type !== "story"
    ) {
      window.alert(
        "Bu Experience tipi için düzenleme akışı henüz hazır değil.",
      );
      return;
    }

    try {
      setEditLoading(true);

      const { data, error } = await supabase
        .from("experiences")
        .select(
          `
            id,
            title,
            description,
            type,
            cover_style,
            cover_label,
            cover_image_url,
            content,
            result_config,
            offer_config
          `,
        )
        .eq("id", experience.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(
          "Experience içeriği bulunamadı.",
        );
      }

      const content = isJsonObject(data.content)
        ? data.content
        : {};

      const resultConfig = isJsonObject(
        data.result_config,
      )
        ? data.result_config
        : {};

      const offerConfig = isJsonObject(
        data.offer_config,
      )
        ? data.offer_config
        : {};

      if (experience.type === "guess") {
        const guess =
          isJsonObject(
            content.guess,
          )
            ? content.guess
            : {};

        const guessResults =
          Array.isArray(
            resultConfig.results,
          )
            ? resultConfig.results
            : [];

        const firstResult =
          isJsonObject(
            guessResults[0],
          )
            ? guessResults[0]
            : {};

        const acceptedAnswers =
          Array.isArray(
            guess.acceptedAnswers,
          )
            ? guess.acceptedAnswers.filter(
                (
                  value,
                ): value is string =>
                  typeof value ===
                  "string",
              )
            : [];

        window.sessionStorage.setItem(
          "aqry-guess-builder",
          JSON.stringify({
            title:
              typeof data.title ===
              "string"
                ? data.title
                : "",
            description:
              typeof data.description ===
              "string"
                ? data.description
                : "",
            imageUrl:
              typeof data.cover_image_url ===
              "string"
                ? data.cover_image_url
                : "",
            prompt:
              typeof guess.prompt ===
              "string"
                ? guess.prompt
                : "Sence bu nedir?",
            acceptedAnswers: [
              ...acceptedAnswers,
              "",
              "",
              "",
            ].slice(
              0,
              Math.max(
                3,
                acceptedAnswers.length,
              ),
            ),
            successTitle:
              typeof guess.successTitle ===
              "string"
                ? guess.successTitle
                : typeof firstResult.title ===
                    "string"
                  ? firstResult.title
                  : "Bildin! 🎉",
            successDescription:
              typeof guess.successDescription ===
              "string"
                ? guess.successDescription
                : typeof firstResult.description ===
                    "string"
                  ? firstResult.description
                  : "Doğru cevabı buldun.",
            retryEnabled:
              typeof guess.retryEnabled ===
              "boolean"
                ? guess.retryEnabled
                : true,
            offerEnabled:
              typeof offerConfig.enabled ===
              "boolean"
                ? offerConfig.enabled
                : false,
            offerTitle:
              typeof offerConfig.title ===
              "string"
                ? offerConfig.title
                : "",
            offerDescription:
              typeof offerConfig.description ===
              "string"
                ? offerConfig.description
                : "",
            offerPrice:
              STANDARD_OFFER_PRICE,
            sourceExperienceId:
              experience.id,
          }),
        );

        window.location.href =
          "/guess-builder";

        return;
      }

      if (experience.type === "story") {
        const story =
          isJsonObject(
            content.story,
          )
            ? content.story
            : {};

        const storyResults =
          Array.isArray(
            resultConfig.results,
          )
            ? resultConfig.results
            : [];

        const firstResult =
          isJsonObject(
            storyResults[0],
          )
            ? storyResults[0]
            : {};

        const rawItems =
          Array.isArray(
            story.items,
          )
            ? story.items
            : [];

        const legacyBlocks =
          Array.isArray(
            story.blocks,
          )
            ? story.blocks
            : [];

        const legacyCards =
          Array.isArray(
            story.cards,
          )
            ? story.cards
            : [];

        const items =
          rawItems.length > 0
            ? rawItems
            : legacyBlocks.length > 0
              ? legacyBlocks
                  .map(
                    (block) => {
                      if (
                        !isJsonObject(
                          block,
                        )
                      ) {
                        return null;
                      }

                      if (
                        block.type ===
                          "image" &&
                        typeof block.imageUrl ===
                          "string"
                      ) {
                        return {
                          id:
                            typeof block.id ===
                            "string"
                              ? block.id
                              : crypto.randomUUID(),
                          type:
                            "image" as const,
                          imageUrl:
                            block.imageUrl,
                        };
                      }

                      const text =
                        typeof block.text ===
                        "string"
                          ? block.text
                          : typeof block.caption ===
                              "string"
                            ? block.caption
                            : "";

                      return {
                        id:
                          typeof block.id ===
                          "string"
                            ? block.id
                            : crypto.randomUUID(),
                        type:
                          "text" as const,
                        text,
                      };
                    },
                  )
                  .filter(Boolean)
              : legacyCards.flatMap(
                  (card) => {
                    if (
                      !isJsonObject(
                        card,
                      )
                    ) {
                      return [];
                    }

                    const migrated: Array<
                      | {
                          id: string;
                          type: "text";
                          text: string;
                        }
                      | {
                          id: string;
                          type: "image";
                          imageUrl: string;
                        }
                    > = [];

                    const cardId =
                      typeof card.id ===
                      "string"
                        ? card.id
                        : crypto.randomUUID();

                    if (
                      typeof card.text ===
                        "string" &&
                      card.text.trim()
                    ) {
                      migrated.push({
                        id:
                          `${cardId}-text`,
                        type:
                          "text",
                        text:
                          card.text,
                      });
                    }

                    if (
                      typeof card.imageUrl ===
                        "string" &&
                      card.imageUrl.trim()
                    ) {
                      migrated.push({
                        id:
                          `${cardId}-image`,
                        type:
                          "image",
                        imageUrl:
                          card.imageUrl,
                      });
                    }

                    return migrated;
                  },
                );

        window.sessionStorage.setItem(
          "aqry-story-builder",
          JSON.stringify({
            title:
              typeof data.title ===
              "string"
                ? data.title
                : "",
            description:
              typeof data.description ===
              "string"
                ? data.description
                : "",
            coverImageUrl:
              typeof data.cover_image_url ===
              "string"
                ? data.cover_image_url
                : "",
            items:
              items.length > 0
                ? items
                : [
                    {
                      id:
                        crypto.randomUUID(),
                      type:
                        "text",
                      text:
                        "",
                    },
                  ],
            resultTitle:
              typeof story.resultTitle ===
              "string"
                ? story.resultTitle
                : typeof firstResult.title ===
                    "string"
                  ? firstResult.title
                  : "Sonuna geldin.",
            resultDescription:
              typeof story.resultDescription ===
              "string"
                ? story.resultDescription
                : typeof firstResult.description ===
                    "string"
                  ? firstResult.description
                  : "İçeriği tamamladın.",
            offerEnabled:
              typeof offerConfig.enabled ===
              "boolean"
                ? offerConfig.enabled
                : false,
            offerTitle:
              typeof offerConfig.title ===
              "string"
                ? offerConfig.title
                : "",
            offerDescription:
              typeof offerConfig.description ===
              "string"
                ? offerConfig.description
                : "",
            offerPrice:
              STANDARD_OFFER_PRICE,
            sourceExperienceId:
              experience.id,
          }),
        );

        window.location.href =
          "/story-builder";

        return;
      }

      const sharedBuilderData = {
        title:
          typeof data.title === "string"
            ? data.title
            : "",
        description:
          typeof data.description === "string"
            ? data.description
            : "",
        questions: Array.isArray(
          content.questions,
        )
          ? content.questions
          : [],
        coverStyle:
          data.cover_style === "pink" ||
          data.cover_style === "purple" ||
          data.cover_style === "blue" ||
          data.cover_style === "dark"
            ? data.cover_style
            : "pink",
        coverImageUrl:
          typeof data.cover_image_url ===
          "string"
            ? data.cover_image_url
            : "",
        results: Array.isArray(
          resultConfig.results,
        )
          ? resultConfig.results
          : [],
        offerEnabled:
          typeof offerConfig.enabled ===
          "boolean"
            ? offerConfig.enabled
            : false,
        offerTitle:
          typeof offerConfig.title ===
          "string"
            ? offerConfig.title
            : "",
        offerDescription:
          typeof offerConfig.description ===
          "string"
            ? offerConfig.description
            : "",
        offerPrice:
          STANDARD_OFFER_PRICE,
        sourceExperienceId:
          experience.id,
      };

      if (
        sharedBuilderData.questions.length <
          2 ||
        sharedBuilderData.results.length ===
          0
      ) {
        throw new Error(
          "Yayınlanan Experience içeriği eksik.",
        );
      }

      if (experience.type === "test") {
        const testMode =
          content.testMode === "spectrum"
            ? "spectrum"
            : content.testMode ===
                "archetype" ||
              content.testMode ===
                "profile"
              ? "archetype"
              : "score";

        const testBuilderData = {
          ...sharedBuilderData,
          testMode,
          correctAnswers:
            isJsonObject(
              content.creatorAnswers,
            )
              ? content.creatorAnswers
              : {},
          profileAssignments:
            isJsonObject(
              content.profileAssignments,
            )
              ? content.profileAssignments
              : {},
          sourceBlueprint:
            isJsonObject(
              content.blueprint,
            )
              ? content.blueprint
              : null,
          answersLocked:
            testMode === "score",
          coverLabel:
            typeof data.cover_label ===
            "string"
              ? data.cover_label
              : "Test",
        };

        window.sessionStorage.setItem(
          "aqry-test-builder",
          JSON.stringify(
            testBuilderData,
          ),
        );

        window.location.href =
          "/test-builder";

        return;
      }

      const compatibilityBuilderData = {
        ...sharedBuilderData,
        creatorAnswers:
          isJsonObject(
            content.creatorAnswers,
          )
            ? content.creatorAnswers
            : {},
        answersLocked: true,
        coverLabel:
          typeof data.cover_label ===
          "string"
            ? data.cover_label
            : "Uyumluluk",
      };

      window.sessionStorage.setItem(
        "aqry-compatibility-builder",
        JSON.stringify(
          compatibilityBuilderData,
        ),
      );

      window.location.href =
        "/compatibility-builder";
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Experience düzenlemeye açılamadı.";

      console.error(
        "Experience düzenlemeye açılamadı:",
        error,
      );

      window.alert(message);
    } finally {
      setEditLoading(false);
    }
  }
async function toggleExperienceStatus() {
  if (statusLoading) {
    return;
  }

  const moderationLocked =
    experience.paused_by === "moderation" ||
    Boolean(experience.moderated_at);

  if (moderationLocked) {
    window.alert(
      "Bu Experience AQRYO moderasyonu tarafından durduruldu. Yeniden yayınlayamazsın.",
    );
    return;
  }

  if (
    experience.status !== "published" &&
    experience.status !== "paused"
  ) {
    window.alert(
      "Bu Experience bu ekrandan yayına alınamaz.",
    );
    return;
  }

  const isPublished =
    experience.status === "published";

  const nextStatus = isPublished
    ? "paused"
    : "published";

  const confirmationMessage = isPublished
    ? "Bu Experience pasife alınacak. Yeni katılımcılar artık içeriğe erişemeyecek. Mevcut veriler ve kazançlar korunacak. Devam edilsin mi?"
    : "Bu Experience yeniden yayına alınacak ve yeni katılımlara açılacak. Devam edilsin mi?";

  if (!window.confirm(confirmationMessage)) {
    return;
  }

  try {
    setStatusLoading(true);

    const creator =
      await getCurrentCreator();

    if (!creator) {
      window.location.href =
        "/creator-auth";
      return;
    }

    const updatePayload = isPublished
      ? {
          status: "paused",
          paused_by: "creator",
          pause_reason: null,
          updated_at:
            new Date().toISOString(),
        }
      : {
          status: "published",
          paused_by: null,
          pause_reason: null,
          updated_at:
            new Date().toISOString(),
        };

    let query = supabase
      .from("experiences")
      .update(updatePayload)
      .eq("id", experience.id)
      .eq("creator_id", creator.id)
      .eq("status", experience.status)
      .is("moderated_at", null);

    if (!isPublished) {
      query = query.or(
        "paused_by.is.null,paused_by.eq.creator",
      );
    }

    const { data, error } = await query
      .select(
        "id, status, paused_by, moderated_at",
      )
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        "Bu Experience'ın durumu değişmiş veya moderasyon tarafından kilitlenmiş olabilir. Sayfayı yenileyip tekrar dene.",
      );
    }

    window.location.reload();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Experience durumu değiştirilemedi.";

    console.error(
      "Experience durumu değiştirilemedi:",
      error,
    );

    window.alert(message);
  } finally {
    setStatusLoading(false);
  }
}
  function openSharePanel() {
    if (
      experience.status !== "published"
    ) {
      window.alert(
        "Bu Experience şu anda paylaşmaya açık değil. Önce yeniden yayınla.",
      );
      return;
    }

    setPanel(
      panel === "share"
        ? "actions"
        : "share",
    );
  }

  async function copyExperienceLink() {
    try {
      await navigator.clipboard.writeText(
        experienceUrl,
      );

      setLinkCopied(true);

      window.setTimeout(() => {
        setLinkCopied(false);
      }, 1800);
    } catch {
      window.prompt(
        "Linki kopyala:",
        experienceUrl,
      );
    }
  }

  function getShareText() {
    const total =
      experience.stats.totalCompletions;

    const participantText =
      total === 1
        ? "1 kişi çözdü."
        : `${total} kişi çözdü.`;

    return experience.type === "compatibility"
      ? `${participantText} Şu an en yüksek uyum %${experience.stats.highestScore}. Daha yükseğini yapabilir misin?`
      : experience.type === "guess"
        ? `${participantText} “${experience.title}” — doğru cevabı bulabilecek misin? 👀`
        : experience.type === "story"
          ? `${participantText} “${experience.title}” içeriğini tamamladı. Sen de bak 👀`
          : experience.testMode === "spectrum"
            ? `${participantText} “${experience.title}” sonucunu merak ediyor musun? Seninki kaç çıkacak?`
            : experience.testMode === "archetype"
              ? `${participantText} “${experience.title}” — sen hangi sonuç çıkacaksın?`
              : `${participantText} “${experience.title}” testinde en yüksek skor %${experience.stats.highestScore}. Beni geçebilir misin? 👀`;
  }

  function shareOnWhatsApp() {
    const shareUrl = new URL(
      "https://wa.me/",
    );

    shareUrl.searchParams.set(
      "text",
      `${getShareText()}\n${experienceUrl}`,
    );

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnTelegram() {
    const shareUrl = new URL(
      "https://t.me/share/url",
    );

    shareUrl.searchParams.set(
      "url",
      experienceUrl,
    );

    shareUrl.searchParams.set(
      "text",
      getShareText(),
    );

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  const qrImageUrl =
    experience.status === "published"
      ? `https://quickchart.io/qr?size=220&margin=2&text=${encodeURIComponent(
          experienceUrl,
        )}`
      : "";

  function shareOnX() {
    const shareUrl = new URL(
      "https://twitter.com/intent/tweet",
    );

    shareUrl.searchParams.set(
      "text",
      getShareText(),
    );

    shareUrl.searchParams.set(
      "url",
      experienceUrl,
    );

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      className={
        compact
          ? "bg-white"
          : "rounded-[18px] border border-border bg-white p-4 shadow-[0_10px_30px_rgba(22,12,34,0.035)]"
      }
    >
      {!compact && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-foreground text-[10px] font-black text-background">
                {getExperienceInitials(
                  experience.title,
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[7px] font-black uppercase tracking-[0.09em] text-primary">
                  {formatExperienceType(
                    experience.type,
                    experience.testMode,
                  )}
                </p>

                <h2 className="mt-1 text-sm font-black leading-5 sm:text-base">
                  {experience.title}
                </h2>
              </div>
            </div>

            <StatusBadge
              status={experience.status}
              pausedBy={experience.paused_by}
              moderatedAt={experience.moderated_at}
            />
          </div>

          {experience.description && (
            <p className="mt-3 line-clamp-3 text-[9px] leading-4 text-muted-foreground">
              {experience.description}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <DetailMetric
              label="Görüntüleme"
              value={`${experience.stats.totalViews}`}
            />

            <DetailMetric
              label="Başlatma"
              value={`${experience.stats.totalStarts}`}
            />

            <DetailMetric
              label="Tamamlama"
              value={`${experience.stats.totalCompletions}`}
            />
            <DetailMetric
              label="Kazanç"
              value={formatMoney(
                experience.revenue.totalAmountMinor,
                experience.revenue.currency,
              )}
            />
          </div>
        </>
      )}

      {(experience.paused_by === "moderation" ||
        experience.moderated_at) && (
        <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[9px] font-black text-red-700">
            Bu Experience AQRYO moderasyonu tarafından durduruldu.
          </p>

          <p className="mt-1 text-[8px] leading-4 text-red-600">
            Yeniden yayınlama işlemi creator tarafından yapılamaz.
            {experience.pause_reason
              ? ` Neden: ${experience.pause_reason}`
              : ""}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-2 border-t border-border pt-3 sm:grid-cols-5">
        <a
          href={experienceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-black text-foreground transition hover:border-primary hover:text-primary"
        >
          Gör ↗
        </a>

        <button
          type="button"
          disabled={editLoading}
          onClick={editExperience}
          className="flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-black text-foreground transition enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-wait disabled:opacity-60"
        >
          {editLoading
            ? "İçerik açılıyor..."
            : "İçeriği düzenle"}
        </button>

        <button
          type="button"
          onClick={openParticipants}
          className={`flex h-10 items-center justify-center rounded-full border px-4 text-[9px] font-black transition ${
            panel === "participants"
              ? "border-primary bg-primary text-white"
              : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {panel === "participants"
            ? "Katılımcıları kapat"
            : "Katılımcılar"}
        </button>

        {(
          experience.status === "published" ||
          experience.status === "paused"
        ) && (
          <button
            type="button"
            disabled={
              statusLoading ||
              experience.paused_by === "moderation" ||
              Boolean(experience.moderated_at)
            }
            onClick={toggleExperienceStatus}
            className={`flex h-10 items-center justify-center rounded-full border px-4 text-[9px] font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
              experience.paused_by === "moderation" ||
              experience.moderated_at
                ? "border-red-200 bg-red-50 text-red-700"
                : experience.status === "published"
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
            }`}
          >
            {statusLoading
              ? "Güncelleniyor..."
              : experience.paused_by === "moderation" ||
                  experience.moderated_at
                ? "Moderasyon kilidi"
                : experience.status === "published"
                  ? "Pasife al"
                  : "Yeniden yayınla"}
          </button>
        )}

        <button
          type="button"
          disabled={
            experience.status !== "published"
          }
          onClick={openSharePanel}
          className={`flex h-10 items-center justify-center rounded-full px-4 text-[9px] font-black transition disabled:cursor-not-allowed disabled:opacity-35 ${
            panel === "share"
              ? "bg-primary text-white"
              : "bg-black text-white hover:bg-primary"
          }`}
        >
          {panel === "share"
            ? "Paylaşımı kapat"
            : "Paylaş"}
        </button>
      </div>

      {panel === "share" && (
        <div className="mt-3 rounded-[18px] border border-primary/15 bg-white p-4">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.09em] text-primary">
                Paylaş
              </p>

              <h3 className="mt-2 text-[16px] font-black tracking-[-0.03em]">
                Experience’ını dışarı taşı.
              </h3>

              <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                Linki kopyala veya doğrudan sosyal kanallarda paylaş.
              </p>

              <div className="mt-4 flex min-w-0 items-center gap-2 rounded-[14px] border border-border bg-[#fafafa] p-2">
                <input
                  type="text"
                  readOnly
                  value={experienceUrl}
                  className="h-9 min-w-0 flex-1 bg-transparent px-2 text-[9px] font-semibold outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    void copyExperienceLink();
                  }}
                  className="h-9 shrink-0 rounded-full bg-black px-4 text-[8px] font-black text-white transition hover:bg-primary"
                >
                  {linkCopied
                    ? "Kopyalandı ✓"
                    : "Linki kopyala"}
                </button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={shareOnX}
                  className="flex h-10 items-center justify-center rounded-full bg-black px-4 text-[9px] font-black text-white transition hover:bg-primary"
                >
                  X’te paylaş
                </button>

                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 text-[9px] font-black text-emerald-700 transition hover:border-emerald-300"
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={shareOnTelegram}
                  className="flex h-10 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 text-[9px] font-black text-sky-700 transition hover:border-sky-300"
                >
                  Telegram
                </button>
              </div>
            </div>

            <div className="rounded-[16px] border border-border bg-[#fafafa] p-4 text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-muted-foreground">
                QR kod
              </p>

              <div className="mx-auto mt-3 flex h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-[12px] bg-white p-2">
                <img
                  src={qrImageUrl}
                  alt="Experience QR kodu"
                  className="h-full w-full object-contain"
                />
              </div>

              <p className="mt-3 text-[8px] leading-4 text-muted-foreground">
                Fiziksel ortamda veya başka bir görselin üzerinde kullan.
              </p>

              <a
                href={qrImageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[8px] font-black transition hover:border-primary hover:text-primary"
              >
                QR’ı aç ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {panel === "participants" && (
        <div className="mt-3 rounded-[16px] border border-border bg-[#fafafa] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black">
                Katılımcılar
              </p>

              <p className="mt-1 text-[8px] text-muted-foreground">
                En yeni tamamlamalar önce gösterilir.
              </p>
            </div>

            {!participantsLoading &&
              !participantsError && (
                <span className="rounded-full bg-white px-3 py-1 text-[8px] font-black text-primary">
                  {participants.length}
                </span>
              )}
          </div>

          {participantsLoading && (
            <p className="py-8 text-center text-[9px] font-bold text-muted-foreground">
              Katılımcılar yükleniyor...
            </p>
          )}

          {!participantsLoading &&
            participantsError && (
              <div className="mt-3 rounded-[13px] border border-red-200 bg-red-50 p-3">
                <p className="text-[9px] font-bold text-red-700">
                  {participantsError}
                </p>
              </div>
            )}

          {!participantsLoading &&
            !participantsError &&
            participants.length === 0 && (
              <p className="py-8 text-center text-[9px] font-bold text-muted-foreground">
                Henüz tamamlayan yok.
              </p>
            )}

          {!participantsLoading &&
            !participantsError &&
            participants.length > 0 && (
              <div className="mt-3 grid gap-2">
                {participants.map(
                  (participant) => {
                    const open =
                      openParticipantKey ===
                      participant.participant_key;

                    return (
                      <article
                        key={`${participant.participant_key}-${participant.completed_at}`}
                        className="overflow-hidden rounded-[14px] border border-border bg-white"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenParticipantKey(
                              open
                                ? null
                                : participant.participant_key,
                            )
                          }
                          className="grid w-full grid-cols-[minmax(0,1fr)_70px_100px_24px] items-center gap-2 px-3 py-3 text-left"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-black">
                              Anonim #
                              {participant.participant_key
                                .slice(0, 6)
                                .toUpperCase()}
                            </p>

                            <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                              {participant.result_key ??
                                "Sonuç"}
                            </p>
                          </div>

                          <p className="text-sm font-black">
                            {experience.type ===
                            "story"
                              ? "Tamamlandı"
                              : experience.type ===
                                  "guess"
                                ? "Doğru"
                                : experience.testMode ===
                                    "archetype"
                                  ? "Sonuç"
                                  : `%${participant.score}`}
                          </p>

                          <p className="text-right text-[8px] font-bold text-muted-foreground">
                            {formatFullDate(
                              participant.completed_at,
                            )}
                          </p>

                          <span
                            className={`text-xs font-black transition ${
                              open
                                ? "rotate-180 text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            ⌄
                          </span>
                        </button>

                        {open && (
                          <div className="border-t border-border bg-[#fafafa] p-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.07em] text-primary">
                              Verilen cevaplar
                            </p>

                            {participant.answers.length ===
                            0 ? (
                              <p className="mt-2 rounded-[11px] border border-border bg-white px-3 py-3 text-[9px] font-semibold text-muted-foreground">
                                {experience.type ===
                                "story"
                                  ? "Bu Experience soru-cevap verisi üretmiyor."
                                  : experience.type ===
                                      "guess"
                                    ? "Tahmin tamamlandı. Serbest cevap metni bu kayıtta saklanmıyor."
                                    : "Bu tamamlamada cevap detayı yok."}
                              </p>
                            ) : (
                            <div className="mt-2 grid gap-2">
                              {participant.answers.map(
                                (
                                  answer,
                                  answerIndex,
                                ) => {
                                  const question =
                                    participantQuestions[
                                      answerIndex
                                    ];

                                  const answerText =
                                    question?.options?.[
                                      answer
                                    ];

                                  return (
                                    <div
                                      key={`${participant.participant_key}-${answerIndex}`}
                                      className="rounded-[11px] border border-border bg-white px-3 py-3"
                                    >
                                      <p className="text-[7px] font-black uppercase tracking-[0.06em] text-muted-foreground">
                                        Soru{" "}
                                        {answerIndex +
                                          1}
                                      </p>

                                      <p className="mt-1.5 text-[10px] font-black leading-4 text-foreground">
                                        {question?.text ??
                                          `Soru ${answerIndex + 1}`}
                                      </p>

                                      <div className="mt-2 rounded-[9px] bg-primary/[0.055] px-3 py-2">
                                        <p className="text-[7px] font-black uppercase tracking-[0.06em] text-primary">
                                          Katılımcının cevabı
                                        </p>

                                        <p className="mt-1 text-[10px] font-bold leading-4">
                                          {answerText ??
                                            `Seçenek ${String.fromCharCode(
                                              65 + answer,
                                            )}`}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  },
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function isJsonObject(
  value: unknown,
): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="flex min-w-0 flex-col items-center justify-center rounded-[13px] border border-border bg-white px-1 py-3 text-center shadow-[0_5px_16px_rgba(22,12,34,0.025)] sm:min-h-[72px] sm:px-3">
      <p className="w-full truncate text-[6px] font-black uppercase tracking-[0.04em] text-muted-foreground sm:text-[7px]">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-black tracking-[-0.04em] sm:text-xl">
        {value}
      </p>
    </article>
  );
}
function StatusBadge({
  status,
  pausedBy,
  moderatedAt,
}: {
  status: string;
  pausedBy?: string | null;
  moderatedAt?: string | null;
}) {
  const moderationLocked =
    pausedBy === "moderation" ||
    Boolean(moderatedAt);

  const label = moderationLocked
    ? "Moderasyon"
    : status === "published"
      ? "Aktif"
      : status === "paused"
        ? "Pasif"
        : status === "archived"
          ? "Arşiv"
          : "Taslak";

  const className = moderationLocked
    ? "bg-red-50 text-red-700"
    : status === "published"
      ? "bg-emerald-50 text-emerald-700"
      : status === "paused"
        ? "bg-amber-50 text-amber-700"
        : status === "archived"
          ? "bg-slate-100 text-slate-600"
          : "bg-muted text-muted-foreground";

  return (
    <span
      className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[7px] font-black ${className}`}
    >
      {label}
    </span>
  );
}
function MobileMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[11px] border border-border bg-white px-2 py-2 text-center">
      <p className="text-[6px] font-black uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xs font-black">
        {value}
      </p>
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[11px] border border-border bg-[#fafafa] px-2 py-2.5 text-center">
      <p className="text-[6px] font-black uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}

function EmptyExperiences() {
  return (
    <div className="p-10 text-center sm:p-14">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-lg">
        ✦
      </div>

      <h2 className="mt-4 text-lg font-black">
        Henüz Experience yok
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-muted-foreground">
        İlk Experience’ını
        yayınladığında burada
        görünecek.
      </p>

      <Link
        to="/creator-studio"
        className="mx-auto mt-4 flex h-10 w-full max-w-[210px] items-center justify-center rounded-full bg-black text-[10px] font-black text-white transition hover:bg-primary"
      >
        Yeni Experience
      </Link>
    </div>
  );
}

function calculateOverallAverage(
  experiences: CreatorExperience[],
) {
  const totalCompletions =
    experiences.reduce(
      (total, experience) =>
        total +
        experience.stats
          .totalCompletions,
      0,
    );

  if (totalCompletions === 0) {
    return 0;
  }

  const weightedTotal =
    experiences.reduce(
      (total, experience) =>
        total +
        experience.stats.averageScore *
          experience.stats
            .totalCompletions,
      0,
    );

  return Math.round(
    weightedTotal / totalCompletions,
  );
}

function getExperienceDate(
  experience: CreatorExperience,
) {
  const date = new Date(
    experience.published_at ??
      experience.created_at,
  );

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

function getExperienceInitials(
  title: string,
) {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "EX";
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
}

function getTestModeFromContent(
  value: unknown,
): CreatorTestMode {
  if (!isJsonObject(value)) {
    return null;
  }

  if (
    value.testMode === "score" ||
    value.testMode === "spectrum" ||
    value.testMode === "archetype"
  ) {
    return value.testMode;
  }

  if (value.testMode === "profile") {
    return "archetype";
  }

  if (
    isJsonObject(
      value.blueprint,
    ) &&
    isJsonObject(
      value.blueprint.test,
    )
  ) {
    const strategy =
      value.blueprint.test.strategy;

    if (
      strategy === "score" ||
      strategy === "spectrum" ||
      strategy === "archetype"
    ) {
      return strategy;
    }
  }

  return null;
}

function formatExperienceType(
  type: string,
  testMode: CreatorTestMode = null,
) {
  const normalized = type
    .toLocaleLowerCase("tr-TR")
    .replace(/[-_]/g, " ")
    .trim();

  if (normalized === "test") {
    if (testMode === "spectrum") {
      return "Ne kadar X’sin?";
    }

    if (testMode === "archetype") {
      return "Hangi X’sin?";
    }

    return "Doğru cevap / Skor";
  }

  const labels: Record<string, string> = {
    compatibility:
      "Bana ne kadar yakınsın?",
    guess: "Tahmin et / Bu nedir?",
    story: "Story / İçerik",
    stories: "Story / İçerik",
    content: "Story / İçerik",
    recommendation: "Öneri",
    recommendations: "Öneri",
    decision: "Görüş & Karar",
    opinion: "Görüş & Karar",
    guided: "Yönlendirmeli",
  };

  return labels[normalized] ?? normalized;
}

function normalizeMinorAmount(
  value: unknown,
) {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numeric)
    ? Math.max(
        0,
        Math.round(numeric),
      )
    : 0;
}

function formatMoney(
  amountMinor: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "tr-TR",
      {
        style: "currency",
        currency:
          currency || "TRY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    ).format(
      amountMinor / 100,
    );
  } catch {
    return `${(
      amountMinor / 100
    ).toFixed(2)} ${
      currency || "TRY"
    }`;
  }
}

function formatShortDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatFullDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Bilinmiyor";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function formatCompactNumber(
  value: number,
) {
  if (value >= 1_000_000) {
    const formatted =
      value / 1_000_000;

    return `${formatCompactDecimal(
      formatted,
    )}M`;
  }

  if (value >= 1_000) {
    const formatted =
      value / 1_000;

    return `${formatCompactDecimal(
      formatted,
    )}K`;
  }

  return value.toString();
}

function formatCompactDecimal(
  value: number,
) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}