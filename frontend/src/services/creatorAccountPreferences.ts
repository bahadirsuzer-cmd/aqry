import { supabase } from "@/services/supabase";

export interface CreatorNotificationPreferences {
  giftEmail: boolean;
  paidOfferEmail: boolean;
  payoutEmail: boolean;
  moderationEmail: boolean;
  securityEmail: boolean;
}

export interface CreatorAccountExtensionSnapshot {
  notifications: CreatorNotificationPreferences;
  deletionRequestedAt: string | null;
  dataExportRequestedAt: string | null;
}

const DEFAULT_NOTIFICATIONS: CreatorNotificationPreferences = {
  giftEmail: true,
  paidOfferEmail: true,
  payoutEmail: true,
  moderationEmail: true,
  securityEmail: true,
};

interface PreferencesRow {
  gift_email: boolean | null;
  paid_offer_email: boolean | null;
  payout_email: boolean | null;
  moderation_email: boolean | null;
  security_email: boolean | null;
  deletion_requested_at: string | null;
  data_export_requested_at: string | null;
}

function normalizePreferences(
  row: PreferencesRow | null,
): CreatorAccountExtensionSnapshot {
  return {
    notifications: {
      giftEmail:
        row?.gift_email ??
        DEFAULT_NOTIFICATIONS.giftEmail,
      paidOfferEmail:
        row?.paid_offer_email ??
        DEFAULT_NOTIFICATIONS.paidOfferEmail,
      payoutEmail:
        row?.payout_email ??
        DEFAULT_NOTIFICATIONS.payoutEmail,
      moderationEmail:
        row?.moderation_email ??
        DEFAULT_NOTIFICATIONS.moderationEmail,
      securityEmail:
        row?.security_email ??
        DEFAULT_NOTIFICATIONS.securityEmail,
    },
    deletionRequestedAt:
      row?.deletion_requested_at ?? null,
    dataExportRequestedAt:
      row?.data_export_requested_at ?? null,
  };
}

export async function getCreatorAccountExtensionSnapshot(): Promise<CreatorAccountExtensionSnapshot> {
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error(
      "Oturum bulunamadı.",
    );
  }

  const { data, error } =
    await supabase
      .from(
        "creator_account_preferences",
      )
      .select(
        `
          gift_email,
          paid_offer_email,
          payout_email,
          moderation_email,
          security_email,
          deletion_requested_at,
          data_export_requested_at
        `,
      )
      .eq(
        "user_id",
        userData.user.id,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Hesap tercihleri alınamadı: ${error.message}`,
    );
  }

  return normalizePreferences(
    (data as PreferencesRow | null) ??
      null,
  );
}

export async function saveCreatorNotificationPreferences(
  preferences: CreatorNotificationPreferences,
) {
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error(
      "Oturum bulunamadı.",
    );
  }

  const { error } =
    await supabase
      .from(
        "creator_account_preferences",
      )
      .upsert(
        {
          user_id: userData.user.id,
          gift_email:
            preferences.giftEmail,
          paid_offer_email:
            preferences.paidOfferEmail,
          payout_email:
            preferences.payoutEmail,
          moderation_email:
            preferences.moderationEmail,
          security_email:
            preferences.securityEmail,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

  if (error) {
    throw new Error(
      `Bildirim tercihleri kaydedilemedi: ${error.message}`,
    );
  }
}

export async function requestCreatorDataExport() {
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error(
      "Oturum bulunamadı.",
    );
  }

  const requestedAt =
    new Date().toISOString();

  const { error } =
    await supabase
      .from(
        "creator_account_preferences",
      )
      .upsert(
        {
          user_id: userData.user.id,
          data_export_requested_at:
            requestedAt,
          updated_at: requestedAt,
        },
        {
          onConflict: "user_id",
        },
      );

  if (error) {
    throw new Error(
      `Veri dışa aktarma talebi oluşturulamadı: ${error.message}`,
    );
  }

  return requestedAt;
}

export async function requestCreatorAccountDeletion(
  confirmationText: string,
) {
  const normalized =
    confirmationText
      .trim()
      .toLocaleUpperCase("tr-TR");

  if (normalized !== "HESABIMI SİL") {
    throw new Error(
      'Devam etmek için "HESABIMI SİL" yazmalısın.',
    );
  }

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error(
      "Oturum bulunamadı.",
    );
  }

  const requestedAt =
    new Date().toISOString();

  const { error } =
    await supabase
      .from(
        "creator_account_preferences",
      )
      .upsert(
        {
          user_id: userData.user.id,
          deletion_requested_at:
            requestedAt,
          updated_at: requestedAt,
        },
        {
          onConflict: "user_id",
        },
      );

  if (error) {
    throw new Error(
      `Hesap silme talebi oluşturulamadı: ${error.message}`,
    );
  }

  return requestedAt;
}