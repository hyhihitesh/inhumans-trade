"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { requireUserProfile } from "@/lib/auth/session";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) redirect("/app/notifications?error=Invalid+notification");

  const { profile } = await requireUserProfile("/app/notifications");
  const repo = new SupabaseCreatorPlatformRepository(await createClient());
  await repo.markNotificationRead(notificationId, profile.id);
  revalidatePath("/app/notifications");
  redirect("/app/notifications");
}

