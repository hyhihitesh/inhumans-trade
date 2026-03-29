"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SupabaseLearningRepository } from "@/domain/datasources/supabase-learning";
import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function createCourseAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/courses");
  if (profile.role !== "creator") {
    redirect("/app/courses?error=creator_access_required");
  }

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) {
    redirect("/app/courses?error=Course+title+must+be+at+least+3+characters");
  }

  const repo = new SupabaseLearningRepository(await createClient());
  await repo.createCourse({
    creatorId: profile.id,
    title,
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    priceInr: Number(formData.get("priceInr") ?? 0) || 0,
    visibilityTier: (String(formData.get("visibilityTier") ?? "").trim() || null) as "free" | "pro" | "premium" | null,
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
  });
  revalidatePath("/app/courses");
}

export async function addCourseModuleAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/courses");
  if (profile.role !== "creator") redirect("/app/courses?error=creator_access_required");
  const courseId = String(formData.get("courseId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!courseId || title.length < 3) redirect("/app/courses?error=Invalid+module+payload");

  const repo = new SupabaseLearningRepository(await createClient());
  await repo.addCourseModule({
    courseId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
  });
  revalidatePath("/app/courses");
}

export async function addCourseLessonAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/courses");
  if (profile.role !== "creator") redirect("/app/courses?error=creator_access_required");
  const courseId = String(formData.get("courseId") ?? "").trim();
  const moduleId = String(formData.get("moduleId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!courseId || !moduleId || title.length < 3) redirect("/app/courses?error=Invalid+lesson+payload");

  const repo = new SupabaseLearningRepository(await createClient());
  await repo.addCourseLesson({
    courseId,
    moduleId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
    durationMinutes: Number(formData.get("durationMinutes") ?? 0) || null,
  });
  revalidatePath("/app/courses");
}

export async function createCohortAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/courses");
  if (profile.role !== "creator") redirect("/app/courses?error=creator_access_required");
  const courseId = String(formData.get("courseId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  if (!courseId || title.length < 3 || !startsAt) redirect("/app/courses?error=Invalid+cohort+payload");

  const repo = new SupabaseLearningRepository(await createClient());
  await repo.createCohort({
    courseId,
    title,
    startsAt: new Date(startsAt).toISOString(),
    seatLimit: Number(formData.get("seatLimit") ?? 50) || 50,
    waitlistEnabled: formData.get("waitlistEnabled") === "on",
  });
  revalidatePath("/app/courses");
}

export async function enrollInCourseAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/courses");
  const courseId = String(formData.get("courseId") ?? "").trim();
  if (!courseId) redirect("/app/courses?error=Missing+course");
  const repo = new SupabaseLearningRepository(await createClient());
  await repo.enrollInCourse({ courseId, userId: profile.id });
  revalidatePath("/app/courses");
}

export async function joinCohortWaitlistAction(formData: FormData) {
  const { profile } = await requireUserProfile("/app/courses");
  const cohortId = String(formData.get("cohortId") ?? "").trim();
  if (!cohortId) redirect("/app/courses?error=Missing+cohort");
  const repo = new SupabaseLearningRepository(await createClient());
  await repo.joinCohortWaitlist({ cohortId, userId: profile.id });
  revalidatePath("/app/courses");
}
