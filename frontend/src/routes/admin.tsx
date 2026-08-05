import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createFileRoute,
} from "@tanstack/react-router";
import {
  AdminShell,
  type AdminSection,
} from "@/components/admin/AdminShell";
import {
  getAdminCreators,
  getAdminDashboardSummary,
  getAdminExperienceReports,
  getAdminExperiences,
  getAdminOrders,
  getAdminPayouts,
  getAdminHomepageFeaturedSlots,
  getAdminSiteAnnouncements,
  createAdminSiteAnnouncement,
  setAdminHomepageFeaturedSlot,
  setAdminSiteAnnouncementActive,
  isCurrentUserAdmin,
  updateAdminExperienceReport,
  type AdminCreatorRow,
  type AdminDashboardSummary,
  type AdminExperienceReport,
  type AdminExperienceRow,
  type AdminOrderRow,
  type AdminPayoutRow,
  type AdminReportStatus,
  type AdminHomepageFeaturedSlot,
  type AdminSiteAnnouncement,
  type SiteAnnouncementDisplayMode,
} from "@/services/admin";
import {
  signOutCreator,
} from "@/services/auth";
import { ModerationActionDialog } from "@/components/moderation/ModerationActionDialog";

export const Route =
  createFileRoute("/admin")({
    component: AdminPage,
  });

type LoadState =
  | "checking"
  | "denied"
  | "ready"
  | "error";

type ModerationDialogState =
  | {
      mode: "pause" | "release";
      experienceId: string;
      experienceTitle: string;
      reportId?: string;
    }
  | null;

function formatMinor(
  amountMinor: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "tr-TR",
      {
        style: "currency",
        currency,
      },
    ).format(
      amountMinor / 100,
    );
  } catch {
    return `${(
      amountMinor / 100
    ).toFixed(2)} ${currency}`;
  }
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function AdminPage() {
  const [
    loadState,
    setLoadState,
  ] =
    useState<LoadState>(
      "checking",
    );

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<AdminSection>(
      "overview",
    );

  const [summary, setSummary] =
    useState<AdminDashboardSummary | null>(
      null,
    );

  const [reports, setReports] =
    useState<AdminExperienceReport[]>([]);
  const [experiences, setExperiences] =
    useState<AdminExperienceRow[]>([]);
  const [orders, setOrders] =
    useState<AdminOrderRow[]>([]);
  const [payouts, setPayouts] =
    useState<AdminPayoutRow[]>([]);
  const [creators, setCreators] =
    useState<AdminCreatorRow[]>([]);
  const [
    homepageSlots,
    setHomepageSlots,
  ] = useState<AdminHomepageFeaturedSlot[]>([]);
  const [
    announcements,
    setAnnouncements,
  ] = useState<AdminSiteAnnouncement[]>([]);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [
    moderationDialog,
    setModerationDialog,
  ] = useState<ModerationDialogState>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadState("checking");

        const isAdmin =
          await isCurrentUserAdmin();

        if (cancelled) {
          return;
        }

        if (!isAdmin) {
          setLoadState("denied");
          return;
        }

        const [
          summaryData,
          reportData,
          experienceData,
          orderData,
          payoutData,
          creatorData,
          homepageSlotData,
          announcementData,
        ] = await Promise.all([
          getAdminDashboardSummary(),
          getAdminExperienceReports(),
          getAdminExperiences(),
          getAdminOrders(),
          getAdminPayouts(),
          getAdminCreators(),
          getAdminHomepageFeaturedSlots(),
          getAdminSiteAnnouncements(),
        ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryData);
        setReports(reportData);
        setExperiences(
          experienceData,
        );
        setOrders(orderData);
        setPayouts(payoutData);
        setCreators(creatorData);
        setHomepageSlots(
          homepageSlotData,
        );
        setAnnouncements(
          announcementData,
        );
        setLoadState("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Admin paneli yüklenemedi.",
        );
        setLoadState("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const openReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.status === "new" ||
          report.status ===
            "reviewing",
      ),
    [reports],
  );

  async function refreshModerationData() {
    try {
      setErrorMessage(null);

      const [
        reportData,
        experienceData,
        summaryData,
      ] = await Promise.all([
        getAdminExperienceReports(),
        getAdminExperiences(),
        getAdminDashboardSummary(),
      ]);

      setReports(reportData);
      setExperiences(experienceData);
      setSummary(summaryData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Moderasyon verileri yenilenemedi.",
      );
    }
  }

  async function handleReportStatus(
    reportId: string,
    status: AdminReportStatus,
  ) {
    try {
      setErrorMessage(null);

      await updateAdminExperienceReport(
        reportId,
        status,
      );

      setReports(
        (current) =>
          current.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status,
                }
              : report,
          ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Report güncellenemedi.",
      );
    }
  }

  async function handleHomepageSlotChange(
    slot: number,
    experienceId: string | null,
  ) {
    try {
      setErrorMessage(null);

      await setAdminHomepageFeaturedSlot(
        slot,
        experienceId,
      );

      const nextSlots =
        await getAdminHomepageFeaturedSlots();

      setHomepageSlots(nextSlots);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ana sayfa güncellenemedi.",
      );
    }
  }

  async function handleCreateAnnouncement(input: {
    title: string;
    message: string;
    startsAt: string;
    endsAt: string;
    displayMode: SiteAnnouncementDisplayMode;
    buttonText?: string;
    buttonUrl?: string;
  }) {
    try {
      setErrorMessage(null);

      await createAdminSiteAnnouncement(
        input,
      );

      const nextAnnouncements =
        await getAdminSiteAnnouncements();

      setAnnouncements(
        nextAnnouncements,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Duyuru oluşturulamadı.",
      );

      throw error;
    }
  }

  async function handleAnnouncementActive(
    announcementId: string,
    isActive: boolean,
  ) {
    try {
      setErrorMessage(null);

      await setAdminSiteAnnouncementActive(
        announcementId,
        isActive,
      );

      setAnnouncements(
        (current) =>
          current.map(
            (announcement) =>
              announcement.id ===
              announcementId
                ? {
                    ...announcement,
                    isActive,
                  }
                : announcement,
          ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Duyuru güncellenemedi.",
      );
    }
  }

  if (
    loadState === "checking"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f9] text-[12px] font-black">
        Admin erişimi kontrol ediliyor...
      </div>
    );
  }

  if (
    loadState === "denied"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-5">
        <div className="max-w-md rounded-[26px] border border-border bg-white p-7 text-center">
          <h1 className="text-[26px] font-black tracking-[-0.04em]">
            Erişim yok
          </h1>

          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Bu hesap AQRYO admin paneline yetkili değil.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/";
            }}
            className="mt-5 rounded-full bg-black px-6 py-3 text-[10px] font-black text-white"
          >
            Ana sayfaya dön
          </button>
        </div>
      </div>
    );
  }

  if (
    loadState === "error"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-5">
        <div className="max-w-md rounded-[26px] border border-red-200 bg-white p-7">
          <p className="text-[12px] font-black text-red-700">
            {errorMessage ??
              "Admin paneli yüklenemedi."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminShell
      activeSection={
        activeSection
      }
      onSectionChange={
        setActiveSection
      }
      onSignOut={async () => {
        await signOutCreator();
        window.location.href =
          "/admin-login";
      }}
    >
      {errorMessage ? (
        <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {activeSection ===
      "overview" ? (
        <Overview
          summary={summary}
          openReports={
            openReports.length
          }
        />
      ) : null}

      {activeSection ===
      "reports" ? (
        <ReportsTable
          reports={reports}
          experiences={experiences}
          onStatusChange={
            handleReportStatus
          }
          onModerate={(report) =>
            setModerationDialog({
              mode: "pause",
              experienceId:
                report.experienceId,
              experienceTitle:
                report.experienceTitle,
              reportId: report.id,
            })
          }
          onRelease={(report) =>
            setModerationDialog({
              mode: "release",
              experienceId:
                report.experienceId,
              experienceTitle:
                report.experienceTitle,
            })
          }
        />
      ) : null}

      {activeSection ===
      "experiences" ? (
        <ExperiencesTable
          experiences={
            experiences
          }
          onModerate={(experience) =>
            setModerationDialog({
              mode: "pause",
              experienceId:
                experience.id,
              experienceTitle:
                experience.title,
            })
          }
          onRelease={(experience) =>
            setModerationDialog({
              mode: "release",
              experienceId:
                experience.id,
              experienceTitle:
                experience.title,
            })
          }
        />
      ) : null}

      {activeSection ===
      "orders" ? (
        <OrdersTable
          orders={orders}
        />
      ) : null}

      {activeSection ===
      "payouts" ? (
        <PayoutsTable
          payouts={payouts}
        />
      ) : null}

      {activeSection ===
      "creators" ? (
        <CreatorsTable
          creators={creators}
        />
      ) : null}

      {activeSection ===
      "homepage" ? (
        <HomepageManagement
          slots={homepageSlots}
          experiences={experiences}
          onSlotChange={
            handleHomepageSlotChange
          }
        />
      ) : null}

      {activeSection ===
      "announcements" ? (
        <AnnouncementsManagement
          announcements={
            announcements
          }
          onCreate={
            handleCreateAnnouncement
          }
          onActiveChange={
            handleAnnouncementActive
          }
        />
      ) : null}

      {moderationDialog ? (
        <ModerationActionDialog
          open
          mode={
            moderationDialog.mode
          }
          experienceId={
            moderationDialog.experienceId
          }
          experienceTitle={
            moderationDialog.experienceTitle
          }
          reportId={
            moderationDialog.reportId
          }
          onClose={() =>
            setModerationDialog(null)
          }
          onCompleted={() => {
            void refreshModerationData();
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function Overview({
  summary,
  openReports,
}: {
  summary:
    | AdminDashboardSummary
    | null;
  openReports: number;
}) {
  const cards = [
    [
      "Creator",
      summary?.creators ?? 0,
    ],
    [
      "Experience",
      summary?.experiences ?? 0,
    ],
    [
      "Yayında",
      summary?.publishedExperiences ??
        0,
    ],
    [
      "Açık report",
      openReports,
    ],
    [
      "Paid order",
      summary?.paidOrders ?? 0,
    ],
    [
      "TRY brüt",
      formatMinor(
        summary?.grossPaidMinor ??
          0,
        "TRY",
      ),
    ],
    [
      "Bekleyen payout",
      summary?.pendingPayouts ??
        0,
    ],
  ];

  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Operasyon özeti
      </h1>

      <p className="mt-2 text-[10px] text-muted-foreground">
        AQRYO sistem sağlığı ve operasyonel kuyruk.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ([label, value]) => (
            <div
              key={String(label)}
              className="rounded-[20px] border border-border bg-white p-5"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.07em] text-muted-foreground">
                {label}
              </p>

              <p className="mt-2 text-[25px] font-black tracking-[-0.04em]">
                {value}
              </p>
            </div>
          ),
        )}
      </div>
    </>
  );
}

function ReportsTable({
  reports,
  experiences,
  onStatusChange,
  onModerate,
  onRelease,
}: {
  reports: AdminExperienceReport[];
  experiences: AdminExperienceRow[];
  onStatusChange: (
    id: string,
    status: AdminReportStatus,
  ) => void;
  onModerate: (
    report: AdminExperienceReport,
  ) => void;
  onRelease: (
    report: AdminExperienceReport,
  ) => void;
}) {
  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Reportlar
      </h1>

      <div className="mt-5 space-y-3">
        {reports.length === 0 ? (
          <Empty text="Report yok." />
        ) : (
          reports.map((report) => {
            const experience =
              experiences.find(
                (item) =>
                  item.id ===
                  report.experienceId,
              );

            const moderationLocked =
              experience?.pausedBy ===
                "moderation" ||
              Boolean(
                experience?.moderatedAt,
              );

            return (
              <article
                key={report.id}
                className="rounded-[20px] border border-border bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-black">
                        {
                          report.experienceTitle
                        }
                      </p>

                      {moderationLocked ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[7px] font-black text-red-700">
                          Moderasyonda
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {report.reason}
                      {" · "}
                      {formatDate(
                        report.createdAt,
                      )}
                    </p>

                    {report.details ? (
                      <p className="mt-3 max-w-2xl text-[10px] leading-5">
                        {report.details}
                      </p>
                    ) : null}

                    {report.resolutionNote ? (
                      <p className="mt-3 max-w-2xl rounded-[12px] bg-[#f7f7f9] px-3 py-2 text-[9px] leading-4 text-muted-foreground">
                        {
                          report.resolutionNote
                        }
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                    {moderationLocked ? (
                      <button
                        type="button"
                        onClick={() =>
                          onRelease(
                            report,
                          )
                        }
                        className="h-10 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-[9px] font-black text-emerald-700 transition hover:border-emerald-300"
                      >
                        Kilidi kaldır
                      </button>
                    ) : report.status !==
                      "dismissed" ? (
                      <button
                        type="button"
                        onClick={() =>
                          onModerate(
                            report,
                          )
                        }
                        className="h-10 rounded-full border border-red-200 bg-red-50 px-4 text-[9px] font-black text-red-700 transition hover:border-red-300"
                      >
                        Moderasyonla duraklat
                      </button>
                    ) : null}

                    <select
                      value={
                        report.status
                      }
                      onChange={(event) =>
                        onStatusChange(
                          report.id,
                          event.target
                            .value as AdminReportStatus,
                        )
                      }
                      className="h-10 rounded-[12px] border border-border bg-white px-3 text-[10px] font-black"
                    >
                      <option value="new">
                        Yeni
                      </option>
                      <option value="reviewing">
                        İnceleniyor
                      </option>
                      <option value="resolved">
                        Çözüldü
                      </option>
                      <option value="dismissed">
                        Kapatıldı
                      </option>
                    </select>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}

function ExperiencesTable({
  experiences,
  onModerate,
  onRelease,
}: {
  experiences: AdminExperienceRow[];
  onModerate: (
    experience: AdminExperienceRow,
  ) => void;
  onRelease: (
    experience: AdminExperienceRow,
  ) => void;
}) {
  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Experience
      </h1>

      <div className="mt-5 overflow-x-auto rounded-[20px] border border-border bg-white">
        <table className="min-w-full text-left">
          <thead className="border-b border-border bg-[#fafafa] text-[8px] uppercase tracking-[0.06em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                Başlık
              </th>
              <th className="px-4 py-3">
                Tür
              </th>
              <th className="px-4 py-3">
                Durum
              </th>
              <th className="px-4 py-3">
                Moderasyon
              </th>
              <th className="px-4 py-3">
                Oluşturuldu
              </th>
              <th className="px-4 py-3 text-right">
                İşlem
              </th>
            </tr>
          </thead>

          <tbody>
            {experiences.map(
              (item) => {
                const moderationLocked =
                  item.pausedBy ===
                    "moderation" ||
                  Boolean(
                    item.moderatedAt,
                  );

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-black">
                        {item.title}
                      </p>

                      {item.pauseReason &&
                      moderationLocked ? (
                        <p className="mt-1 max-w-[320px] truncate text-[8px] text-red-600">
                          {
                            item.pauseReason
                          }
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-[10px]">
                      {item.type}
                    </td>

                    <td className="px-4 py-3 text-[10px]">
                      {item.status}
                    </td>

                    <td className="px-4 py-3">
                      {moderationLocked ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[8px] font-black text-red-700">
                          Moderasyon
                        </span>
                      ) : item.pausedBy ===
                        "creator" ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-black text-amber-700">
                          Creator pause
                        </span>
                      ) : (
                        <span className="text-[8px] text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-[9px] text-muted-foreground">
                      {formatDate(
                        item.createdAt,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {moderationLocked ? (
                        <button
                          type="button"
                          onClick={() =>
                            onRelease(
                              item,
                            )
                          }
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[8px] font-black text-emerald-700"
                        >
                          Kilidi kaldır
                        </button>
                      ) : item.status ===
                          "published" ||
                        item.status ===
                          "paused" ? (
                        <button
                          type="button"
                          onClick={() =>
                            onModerate(
                              item,
                            )
                          }
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[8px] font-black text-red-700"
                        >
                          Moderasyonla duraklat
                        </button>
                      ) : (
                        <span className="text-[8px] text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OrdersTable({
  orders,
}: {
  orders: AdminOrderRow[];
}) {
  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Siparişler
      </h1>

      <div className="mt-5 space-y-2">
        {orders.length === 0 ? (
          <Empty text="Sipariş yok." />
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-[18px] border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-[10px] font-black">
                  {order.experienceTitle}
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  {order.id.slice(
                    0,
                    8,
                  )}
                  {" · "}
                  {formatDate(
                    order.createdAt,
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black">
                  {order.status}
                </span>

                <span className="text-[11px] font-black">
                  {formatMinor(
                    order.amountMinor,
                    order.currency,
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function PayoutsTable({
  payouts,
}: {
  payouts: AdminPayoutRow[];
}) {
  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Payout
      </h1>

      <div className="mt-5 space-y-2">
        {payouts.length === 0 ? (
          <Empty text="Payout yok." />
        ) : (
          payouts.map(
            (payout) => (
              <div
                key={payout.id}
                className="rounded-[18px] border border-border bg-white p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black">
                      {formatMinor(
                        payout.amountMinor,
                        payout.currency,
                      )}
                    </p>

                    <p className="mt-1 text-[8px] text-muted-foreground">
                      {
                        payout.creatorId
                      }
                      {" · "}
                      {formatDate(
                        payout.requestedAt,
                      )}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-[9px] font-black">
                    {payout.status}
                  </span>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </>
  );
}

function CreatorsTable({
  creators,
}: {
  creators: AdminCreatorRow[];
}) {
  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Creator’lar
      </h1>

      <div className="mt-5 space-y-2">
        {creators.length === 0 ? (
          <Empty text="Creator yok." />
        ) : (
          creators.map(
            (creator) => (
              <div
                key={creator.id}
                className="rounded-[18px] border border-border bg-white p-4"
              >
                <p className="text-[10px] font-black">
                  {creator.email ??
                    "E-posta yok"}
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  {creator.id}
                </p>

                <p className="mt-2 text-[8px] text-muted-foreground">
                  Kayıt:{" "}
                  {formatDate(
                    creator.createdAt,
                  )}
                  {" · "}
                  Son giriş:{" "}
                  {formatDate(
                    creator.lastSignInAt,
                  )}
                </p>
              </div>
            ),
          )
        )}
      </div>
    </>
  );
}


function HomepageManagement({
  slots,
  onSlotChange,
}: {
  slots: AdminHomepageFeaturedSlot[];
  experiences: AdminExperienceRow[];
  onSlotChange: (
    slot: number,
    experienceId: string | null,
  ) => void;
}) {
  const [inputs, setInputs] =
    useState<Record<number, string>>({});
  const [savingSlot, setSavingSlot] =
    useState<number | null>(null);
  const [
    localError,
    setLocalError,
  ] = useState<string | null>(null);

  function extractExperienceId(
    value: string,
  ) {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const uuidPattern =
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

    const match =
      trimmed.match(uuidPattern);

    return match?.[0] ?? null;
  }

  async function handleAdd(
    slot: number,
  ) {
    const experienceId =
      extractExperienceId(
        inputs[slot] ?? "",
      );

    if (!experienceId) {
      setLocalError(
        "Geçerli bir AQRYO Experience linki veya Experience ID gir.",
      );
      return;
    }

    try {
      setSavingSlot(slot);
      setLocalError(null);

      await Promise.resolve(
        onSlotChange(
          slot,
          experienceId,
        ),
      );

      setInputs((current) => ({
        ...current,
        [slot]: "",
      }));
    } finally {
      setSavingSlot(null);
    }
  }

  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Ana Sayfa
      </h1>

      <p className="mt-2 max-w-2xl text-[10px] leading-5 text-muted-foreground">
        Ana sayfadaki 6 örnek Experience slotunu yönet.
        Experience linkini yapıştırman yeterli.
      </p>

      {localError ? (
        <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold text-red-700">
          {localError}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {slots.map((slot) => (
          <div
            key={slot.slot}
            className="rounded-[20px] border border-border bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.07em] text-muted-foreground">
                  Slot {slot.slot}
                </p>

                <p className="mt-2 truncate text-[13px] font-black">
                  {slot.title ??
                    "Demo / boş slot"}
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  {slot.type ??
                    "Gerçek Experience seçilmedi"}
                </p>
              </div>

              {slot.experienceId ? (
                <button
                  type="button"
                  onClick={() =>
                    onSlotChange(
                      slot.slot,
                      null,
                    )
                  }
                  className="shrink-0 rounded-full border border-border px-3 py-2 text-[9px] font-black"
                >
                  Kaldır
                </button>
              ) : null}
            </div>

            {slot.experienceId ? (
              <div className="mt-4 rounded-[12px] bg-[#f7f7f9] px-3 py-2">
                <p className="break-all text-[8px] text-muted-foreground">
                  /experience/{slot.experienceId}
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={
                  inputs[slot.slot] ??
                  ""
                }
                onChange={(event) => {
                  setInputs(
                    (current) => ({
                      ...current,
                      [slot.slot]:
                        event.target.value,
                    }),
                  );
                  setLocalError(null);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();
                    void handleAdd(
                      slot.slot,
                    );
                  }
                }}
                placeholder="Experience linkini yapıştır"
                className="h-11 min-w-0 flex-1 rounded-[12px] border border-border px-3 text-[10px]"
              />

              <button
                type="button"
                disabled={
                  savingSlot ===
                  slot.slot
                }
                onClick={() =>
                  void handleAdd(
                    slot.slot,
                  )
                }
                className="h-11 shrink-0 rounded-full bg-black px-5 text-[9px] font-black text-white disabled:opacity-50"
              >
                {savingSlot ===
                slot.slot
                  ? "Ekleniyor..."
                  : slot.experienceId
                    ? "Değiştir"
                    : "Ekle"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AnnouncementsManagement({
  announcements,
  onCreate,
  onActiveChange,
}: {
  announcements: AdminSiteAnnouncement[];
  onCreate: (input: {
    title: string;
    message: string;
    startsAt: string;
    endsAt: string;
    displayMode: SiteAnnouncementDisplayMode;
    buttonText?: string;
    buttonUrl?: string;
  }) => Promise<void>;
  onActiveChange: (
    id: string,
    isActive: boolean,
  ) => void;
}) {
  const [title, setTitle] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [buttonText, setButtonText] =
    useState("");
  const [buttonUrl, setButtonUrl] =
    useState("");
  const [startsAt, setStartsAt] =
    useState("");
  const [endsAt, setEndsAt] =
    useState("");
  const [
    displayMode,
    setDisplayMode,
  ] =
    useState<SiteAnnouncementDisplayMode>(
      "once",
    );
  const [saving, setSaving] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      await onCreate({
        title,
        message,
        startsAt:
          new Date(
            startsAt,
          ).toISOString(),
        endsAt:
          new Date(
            endsAt,
          ).toISOString(),
        displayMode,
        buttonText,
        buttonUrl,
      });

      setTitle("");
      setMessage("");
      setButtonText("");
      setButtonUrl("");
      setStartsAt("");
      setEndsAt("");
      setDisplayMode("once");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="text-[28px] font-black tracking-[-0.045em]">
        Duyurular
      </h1>

      <p className="mt-2 text-[10px] text-muted-foreground">
        Ana sayfaya belirli bir tarih aralığında popup mesajı yayınla.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 rounded-[20px] border border-border bg-white p-5"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[9px] font-black">
              Başlık
            </span>
            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              required
              className="h-11 w-full rounded-[12px] border border-border px-3 text-[10px]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[9px] font-black">
              Gösterim
            </span>
            <select
              value={displayMode}
              onChange={(event) =>
                setDisplayMode(
                  event.target
                    .value as SiteAnnouncementDisplayMode,
                )
              }
              className="h-11 w-full rounded-[12px] border border-border bg-white px-3 text-[10px]"
            >
              <option value="once">
                Bir kez göster
              </option>
              <option value="every_visit">
                Her ziyarette göster
              </option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-[9px] font-black">
            Mesaj
          </span>
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            required
            rows={4}
            className="w-full resize-none rounded-[12px] border border-border p-3 text-[10px]"
          />
        </label>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[9px] font-black">
              Başlangıç
            </span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) =>
                setStartsAt(
                  event.target.value,
                )
              }
              required
              className="h-11 w-full rounded-[12px] border border-border px-3 text-[10px]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[9px] font-black">
              Bitiş
            </span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(event) =>
                setEndsAt(
                  event.target.value,
                )
              }
              required
              className="h-11 w-full rounded-[12px] border border-border px-3 text-[10px]"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[9px] font-black">
              Buton metni — opsiyonel
            </span>
            <input
              value={buttonText}
              onChange={(event) =>
                setButtonText(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-[12px] border border-border px-3 text-[10px]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[9px] font-black">
              Buton linki — opsiyonel
            </span>
            <input
              value={buttonUrl}
              onChange={(event) =>
                setButtonUrl(
                  event.target.value,
                )
              }
              placeholder="/create veya https://..."
              className="h-11 w-full rounded-[12px] border border-border px-3 text-[10px]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-full bg-black px-5 py-3 text-[9px] font-black text-white disabled:opacity-50"
        >
          {saving
            ? "Yayınlanıyor..."
            : "Duyuruyu yayınla"}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {announcements.length ===
        0 ? (
          <Empty text="Henüz duyuru yok." />
        ) : (
          announcements.map(
            (announcement) => (
              <article
                key={announcement.id}
                className="rounded-[20px] border border-border bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[12px] font-black">
                      {announcement.title}
                    </p>

                    <p className="mt-2 max-w-3xl text-[10px] leading-5 text-muted-foreground">
                      {announcement.message}
                    </p>

                    <p className="mt-3 text-[8px] text-muted-foreground">
                      {formatDate(
                        announcement.startsAt,
                      )}
                      {" → "}
                      {formatDate(
                        announcement.endsAt,
                      )}
                      {" · "}
                      {announcement.displayMode ===
                      "once"
                        ? "Bir kez"
                        : "Her ziyaret"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onActiveChange(
                        announcement.id,
                        !announcement.isActive,
                      )
                    }
                    className={`rounded-full px-4 py-2 text-[9px] font-black ${
                      announcement.isActive
                        ? "bg-black text-white"
                        : "border border-border bg-white"
                    }`}
                  >
                    {announcement.isActive
                      ? "Yayından kaldır"
                      : "Tekrar aktif et"}
                  </button>
                </div>
              </article>
            ),
          )
        )}
      </div>
    </>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-white p-6 text-center text-[10px] text-muted-foreground">
      {text}
    </div>
  );
}