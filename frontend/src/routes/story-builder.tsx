import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import {
  uploadExperienceImage,
} from "@/services/media";
import {
  savePublishedExperience,
} from "@/services/experiences";
import { supabase } from "@/services/supabase";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/story-builder",
)({
  component: StoryBuilderPage,
});

type StoryTextItem = {
  id: string;
  type: "text";
  text: string;
};

type StoryImageItem = {
  id: string;
  type: "image";
  imageUrl: string;
};

type StoryItem =
  | StoryTextItem
  | StoryImageItem;

type CropTarget =
  | {
      kind: "cover";
    }
  | {
      kind: "free";
      itemId: string;
    }
  | {
      kind: "premium";
      itemId: string;
    };

type CropDraft = {
  file: File;
  previewUrl: string;
  target: CropTarget;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type BuilderPanel =
  | "content"
  | "result"
  | "offer"
  | "preview";

const BUILDER_STEPS: BuilderPanel[] = [
  "content",
  "result",
  "offer",
  "preview",
];

type StoryBuilderState = {
  sourceExperienceId: string | null;
  title: string;
  description: string;
  coverImageUrl: string;
  items: StoryItem[];
  premiumItems: StoryItem[];
  resultTitle: string;
  resultDescription: string;
  offerEnabled: boolean;
  offerTitle: string;
  offerDescription: string;
  offerPrice: number;
};

const STANDARD_OFFER_PRICE = 9;
const STORAGE_KEY =
  "aqry-story-builder";

const DEFAULT_STATE: StoryBuilderState = {
  sourceExperienceId: null,
  title: "",
  description: "",
  coverImageUrl: "",
  items: [
    {
      id: crypto.randomUUID(),
      type: "text",
      text: "",
    },
  ],
  premiumItems: [
    {
      id: crypto.randomUUID(),
      type: "text",
      text: "",
    },
  ],
  resultTitle: "Sonuna geldin.",
  resultDescription:
    "İçeriği tamamladın.",
  offerEnabled: false,
  offerTitle:
    "Devamını gör",
  offerDescription:
    "Ekstra içeriği aç.",
  offerPrice: STANDARD_OFFER_PRICE,
};

function StoryBuilderPage() {
  const [loading, setLoading] =
    useState(true);

  const [creatorId, setCreatorId] =
    useState<string | null>(null);

  const [uploadingId, setUploadingId] =
    useState<string | null>(null);

  const [publishing, setPublishing] =
    useState(false);

  const [cropDraft, setCropDraft] =
    useState<CropDraft | null>(
      null,
    );

  const [state, setState] =
    useState<StoryBuilderState>(
      DEFAULT_STATE,
    );

  const [activePanel, setActivePanel] =
    useState<BuilderPanel>("content");

  const [maxVisitedStep, setMaxVisitedStep] =
    useState(0);

  const [guide, setGuide] = useState<{
    title: string;
    description: string;
    next: BuilderPanel;
  } | null>(null);

  const [previewStage, setPreviewStage] =
    useState<"entry" | "items" | "result" | "offer">("entry");

  const [previewItemIndex, setPreviewItemIndex] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const creator =
        await getCurrentCreator();

      if (!creator) {
        window.location.href =
          "/creator-auth";
        return;
      }

      if (!cancelled) {
        setCreatorId(creator.id);
      }

      const stored =
        window.sessionStorage.getItem(
          STORAGE_KEY,
        );

      if (stored) {
        try {
          const parsed =
            JSON.parse(
              stored,
            ) as Partial<StoryBuilderState>;

          if (!cancelled) {
            const legacy =
              parsed as Partial<StoryBuilderState> & {
                cards?: Array<{
                  id?: string;
                  text?: string;
                  imageUrl?: string;
                }>;
                blocks?: Array<{
                  id?: string;
                  type?: "text" | "image";
                  text?: string;
                  imageUrl?: string;
                  caption?: string;
                }>;
              };

            const restoredItems =
              Array.isArray(
                parsed.items,
              ) &&
              parsed.items.length > 0
                ? parsed.items
                : Array.isArray(
                      legacy.cards,
                    ) &&
                    legacy.cards.length > 0
                  ? legacy.cards.flatMap(
                      (card) => {
                        const migrated: StoryItem[] =
                          [];

                        if (
                          card.text?.trim()
                        ) {
                          migrated.push({
                            id:
                              card.id ??
                              crypto.randomUUID(),
                            type: "text",
                            text:
                              card.text,
                          });
                        }

                        if (
                          card.imageUrl?.trim()
                        ) {
                          migrated.push({
                            id:
                              crypto.randomUUID(),
                            type: "image",
                            imageUrl:
                              card.imageUrl,
                          });
                        }

                        return migrated;
                      },
                    )
                  : Array.isArray(
                        legacy.blocks,
                      ) &&
                      legacy.blocks.length >
                        0
                    ? legacy.blocks.map(
                        (block) =>
                          block.type ===
                          "image"
                            ? {
                                id:
                                  block.id ??
                                  crypto.randomUUID(),
                                type:
                                  "image" as const,
                                imageUrl:
                                  block.imageUrl ??
                                  "",
                              }
                            : {
                                id:
                                  block.id ??
                                  crypto.randomUUID(),
                                type:
                                  "text" as const,
                                text:
                                  block.text ??
                                  block.caption ??
                                  "",
                              },
                      )
                    : DEFAULT_STATE.items;

            setState({
              ...DEFAULT_STATE,
              ...parsed,
              items:
                restoredItems.length >
                0
                  ? restoredItems
                  : DEFAULT_STATE.items,
              premiumItems:
                Array.isArray(
                  parsed.premiumItems,
                ) &&
                parsed.premiumItems.length >
                  0
                  ? parsed.premiumItems
                  : DEFAULT_STATE.premiumItems,
              offerPrice:
                STANDARD_OFFER_PRICE,
            });
          }
        } catch {
          window.sessionStorage.removeItem(
            STORAGE_KEY,
          );
        }
      }

      const storedAfterRestore =
        window.sessionStorage.getItem(
          STORAGE_KEY,
        );

      if (storedAfterRestore) {
        try {
          const parsed =
            JSON.parse(
              storedAfterRestore,
            ) as Partial<StoryBuilderState>;

          const sourceId =
            typeof parsed.sourceExperienceId ===
              "string"
              ? parsed.sourceExperienceId
              : null;

          if (sourceId) {
            const {
              data:
                premiumData,
              error:
                premiumError,
            } = await supabase
              .from(
                "experience_story_premium",
              )
              .select("items")
              .eq(
                "experience_id",
                sourceId,
              )
              .eq(
                "creator_id",
                creator.id,
              )
              .maybeSingle();

            if (premiumError) {
              console.error(
                "Premium Story akışı yüklenemedi:",
                premiumError,
              );
            } else if (
              Array.isArray(
                premiumData?.items,
              ) &&
              premiumData.items
                .length > 0 &&
              !cancelled
            ) {
              setState(
                (current) => ({
                  ...current,
                  premiumItems:
                    premiumData.items as StoryItem[],
                }),
              );
            }
          }
        } catch {
          // Ana builder state zaten güvenli biçimde işlendi.
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        offerPrice:
          STANDARD_OFFER_PRICE,
      }),
    );
  }, [loading, state]);

  const canContinue = useMemo(
    () =>
      state.title.trim().length > 0 &&
      state.items.some(
        (item) =>
          item.type === "text"
            ? item.text.trim().length > 0
            : item.imageUrl.trim().length > 0,
      ),
    [state],
  );

  const activeStepIndex = BUILDER_STEPS.indexOf(activePanel);

  const cleanFreeItems = state.items.filter((item) =>
    item.type === "text"
      ? item.text.trim().length > 0
      : item.imageUrl.trim().length > 0,
  );

  function openStep(step: BuilderPanel) {
    const index = BUILDER_STEPS.indexOf(step);
    if (index > maxVisitedStep) {
      return;
    }
    setActivePanel(step);
    if (step === "preview") {
      setPreviewStage("entry");
      setPreviewItemIndex(0);
    }
  }

  function moveToStep(step: BuilderPanel) {
    const index = BUILDER_STEPS.indexOf(step);
    setMaxVisitedStep((current) => Math.max(current, index));
    setActivePanel(step);
    if (step === "preview") {
      setPreviewStage("entry");
      setPreviewItemIndex(0);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (activePanel === "content") {
      if (!canContinue) {
        window.alert("Başlık ve en az bir metin ya da görsel eklemelisin.");
        return;
      }
      setGuide({
        title: "Şimdi finali hazırlayalım",
        description:
          "Story tamamlandığında kullanıcı ücretsiz bir final görecek. Bu bölüm hikâyenin doğal sonu olmalı ve tek başına anlamlı olmalı.",
        next: "result",
      });
      return;
    }

    if (activePanel === "result") {
      if (!state.resultTitle.trim() || !state.resultDescription.trim()) {
        window.alert("Sonuç başlığı ve açıklamasını doldurmalısın.");
        return;
      }
      setGuide({
        title: "Bu içerikten ekstra gelir ister misin?",
        description:
          "İstersen Story bittikten sonra ücretli bir devam ekleyebilirsin. Doğal bir ek değer yoksa bu adımı geçebilirsin.",
        next: "offer",
      });
      return;
    }

    if (activePanel === "offer") {
      if (state.offerEnabled) {
        const premiumReady = state.premiumItems.some((item) =>
          item.type === "text"
            ? item.text.trim().length > 0
            : item.imageUrl.trim().length > 0,
        );
        if (!state.offerTitle.trim() || !state.offerDescription.trim() || !premiumReady) {
          window.alert("Offer açıksa başlık, açıklama ve en az bir premium içerik eklemelisin.");
          return;
        }
      }
      moveToStep("preview");
    }
  }

  function goBack() {
    const index = BUILDER_STEPS.indexOf(activePanel);
    if (index <= 0) {
      return;
    }
    setActivePanel(BUILDER_STEPS[index - 1]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previewNext() {
    if (previewStage === "entry") {
      setPreviewStage(cleanFreeItems.length > 0 ? "items" : "result");
      return;
    }

    if (previewStage === "items") {
      if (previewItemIndex < cleanFreeItems.length - 1) {
        setPreviewItemIndex((current) => current + 1);
      } else {
        setPreviewStage("result");
      }
      return;
    }

    if (previewStage === "result" && state.offerEnabled) {
      setPreviewStage("offer");
    }
  }

  async function publishStory() {
    if (
      !creatorId ||
      !canContinue ||
      publishing
    ) {
      return;
    }

    const cleanItems =
      state.items
        .map((item) =>
          item.type === "text"
            ? {
                ...item,
                text:
                  item.text.trim(),
              }
            : {
                ...item,
                imageUrl:
                  item.imageUrl.trim(),
              },
        )
        .filter((item) =>
          item.type === "text"
            ? item.text.length > 0
            : item.imageUrl.length > 0,
        );

    if (cleanItems.length === 0) {
      window.alert(
        "En az bir metin veya görsel eklemelisin.",
      );
      return;
    }

    const cleanPremiumItems =
      state.premiumItems
        .map((item) =>
          item.type === "text"
            ? {
                ...item,
                text:
                  item.text.trim(),
              }
            : {
                ...item,
                imageUrl:
                  item.imageUrl.trim(),
              },
        )
        .filter((item) =>
          item.type === "text"
            ? item.text.length > 0
            : item.imageUrl.length > 0,
        );

    if (
      state.offerEnabled &&
      cleanPremiumItems.length === 0
    ) {
      window.alert(
        "Ücretli devam açıksa en az bir premium metin veya görsel eklemelisin.",
      );
      return;
    }

    try {
      setPublishing(true);

      const experienceId =
        crypto.randomUUID();

      await savePublishedExperience({
        id: experienceId,
        creatorId,
        type: "story",
        status: "published",
        publishedAt:
          new Date().toISOString(),
        title: state.title.trim(),
        description:
          state.description.trim(),
        cover: {
          style: "purple",
          label: "Story / İçerik",
          imageUrl:
            state.coverImageUrl.trim(),
        },
        questions: [],
        results: [
          {
            id: "completed",
            title:
              state.resultTitle.trim() ||
              "Sonuna geldin.",
            description:
              state.resultDescription.trim() ||
              "İçeriği tamamladın.",
          },
        ],
        offer: {
          enabled:
            state.offerEnabled,
          title:
            state.offerTitle.trim(),
          description:
            state.offerDescription.trim(),
          price:
            STANDARD_OFFER_PRICE,
        },
        story: {
          items: cleanItems,
          resultTitle:
            state.resultTitle.trim() ||
            "Sonuna geldin.",
          resultDescription:
            state.resultDescription.trim() ||
            "İçeriği tamamladın.",
        },
      });

      if (state.offerEnabled) {
        const {
          error:
            premiumSaveError,
        } = await supabase
          .from(
            "experience_story_premium",
          )
          .upsert(
            {
              experience_id:
                experienceId,
              creator_id:
                creatorId,
              items:
                cleanPremiumItems,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "experience_id",
            },
          );

        if (
          premiumSaveError
        ) {
          throw new Error(
            `Ücretli devam kaydedilemedi: ${premiumSaveError.message}`,
          );
        }
      } else {
        const {
          error:
            premiumDeleteError,
        } = await supabase
          .from(
            "experience_story_premium",
          )
          .delete()
          .eq(
            "experience_id",
            experienceId,
          )
          .eq(
            "creator_id",
            creatorId,
          );

        if (
          premiumDeleteError
        ) {
          throw new Error(
            `Eski ücretli devam temizlenemedi: ${premiumDeleteError.message}`,
          );
        }
      }

      window.sessionStorage.removeItem(
        STORAGE_KEY,
      );

      window.location.href =
        `/publish-success/${experienceId}`;
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Experience yayınlanamadı.",
      );
    } finally {
      setPublishing(false);
    }
  }

  function addTextItem(
    premium = false,
  ) {
    const item: StoryTextItem = {
      id: crypto.randomUUID(),
      type: "text",
      text: "",
    };

    setState((current) => ({
      ...current,
      ...(premium
        ? {
            premiumItems: [
              ...current.premiumItems,
              item,
            ],
          }
        : {
            items: [
              ...current.items,
              item,
            ],
          }),
    }));
  }

  function addImageItem(
    premium = false,
  ) {
    const item: StoryImageItem = {
      id: crypto.randomUUID(),
      type: "image",
      imageUrl: "",
    };

    setState((current) => ({
      ...current,
      ...(premium
        ? {
            premiumItems: [
              ...current.premiumItems,
              item,
            ],
          }
        : {
            items: [
              ...current.items,
              item,
            ],
          }),
    }));
  }

  function removeItem(
    id: string,
    premium = false,
  ) {
    setState((current) => {
      const source =
        premium
          ? current.premiumItems
          : current.items;

      const next =
        source.length > 1
          ? source.filter(
              (item) =>
                item.id !== id,
            )
          : source;

      return {
        ...current,
        ...(premium
          ? {
              premiumItems:
                next,
            }
          : {
              items: next,
            }),
      };
    });
  }

  function moveItem(
    id: string,
    direction: -1 | 1,
    premium = false,
  ) {
    setState((current) => {
      const source = [
        ...(premium
          ? current.premiumItems
          : current.items),
      ];

      const index =
        source.findIndex(
          (item) =>
            item.id === id,
        );

      const target =
        index + direction;

      if (
        index < 0 ||
        target < 0 ||
        target >=
          source.length
      ) {
        return current;
      }

      const [item] =
        source.splice(
          index,
          1,
        );

      source.splice(
        target,
        0,
        item,
      );

      return {
        ...current,
        ...(premium
          ? {
              premiumItems:
                source,
            }
          : {
              items: source,
            }),
      };
    });
  }

  function updateTextItem(
    id: string,
    value: string,
    premium = false,
  ) {
    setState((current) => ({
      ...current,
      ...(premium
        ? {
            premiumItems:
              current.premiumItems.map(
                (item) =>
                  item.id === id &&
                  item.type ===
                    "text"
                    ? {
                        ...item,
                        text:
                          value,
                      }
                    : item,
              ),
          }
        : {
            items:
              current.items.map(
                (item) =>
                  item.id === id &&
                  item.type ===
                    "text"
                    ? {
                        ...item,
                        text:
                          value,
                      }
                    : item,
              ),
          }),
    }));
  }

  function updateImageItem(
    id: string,
    imageUrl: string,
    premium = false,
  ) {
    setState((current) => ({
      ...current,
      ...(premium
        ? {
            premiumItems:
              current.premiumItems.map(
                (item) =>
                  item.id === id &&
                  item.type ===
                    "image"
                    ? {
                        ...item,
                        imageUrl,
                      }
                    : item,
              ),
          }
        : {
            items:
              current.items.map(
                (item) =>
                  item.id === id &&
                  item.type ===
                    "image"
                    ? {
                        ...item,
                        imageUrl,
                      }
                    : item,
              ),
          }),
    }));
  }

  function beginCrop(
    file: File,
    target: CropTarget,
  ) {
    if (
      ![
        "image/jpeg",
        "image/png",
      ].includes(file.type)
    ) {
      window.alert(
        "Yalnızca JPG ve PNG görseller yükleyebilirsin.",
      );
      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      window.alert(
        "Görsel en fazla 8 MB olabilir.",
      );
      return;
    }

    setCropDraft({
      file,
      previewUrl:
        URL.createObjectURL(
          file,
        ),
      target,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  }

  function closeCrop() {
    if (cropDraft) {
      URL.revokeObjectURL(
        cropDraft.previewUrl,
      );
    }

    setCropDraft(null);
  }

  async function uploadFinalImage(
    file: File,
    target: CropTarget,
  ) {
    if (!creatorId) {
      return;
    }

    try {
      setUploadingId(
        target.kind === "cover"
          ? "cover"
          : `${target.kind}:${target.itemId}`,
      );

      const uploaded =
        await uploadExperienceImage(
          creatorId,
          file,
        );

      if (
        target.kind ===
        "cover"
      ) {
        setState(
          (current) => ({
            ...current,
            coverImageUrl:
              uploaded.publicUrl,
          }),
        );
      } else {
        updateImageItem(
          target.itemId,
          uploaded.publicUrl,
          target.kind ===
            "premium",
        );
      }
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Görsel yüklenemedi.",
      );
    } finally {
      setUploadingId(null);
    }
  }

  async function useOriginalCropFile() {
    if (!cropDraft) {
      return;
    }

    const {
      file,
      target,
    } = cropDraft;

    closeCrop();

    await uploadFinalImage(
      file,
      target,
    );
  }

  async function cropAndUpload() {
    if (!cropDraft) {
      return;
    }

    const image =
      new Image();

    image.src =
      cropDraft.previewUrl;

    await new Promise<void>(
      (resolve, reject) => {
        image.onload = () =>
          resolve();

        image.onerror = () =>
          reject(
            new Error(
              "Görsel okunamadı.",
            ),
          );
      },
    );

    const outputSize = 1200;
    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width =
      outputSize;
    canvas.height =
      outputSize;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Görsel işlenemedi.",
      );
    }

    const baseScale =
      Math.max(
        outputSize /
          image.naturalWidth,
        outputSize /
          image.naturalHeight,
      );

    const scale =
      baseScale *
      cropDraft.zoom;

    const width =
      image.naturalWidth *
      scale;

    const height =
      image.naturalHeight *
      scale;

    const maxShiftX =
      Math.max(
        0,
        (width -
          outputSize) /
          2,
      );

    const maxShiftY =
      Math.max(
        0,
        (height -
          outputSize) /
          2,
      );

    const x =
      (outputSize -
        width) /
        2 +
      cropDraft.offsetX *
        maxShiftX;

    const y =
      (outputSize -
        height) /
        2 +
      cropDraft.offsetY *
        maxShiftY;

    context.fillStyle =
      "#ffffff";

    context.fillRect(
      0,
      0,
      outputSize,
      outputSize,
    );

    context.drawImage(
      image,
      x,
      y,
      width,
      height,
    );

    const blob =
      await new Promise<Blob>(
        (resolve, reject) => {
          canvas.toBlob(
            (value) =>
              value
                ? resolve(
                    value,
                  )
                : reject(
                    new Error(
                      "Görsel kırpılamadı.",
                    ),
                  ),
            "image/jpeg",
            0.92,
          );
        },
      );

    const cropped =
      new File(
        [blob],
        `aqry-crop-${Date.now()}.jpg`,
        {
          type:
            "image/jpeg",
        },
      );

    const target =
      cropDraft.target;

    closeCrop();

    await uploadFinalImage(
      cropped,
      target,
    );
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbfbfd]">
        <CreatorNavigation
          onSignOut={async () => {
            await signOutCreator();
            window.location.href =
              "/creator-auth";
          }}
        />

        <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
          <div className="rounded-[26px] border border-border bg-white p-10 text-center">
            <p className="text-sm font-bold text-muted-foreground">
              Builder hazırlanıyor...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <header className="sticky top-16 z-30 border-b border-border/80 bg-[#fbfbfd]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-teal-600">
              {state.sourceExperienceId ? "Yeni sürüm oluşturuluyor" : "Story / İçerik"}
            </p>
            <p className="truncate text-[11px] font-bold">{state.title || "Yeni Story"}</p>
          </div>
          <button
            type="button"
            onClick={() => { window.location.href = "/creator-studio"; }}
            className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold text-muted-foreground"
          >
            Studio’ya dön
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[210px_minmax(0,1fr)_360px]">
        <aside className="sticky top-[122px] z-20 border-b border-border bg-[#fbfbfd]/95 px-3 py-3 backdrop-blur-xl lg:h-[calc(100vh-122px)] lg:self-start lg:border-b-0 lg:border-r lg:bg-white/60 lg:py-5">
          <p className="mb-3 hidden px-3 text-[8px] font-black uppercase tracking-[0.16em] text-muted-foreground lg:block">
            Oluşturma akışı
          </p>
          <nav className="grid grid-cols-4 gap-1.5 lg:grid-cols-1">
            {BUILDER_STEPS.map((step, index) => (
              <button
                key={step}
                type="button"
                disabled={index > maxVisitedStep}
                onClick={() => openStep(step)}
                className={`flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-left text-[9px] font-black transition ${
                  activePanel === step
                    ? "bg-black text-white"
                    : index <= maxVisitedStep
                      ? "bg-white text-foreground hover:bg-teal-50"
                      : "cursor-not-allowed bg-transparent text-muted-foreground/35"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/20 text-[8px]">
                  {index < activeStepIndex ? "✓" : index + 1}
                </span>
                <span>
                  {step === "content" ? "İçerik" : step === "result" ? "Sonuç" : step === "offer" ? "Kazanç" : "Önizleme"}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-7">
          {state.sourceExperienceId ? (
            <div className="mb-5 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-bold text-amber-800">
              Yayındaki Experience değişmeyecek. Düzenlemelerin yeni bir sürüm olarak yayınlanacak.
            </div>
          ) : null}

          {activePanel === "content" ? (
            <div className="space-y-5">
              <BuilderSection eyebrow="1 · İçerik" title="Story’ni oluştur" description="Başlığı, kapağı ve ziyaretçinin sırayla göreceği metin/görselleri hazırla.">
                <FieldLabel>Başlık</FieldLabel>
                <input
                  value={state.title}
                  onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-[16px] border border-border bg-background px-4 text-[13px] font-bold outline-none focus:border-teal-300"
                  placeholder="Örn. Dün başıma öyle bir şey geldi ki..."
                />

                <FieldLabel className="mt-5">Kısa açıklama</FieldLabel>
                <textarea
                  rows={3}
                  value={state.description}
                  onChange={(event) => setState((current) => ({ ...current, description: event.target.value }))}
                  className="mt-2 w-full resize-none rounded-[16px] border border-border bg-background px-4 py-3 text-[13px] font-semibold leading-6 outline-none focus:border-teal-300"
                  placeholder="Kullanıcının neden devam etmesi gerektiğini anlat."
                />

                <FieldLabel className="mt-5">Kapak görseli</FieldLabel>
                <label className="mt-2 flex min-h-[88px] cursor-pointer items-center justify-between gap-4 rounded-[18px] border border-dashed border-teal-200 bg-teal-50/40 p-4">
                  <div>
                    <p className="text-[12px] font-black">{uploadingId === "cover" ? "Yükleniyor..." : state.coverImageUrl ? "Kapak görselini değiştir" : "Kapak görseli yükle"}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">JPG veya PNG · en fazla 8 MB</p>
                  </div>
                  <span className="text-[18px] font-black text-teal-600">↑</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    disabled={uploadingId !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) beginCrop(file, { kind: "cover" });
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </BuilderSection>

              <BuilderSection eyebrow="2 · Akış" title="Metin ve görselleri sırala" description="Her öğe ziyaretçide ayrı bir ekran olur.">
                <div className="space-y-3">
                  {state.items.map((item, index) => (
                    <div key={item.id} className="rounded-[20px] border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-teal-600">{index + 1}. {item.type === "text" ? "Metin" : "Görsel"}</p>
                        <div className="flex items-center gap-1">
                          <SmallButton disabled={index === 0} onClick={() => moveItem(item.id, -1)}>↑</SmallButton>
                          <SmallButton disabled={index === state.items.length - 1} onClick={() => moveItem(item.id, 1)}>↓</SmallButton>
                          <SmallButton disabled={state.items.length === 1} onClick={() => removeItem(item.id)}>×</SmallButton>
                        </div>
                      </div>
                      {item.type === "text" ? (
                        <textarea
                          rows={5}
                          value={item.text}
                          onChange={(event) => updateTextItem(item.id, event.target.value)}
                          className="mt-3 w-full resize-y rounded-[14px] border border-border bg-white px-4 py-3 text-[13px] font-semibold leading-6 outline-none focus:border-teal-300"
                          placeholder="Bu ekranda gösterilecek metni yaz..."
                        />
                      ) : (
                        <div className="mt-3">
                          {item.imageUrl ? <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-[16px] border border-border bg-[#f3f3f5] p-3"><img src={item.imageUrl} alt="" className="max-h-[360px] max-w-full object-contain" /></div> : null}
                          <label className="mt-2 flex h-11 cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-teal-200 bg-white text-[10px] font-black text-teal-700">
                            {uploadingId === `free:${item.id}` ? "Yükleniyor..." : item.imageUrl ? "Görseli değiştir / kırp" : "+ Görsel yükle"}
                            <input type="file" accept="image/jpeg,image/png" className="hidden" disabled={uploadingId !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) beginCrop(file, { kind: "free", itemId: item.id }); event.currentTarget.value = ""; }} />
                          </label>
                          {item.imageUrl ? <button type="button" onClick={() => updateImageItem(item.id, "")} className="mt-2 text-[9px] font-black text-muted-foreground hover:text-red-600">Görseli kaldır</button> : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => addTextItem(false)} className="h-11 rounded-[14px] border border-border bg-white text-[10px] font-black">+ Metin</button>
                  <button type="button" onClick={() => addImageItem(false)} className="h-11 rounded-[14px] border border-border bg-white text-[10px] font-black">+ Görsel</button>
                </div>
              </BuilderSection>
            </div>
          ) : null}

          {activePanel === "result" ? (
            <BuilderSection eyebrow="3 · Sonuç" title="Story’nin ücretsiz finali" description="Kullanıcı ana içeriği tamamladığında karşılığını burada almalı.">
              <FieldLabel>Başlık</FieldLabel>
              <input value={state.resultTitle} onChange={(event) => setState((current) => ({ ...current, resultTitle: event.target.value }))} className="mt-2 h-12 w-full rounded-[16px] border border-border bg-background px-4 text-[13px] font-bold outline-none focus:border-teal-300" />
              <FieldLabel className="mt-5">Açıklama</FieldLabel>
              <textarea rows={4} value={state.resultDescription} onChange={(event) => setState((current) => ({ ...current, resultDescription: event.target.value }))} className="mt-2 w-full resize-none rounded-[16px] border border-border bg-background px-4 py-3 text-[13px] font-semibold leading-6 outline-none focus:border-teal-300" />
            </BuilderSection>
          ) : null}

          {activePanel === "offer" ? (
            <BuilderSection eyebrow="4 · Kazanç" title="Ücretli devam eklemek ister misin?" description="Doğal bir devam, bonus bölüm veya ekstra içerik varsa ekle. Yoksa kapalı bırak ve devam et.">
              <label className="flex items-center justify-between gap-4 rounded-[16px] border border-border bg-background p-4">
                <div><p className="text-[12px] font-black">Offer oluştur</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">Ücretsiz Story → Result → ödeme → premium devam.</p></div>
                <input type="checkbox" checked={state.offerEnabled} onChange={(event) => setState((current) => ({ ...current, offerEnabled: event.target.checked }))} className="h-5 w-5" />
              </label>

              {state.offerEnabled ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 rounded-[18px] border border-border bg-background p-4">
                    <input value={state.offerTitle} onChange={(event) => setState((current) => ({ ...current, offerTitle: event.target.value }))} className="h-11 rounded-[14px] border border-border bg-white px-4 text-[12px] font-bold outline-none" placeholder="Örn. Hikâyenin devamını gör" />
                    <textarea rows={2} value={state.offerDescription} onChange={(event) => setState((current) => ({ ...current, offerDescription: event.target.value }))} className="resize-none rounded-[14px] border border-border bg-white px-4 py-3 text-[12px] font-semibold leading-5 outline-none" placeholder="Örn. Sonrasında ne olduğunu gör." />
                    <div className="rounded-[14px] border border-teal-100 bg-teal-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black">
                            AQRYO standart Offer fiyatı
                          </p>
                          <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                            Fiyat tüm standart Offer’larda otomatik belirlenir.
                          </p>
                        </div>
                        <span className="shrink-0 text-[18px] font-black text-teal-700">
                          {STANDARD_OFFER_PRICE} TL
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {state.premiumItems.map((item, index) => (
                      <div key={item.id} className="rounded-[20px] border border-amber-200 bg-amber-50/35 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">Premium {index + 1}. {item.type === "text" ? "Metin" : "Görsel"}</p>
                          <div className="flex items-center gap-1"><SmallButton disabled={index === 0} onClick={() => moveItem(item.id, -1, true)}>↑</SmallButton><SmallButton disabled={index === state.premiumItems.length - 1} onClick={() => moveItem(item.id, 1, true)}>↓</SmallButton><SmallButton disabled={state.premiumItems.length === 1} onClick={() => removeItem(item.id, true)}>×</SmallButton></div>
                        </div>
                        {item.type === "text" ? (
                          <textarea rows={4} value={item.text} onChange={(event) => updateTextItem(item.id, event.target.value, true)} className="mt-3 w-full resize-y rounded-[14px] border border-border bg-white px-4 py-3 text-[13px] font-semibold leading-6 outline-none" placeholder="Ödeme sonrası gösterilecek metin..." />
                        ) : (
                          <div className="mt-3">
                            {item.imageUrl ? <div className="flex min-h-[180px] items-center justify-center rounded-[16px] border border-amber-200 bg-white p-3"><img src={item.imageUrl} alt="" className="max-h-[360px] max-w-full object-contain" /></div> : null}
                            <label className="mt-2 flex h-11 cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-amber-300 bg-white text-[10px] font-black text-amber-700">{uploadingId === `premium:${item.id}` ? "Yükleniyor..." : item.imageUrl ? "Görseli değiştir / kırp" : "+ Görsel yükle"}<input type="file" accept="image/jpeg,image/png" className="hidden" disabled={uploadingId !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) beginCrop(file, { kind: "premium", itemId: item.id }); event.currentTarget.value = ""; }} /></label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => addTextItem(true)} className="h-11 rounded-[14px] border border-amber-200 bg-white text-[10px] font-black text-amber-700">+ Premium metin</button><button type="button" onClick={() => addImageItem(true)} className="h-11 rounded-[14px] border border-amber-200 bg-white text-[10px] font-black text-amber-700">+ Premium görsel</button></div>
                </div>
              ) : null}
            </BuilderSection>
          ) : null}

          {activePanel === "preview" ? (
            <BuilderSection eyebrow="5 · Önizleme" title="Yayınlamadan önce bir kez yaşa" description="Story’yi ziyaretçi gibi baştan sona kontrol et. İstersen testi atlayıp doğrudan yayınlayabilirsin.">
              <div className="rounded-[18px] border border-border bg-background p-4">
                <p className="text-[12px] font-black">Hazırsan sağdaki önizlemeden başlat.</p>
                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">Akış, Result ve varsa Offer ekranını sırayla göreceksin.</p>
              </div>
            </BuilderSection>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-5">
            <button type="button" disabled={activeStepIndex === 0} onClick={goBack} className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-black disabled:opacity-25">← Geri</button>
            {activePanel !== "preview" ? (
              <button type="button" onClick={goNext} className="h-11 rounded-full bg-black px-7 text-[10px] font-black text-white hover:bg-teal-600">Sonraki →</button>
            ) : (
              <button type="button" disabled={!canContinue || publishing} onClick={() => void publishStory()} className="h-11 rounded-full bg-black px-7 text-[10px] font-black text-white enabled:hover:bg-teal-600 disabled:opacity-25">{publishing ? "Yayınlanıyor..." : state.sourceExperienceId ? "Yeni sürümü yayınla" : "Yayınla"}</button>
            )}
          </div>
        </section>

        <aside className="border-t border-border px-4 py-6 lg:sticky lg:top-[122px] lg:h-[calc(100vh-122px)] lg:self-start lg:overflow-y-auto lg:border-l lg:border-t-0 sm:px-6">
          <p className="mb-3 text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground">{activePanel === "preview" ? "Gerçek deneyim" : "Canlı önizleme"}</p>
          <div className="overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_18px_55px_rgba(22,12,34,0.06)]">
            {activePanel === "preview" ? (
              <div className="p-5">
                {previewStage === "entry" ? (
                  <div>
                    {state.coverImageUrl ? <img src={state.coverImageUrl} alt="" className="h-52 w-full rounded-[20px] object-cover" /> : <div className="h-52 rounded-[20px] bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500" />}
                    <h2 className="mt-5 text-[26px] font-black tracking-[-0.05em]">{state.title || "Story başlığı"}</h2>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{state.description}</p>
                    <button type="button" onClick={previewNext} className="mt-5 h-11 w-full rounded-full bg-black text-[10px] font-black text-white">Başla →</button>
                  </div>
                ) : previewStage === "items" ? (
                  <div>
                    <p className="text-[9px] font-black text-teal-600">{previewItemIndex + 1}/{cleanFreeItems.length}</p>
                    {cleanFreeItems[previewItemIndex]?.type === "text" ? <p className="mt-5 whitespace-pre-wrap text-[16px] font-semibold leading-7">{cleanFreeItems[previewItemIndex].text}</p> : cleanFreeItems[previewItemIndex]?.type === "image" ? <div className="mt-5 flex min-h-[280px] items-center justify-center rounded-[18px] bg-[#f3f3f5] p-3"><img src={cleanFreeItems[previewItemIndex].imageUrl} alt="" className="max-h-[420px] max-w-full object-contain" /></div> : null}
                    <div className="mt-5 flex items-center justify-between"><button type="button" onClick={() => { if (previewItemIndex > 0) setPreviewItemIndex((v) => v - 1); else setPreviewStage("entry"); }} className="h-10 rounded-full border border-border px-4 text-[9px] font-black">←</button><button type="button" onClick={previewNext} className="h-10 rounded-full bg-black px-5 text-[9px] font-black text-white">Devam →</button></div>
                  </div>
                ) : previewStage === "result" ? (
                  <div className="py-3 text-center"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-teal-600">Result</p><h2 className="mt-3 text-[27px] font-black tracking-[-0.05em]">{state.resultTitle}</h2><p className="mt-3 text-[11px] leading-6 text-muted-foreground">{state.resultDescription}</p>{state.offerEnabled ? <button type="button" onClick={previewNext} className="mt-5 h-11 w-full rounded-full bg-black text-[10px] font-black text-white">Offer’ı gör →</button> : <button type="button" onClick={() => { setPreviewStage("entry"); setPreviewItemIndex(0); }} className="mt-5 h-11 w-full rounded-full border border-border text-[10px] font-black">Baştan dene</button>}</div>
                ) : (
                  <div className="py-3 text-center"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-600">Premium devam</p><h2 className="mt-3 text-[25px] font-black tracking-[-0.05em]">{state.offerTitle}</h2><p className="mt-3 text-[11px] leading-6 text-muted-foreground">{state.offerDescription}</p><div className="mt-4 rounded-[16px] bg-amber-50 p-4 text-[16px] font-black">{STANDARD_OFFER_PRICE} TL</div><button type="button" onClick={() => { setPreviewStage("entry"); setPreviewItemIndex(0); }} className="mt-5 h-11 w-full rounded-full border border-border text-[10px] font-black">Baştan dene</button></div>
                )}
              </div>
            ) : (
              <>
                <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500">
                  {state.coverImageUrl ? <img src={state.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-6 text-white"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/75">AQRYO Story</p><h2 className="mt-2 text-[28px] font-black leading-[0.98] tracking-[-0.05em]">{state.title || "İçerik başlığı"}</h2>{state.description ? <p className="mt-3 text-[11px] leading-5 text-white/75">{state.description}</p> : null}</div>
                </div>
                <div className="max-h-[420px] space-y-4 overflow-y-auto p-5">{state.items.map((item, index) => <div key={item.id} className="rounded-[16px] border border-border bg-[#fafafa] p-3"><p className="text-[8px] font-black uppercase tracking-[0.08em] text-teal-600">{index + 1}. {item.type === "text" ? "Metin" : "Görsel"}</p>{item.type === "image" && item.imageUrl ? <div className="mt-2 flex min-h-[120px] items-center justify-center rounded-[12px] bg-[#efeff2] p-2"><img src={item.imageUrl} alt="" className="max-h-[220px] max-w-full object-contain" /></div> : null}{item.type === "text" && item.text ? <p className="mt-2 whitespace-pre-wrap text-left text-[11px] font-semibold leading-5 text-foreground/80">{item.text}</p> : null}</div>)}</div>
              </>
            )}
          </div>
        </aside>
      </div>

      {guide ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[430px] rounded-[26px] bg-white p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-teal-600">AQRYO</p>
            <h2 className="mt-3 text-[24px] font-black tracking-[-0.045em]">{guide.title}</h2>
            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">{guide.description}</p>
            <button type="button" onClick={() => { const next = guide.next; setGuide(null); moveToStep(next); }} className="mt-5 h-11 w-full rounded-full bg-black text-[10px] font-black text-white">Tamam, devam et →</button>
          </div>
        </div>
      ) : null}

      {cropDraft ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[620px] rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-teal-600">Görsel kadrajı</p><h2 className="mt-2 text-[22px] font-black tracking-[-0.04em]">Kırp veya orijinali kullan</h2></div><button type="button" onClick={closeCrop} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-black">×</button></div>
            <div className="mt-5 flex aspect-square items-center justify-center overflow-hidden rounded-[22px] bg-[#ededf0]"><img src={cropDraft.previewUrl} alt="" className="h-full w-full object-cover" style={{ transform: `translate(${cropDraft.offsetX * 18}%, ${cropDraft.offsetY * 18}%) scale(${cropDraft.zoom})` }} /></div>
            <div className="mt-5 grid gap-4">
              <label><div className="flex items-center justify-between text-[10px] font-black"><span>Yakınlaştır</span><span>{cropDraft.zoom.toFixed(1)}×</span></div><input type="range" min="1" max="2.5" step="0.1" value={cropDraft.zoom} onChange={(event) => setCropDraft((current) => current ? { ...current, zoom: Number(event.target.value) } : null)} className="mt-2 w-full" /></label>
              <div className="grid gap-3 sm:grid-cols-2"><label><p className="text-[10px] font-black">Sağa / sola</p><input type="range" min="-1" max="1" step="0.05" value={cropDraft.offsetX} onChange={(event) => setCropDraft((current) => current ? { ...current, offsetX: Number(event.target.value) } : null)} className="mt-2 w-full" /></label><label><p className="text-[10px] font-black">Yukarı / aşağı</p><input type="range" min="-1" max="1" step="0.05" value={cropDraft.offsetY} onChange={(event) => setCropDraft((current) => current ? { ...current, offsetY: Number(event.target.value) } : null)} className="mt-2 w-full" /></label></div>
              <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => void useOriginalCropFile()} className="h-11 rounded-full border border-border bg-white text-[10px] font-black">Kırpmadan kullan</button><button type="button" onClick={() => void cropAndUpload()} className="h-11 rounded-full bg-black text-[10px] font-black text-white">Kırp ve kaydet</button></div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );

}

function BuilderSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-border bg-white p-5 shadow-[0_12px_35px_rgba(22,12,34,0.035)] sm:p-6">
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-teal-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em]">
        {title}
      </h2>

      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
        {description}
      </p>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function FieldLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] font-black ${className}`}
    >
      {children}
    </p>
  );
}

function SmallButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[11px] font-black transition enabled:hover:border-teal-200 enabled:hover:text-teal-700 disabled:opacity-25"
    >
      {children}
    </button>
  );
}