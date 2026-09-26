import { supabase } from "@/services/supabase";

export type CreatorNotificationPreferences = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  emailCooldownMinutes: number;
};

export async function getCreatorNotificationPreferences(
  creatorId: string,
): Promise<CreatorNotificationPreferences> {
  const { data, error } = await supabase
    .from("creator_notification_preferences")
    .select(
      "email_enabled,push_enabled,email_cooldown_minutes",
    )
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const defaults = {
      creator_id: creatorId,
      email_enabled: true,
      push_enabled: true,
      email_cooldown_minutes: 15,
    };

    const { error: insertError } = await supabase
      .from("creator_notification_preferences")
      .insert(defaults);

    if (insertError && insertError.code !== "23505") {
      throw new Error(insertError.message);
    }

    return {
      emailEnabled: true,
      pushEnabled: true,
      emailCooldownMinutes: 15,
    };
  }

  return {
    emailEnabled: data.email_enabled !== false,
    pushEnabled: data.push_enabled !== false,
    emailCooldownMinutes:
      typeof data.email_cooldown_minutes === "number"
        ? data.email_cooldown_minutes
        : 15,
  };
}

export async function updateCreatorNotificationPreferences(
  creatorId: string,
  updates: Partial<CreatorNotificationPreferences>,
) {
  const payload: Record<string, unknown> = {
    creator_id: creatorId,
    updated_at: new Date().toISOString(),
  };

  if (typeof updates.emailEnabled === "boolean") {
    payload.email_enabled = updates.emailEnabled;
  }

  if (typeof updates.pushEnabled === "boolean") {
    payload.push_enabled = updates.pushEnabled;
  }

  if (typeof updates.emailCooldownMinutes === "number") {
    payload.email_cooldown_minutes =
      updates.emailCooldownMinutes;
  }

  const { error } = await supabase
    .from("creator_notification_preferences")
    .upsert(payload, {
      onConflict: "creator_id",
    });

  if (error) {
    throw new Error(error.message);
  }
}
