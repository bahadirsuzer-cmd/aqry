import { supabase } from "@/services/supabase";

export interface AdminDashboardSummary {
  creators: number;
  experiences: number;
  publishedExperiences: number;
  openReports: number;
  paidOrders: number;
  grossPaidMinor: number;
  pendingPayouts: number;
}

export type AdminReportStatus =
  | "new"
  | "reviewing"
  | "resolved"
  | "dismissed";

export interface AdminExperienceReport {
  id: string;
  experienceId: string;
  experienceTitle: string;
  creatorId: string;
  reason: string;
  details: string | null;
  status: AdminReportStatus;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminExperienceRow {
  id: string;
  creatorId: string;
  title: string;
  type: string;
  status: string;
  pausedBy: string | null;
  pauseReason: string | null;
  moderatedAt: string | null;
  moderatedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface AdminOrderRow {
  id: string;
  experienceId: string;
  creatorId: string;
  experienceTitle: string;
  offerTitle: string;
  amountMinor: number;
  currency: string;
  status: string;
  paymentProvider: string | null;
  disputeStatus: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface AdminPayoutRow {
  id: string;
  creatorId: string;
  amountMinor: number;
  currency: string;
  status: string;
  provider: string | null;
  providerPayoutRef: string | null;
  requestedAt: string;
  paidAt: string | null;
  failedAt: string | null;
  failureMessage: string | null;
}

export interface AdminCreatorRow {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

function safeNumber(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric)
    ? numeric
    : 0;
}

export async function isCurrentUserAdmin() {
  const { data, error } =
    await supabase.rpc(
      "is_aqryo_admin",
    );

  if (error) {
    return false;
  }

  return data === true;
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const { data, error } =
    await supabase.rpc(
      "admin_get_dashboard_summary",
    );

  if (error) {
    throw new Error(
      `Admin özeti alınamadı: ${error.message}`,
    );
  }

  const value =
    (data ?? {}) as Record<
      string,
      unknown
    >;

  return {
    creators:
      safeNumber(
        value.creators,
      ),
    experiences:
      safeNumber(
        value.experiences,
      ),
    publishedExperiences:
      safeNumber(
        value.publishedExperiences,
      ),
    openReports:
      safeNumber(
        value.openReports,
      ),
    paidOrders:
      safeNumber(
        value.paidOrders,
      ),
    grossPaidMinor:
      safeNumber(
        value.grossPaidMinor,
      ),
    pendingPayouts:
      safeNumber(
        value.pendingPayouts,
      ),
  };
}

export async function getAdminExperienceReports(
  status?: AdminReportStatus,
  limit = 50,
): Promise<AdminExperienceReport[]> {
  const { data, error } =
    await supabase.rpc(
      "admin_list_experience_reports",
      {
        p_status:
          status ?? null,
        p_limit: limit,
      },
    );

  if (error) {
    throw new Error(
      `Reportlar alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    id: row.id,
    experienceId:
      row.experience_id,
    experienceTitle:
      row.experience_title,
    creatorId:
      row.creator_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    resolutionNote:
      row.resolution_note,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  }));
}

export async function updateAdminExperienceReport(
  reportId: string,
  status: AdminReportStatus,
  resolutionNote?: string,
) {
  const { data, error } =
    await supabase.rpc(
      "admin_update_experience_report",
      {
        p_report_id:
          reportId,
        p_status: status,
        p_resolution_note:
          resolutionNote ?? null,
      },
    );

  if (error) {
    throw new Error(
      `Report güncellenemedi: ${error.message}`,
    );
  }

  return data === true;
}

export async function getAdminExperiences(
  limit = 50,
): Promise<AdminExperienceRow[]> {
  const { data, error } =
    await supabase.rpc(
      "admin_list_experiences",
      {
        p_limit: limit,
      },
    );

  if (error) {
    throw new Error(
      `Experience listesi alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    id: row.id,
    creatorId:
      row.creator_id,
    title: row.title,
    type: row.type,
    status: row.status,
    pausedBy:
      row.paused_by ?? null,
    pauseReason:
      row.pause_reason ?? null,
    moderatedAt:
      row.moderated_at ?? null,
    moderatedBy:
      row.moderated_by ?? null,
    publishedAt:
      row.published_at,
    createdAt:
      row.created_at,
  }));
}

export async function getAdminOrders(
  limit = 50,
): Promise<AdminOrderRow[]> {
  const { data, error } =
    await supabase.rpc(
      "admin_list_orders",
      {
        p_limit: limit,
      },
    );

  if (error) {
    throw new Error(
      `Sipariş listesi alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    id: row.id,
    experienceId:
      row.experience_id,
    creatorId:
      row.creator_id,
    experienceTitle:
      row.experience_title,
    offerTitle:
      row.offer_title,
    amountMinor:
      safeNumber(
        row.amount_minor,
      ),
    currency:
      row.currency,
    status: row.status,
    paymentProvider:
      row.payment_provider,
    disputeStatus:
      row.dispute_status,
    paidAt:
      row.paid_at,
    refundedAt:
      row.refunded_at,
    createdAt:
      row.created_at,
    metadata:
      row.metadata ?? {},
  }));
}

export async function getAdminPayouts(
  limit = 50,
): Promise<AdminPayoutRow[]> {
  const { data, error } =
    await supabase.rpc(
      "admin_list_payouts",
      {
        p_limit: limit,
      },
    );

  if (error) {
    throw new Error(
      `Payout listesi alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    id: row.id,
    creatorId:
      row.creator_id,
    amountMinor:
      safeNumber(
        row.amount_minor,
      ),
    currency:
      row.currency,
    status: row.status,
    provider:
      row.provider,
    providerPayoutRef:
      row.provider_payout_ref,
    requestedAt:
      row.requested_at,
    paidAt:
      row.paid_at,
    failedAt:
      row.failed_at,
    failureMessage:
      row.failure_message,
  }));
}

export async function getAdminCreators(
  limit = 50,
): Promise<AdminCreatorRow[]> {
  const { data, error } =
    await supabase.rpc(
      "admin_list_creators",
      {
        p_limit: limit,
      },
    );

  if (error) {
    throw new Error(
      `Creator listesi alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    id: row.id,
    email: row.email,
    createdAt:
      row.created_at,
    lastSignInAt:
      row.last_sign_in_at,
  }));
}

export interface AdminHomepageFeaturedSlot {
  slot: number;
  experienceId: string | null;
  creatorId: string | null;
  title: string | null;
  type: string | null;
  status: string | null;
  pausedBy: string | null;
  updatedAt: string;
}

export type SiteAnnouncementDisplayMode =
  | "once"
  | "every_visit";

export interface AdminSiteAnnouncement {
  id: string;
  title: string;
  message: string;
  buttonText: string | null;
  buttonUrl: string | null;
  startsAt: string;
  endsAt: string;
  displayMode: SiteAnnouncementDisplayMode;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminHomepageFeaturedSlots(): Promise<
  AdminHomepageFeaturedSlot[]
> {
  const { data, error } =
    await supabase.rpc(
      "admin_get_homepage_featured_slots",
    );

  if (error) {
    throw new Error(
      `Ana sayfa slotları alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    slot: safeNumber(row.slot),
    experienceId:
      row.experience_id ?? null,
    creatorId:
      row.creator_id ?? null,
    title:
      row.title ?? null,
    type:
      row.type ?? null,
    status:
      row.status ?? null,
    pausedBy:
      row.paused_by ?? null,
    updatedAt:
      row.updated_at,
  }));
}

export async function setAdminHomepageFeaturedSlot(
  slot: number,
  experienceId: string | null,
) {
  const { data, error } =
    await supabase.rpc(
      "admin_set_homepage_featured_slot",
      {
        p_slot: slot,
        p_experience_id:
          experienceId,
      },
    );

  if (error) {
    throw new Error(
      `Ana sayfa slotu güncellenemedi: ${error.message}`,
    );
  }

  return data === true;
}

export async function getAdminSiteAnnouncements(): Promise<
  AdminSiteAnnouncement[]
> {
  const { data, error } =
    await supabase.rpc(
      "admin_list_site_announcements",
    );

  if (error) {
    throw new Error(
      `Duyurular alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    buttonText:
      row.button_text ?? null,
    buttonUrl:
      row.button_url ?? null,
    startsAt:
      row.starts_at,
    endsAt:
      row.ends_at,
    displayMode:
      row.display_mode,
    isActive:
      row.is_active === true,
    createdBy:
      row.created_by ?? null,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  }));
}

export async function createAdminSiteAnnouncement(input: {
  title: string;
  message: string;
  startsAt: string;
  endsAt: string;
  displayMode: SiteAnnouncementDisplayMode;
  buttonText?: string;
  buttonUrl?: string;
}) {
  const { data, error } =
    await supabase.rpc(
      "admin_create_site_announcement",
      {
        p_title:
          input.title,
        p_message:
          input.message,
        p_starts_at:
          input.startsAt,
        p_ends_at:
          input.endsAt,
        p_display_mode:
          input.displayMode,
        p_button_text:
          input.buttonText?.trim() ||
          null,
        p_button_url:
          input.buttonUrl?.trim() ||
          null,
      },
    );

  if (error) {
    throw new Error(
      `Duyuru oluşturulamadı: ${error.message}`,
    );
  }

  return String(data);
}

export async function setAdminSiteAnnouncementActive(
  announcementId: string,
  isActive: boolean,
) {
  const { data, error } =
    await supabase.rpc(
      "admin_set_site_announcement_active",
      {
        p_announcement_id:
          announcementId,
        p_is_active:
          isActive,
      },
    );

  if (error) {
    throw new Error(
      `Duyuru güncellenemedi: ${error.message}`,
    );
  }

  return data === true;
}