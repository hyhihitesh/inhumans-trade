"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SupabaseLiveRepository } from "@/domain/datasources/supabase-live";
import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function createLiveRoomAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/live");
  if (profile.role !== "creator") {
    redirect("/app/live?error=creator_access_required");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const accessMode = String(formData.get("accessMode") ?? "free").trim() as "free" | "free_preview" | "tier_gated";
  const visibilityTier = String(formData.get("visibilityTier") ?? "").trim() || null;
  const freePreviewMinutes = Number(formData.get("freePreviewMinutes") ?? 0) || null;

  if (title.length < 3) {
    redirect("/app/live?error=Live+room+title+must+be+at+least+3+characters");
  }

  const repo = new SupabaseLiveRepository(await createClient());
  await repo.createLiveRoom({
    creatorId: profile.id,
    title,
    description: description || null,
    accessMode,
    visibilityTier: visibilityTier as "free" | "pro" | "premium" | null,
    freePreviewMinutes,
  });
  revalidatePath("/app/live");
}

export async function scheduleLiveSessionAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/live");
  if (profile.role !== "creator") {
    redirect("/app/live?error=creator_access_required");
  }

  const roomId = String(formData.get("roomId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const liveUrl = String(formData.get("liveUrl") ?? "").trim();
  const embedUrl = String(formData.get("embedUrl") ?? "").trim();

  if (!roomId || title.length < 3 || !startsAt) {
    redirect("/app/live?error=Missing+required+live+session+fields");
  }

  const repo = new SupabaseLiveRepository(await createClient());
  await repo.scheduleLiveSession({
    creatorId: profile.id,
    roomId,
    title,
    description: description || null,
    startsAt: new Date(startsAt).toISOString(),
    liveUrl: liveUrl || null,
    embedUrl: embedUrl || null,
  });
  revalidatePath("/app/live");
  revalidatePath(`/profile/${profile.handle}`);
}

export async function joinLiveSessionAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/live");
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  if (!sessionId) {
    redirect("/app/live?error=Missing+session");
  }

  const repo = new SupabaseLiveRepository(await createClient());
  await repo.registerSessionAttendance({ sessionId, userId: profile.id });
  revalidatePath("/app/live");
}
