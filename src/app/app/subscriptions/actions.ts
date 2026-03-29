"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";

export async function activateSubscriptionAction(formData: FormData) {
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  if (!subscriptionId) redirect("/app/subscriptions?error=Missing+subscription+id");

  const repo = new SupabaseCreatorPlatformRepository(await createClient());
  await repo.markSubscriptionActive(subscriptionId);
  revalidatePath("/app/subscriptions");
  revalidatePath("/app/notifications");
  redirect("/app/subscriptions?success=Subscription+activated");
}

export async function cancelSubscriptionAction(formData: FormData) {
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  if (!subscriptionId) redirect("/app/subscriptions?error=Missing+subscription+id");

  const repo = new SupabaseCreatorPlatformRepository(await createClient());
  await repo.markSubscriptionCanceled(subscriptionId);
  revalidatePath("/app/subscriptions");
  redirect("/app/subscriptions?success=Subscription+canceled");
}

