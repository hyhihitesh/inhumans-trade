"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SupabaseModerationRepository } from "@/domain/datasources/supabase-moderation";
import { requireAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function actionModerationReportAction(formData: FormData) {
  const { profile } = await requireAdminUser("/app/admin/moderation");
  const reportId = String(formData.get("reportId") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim() as "reviewing" | "actioned" | "dismissed";
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reportId || !["reviewing", "actioned", "dismissed"].includes(nextStatus)) {
    redirect("/app/admin/moderation?error=Invalid+moderation+action");
  }

  const repo = new SupabaseModerationRepository(await createClient());
  await repo.actionReportAsAdmin({
    actorId: profile.id,
    reportId,
    nextStatus,
    reason: reason || null,
  });
  revalidatePath("/app/admin/moderation");
}
