"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SupabaseCopyTradeRepository } from "@/domain/datasources/supabase-copy-trade";
import { createClient } from "@/lib/supabase/server";
import { requireUserProfile } from "@/lib/auth/session";

function toBool(value: FormDataEntryValue | null) {
  return value === "on";
}

export async function updateAlertPreferencesAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/settings/alerts");
  const repo = new SupabaseCopyTradeRepository(await createClient());

  await repo.updateAlertPreferences(profile.id, {
    tradeAlertsEnabled: toBool(formData.get("tradeAlertsEnabled")),
    subscriptionAlertsEnabled: toBool(formData.get("subscriptionAlertsEnabled")),
    marketingAlertsEnabled: toBool(formData.get("marketingAlertsEnabled")),
  });

  revalidatePath("/app/settings/alerts");
  redirect("/app/settings/alerts?success=Alert+preferences+updated");
}
