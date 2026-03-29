"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserProfile } from "@/lib/auth/session";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { SupabaseModerationRepository } from "@/domain/datasources/supabase-moderation";
import { CommunityReactionType, CommunityReportReason } from "@/domain/types";

const allowedReactions: CommunityReactionType[] = ["conviction", "insightful"];
const allowedReasons: CommunityReportReason[] = ["spam", "abuse", "misleading", "other"];

export async function addCommunityCommentAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!postId || content.length < 2) {
    redirect("/app/community?error=Comment+must+be+at+least+2+characters");
  }

  const { profile } = await requireUserProfile("/app/community");
  const client = await createClient();
  const repo = new SupabaseCreatorPlatformRepository(client);
  const { data: post } = await client.from("community_posts").select("creator_id, comments_locked").eq("id", postId).maybeSingle();
  if (!post) {
    redirect("/app/community?error=Post+not+found");
  }
  if (post.comments_locked && post.creator_id !== profile.id) {
    redirect("/app/community?error=Comments+are+locked+for+this+post");
  }
  await repo.addCommunityComment({ postId, authorId: profile.id, content });
  revalidatePath("/app/community");
}

export async function toggleCommunityReactionAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const reactionType = String(formData.get("reactionType") ?? "").trim() as CommunityReactionType;
  if (!postId || !allowedReactions.includes(reactionType)) {
    redirect("/app/community?error=Invalid+reaction");
  }

  const { profile } = await requireUserProfile("/app/community");
  const repo = new SupabaseCreatorPlatformRepository(await createClient());
  await repo.toggleCommunityReaction({ postId, userId: profile.id, reactionType });
  revalidatePath("/app/community");
}

export async function reportCommunityPostAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() as CommunityReportReason;
  const details = String(formData.get("details") ?? "").trim();
  if (!postId || !allowedReasons.includes(reason)) {
    redirect("/app/community?error=Invalid+report+reason");
  }

  const { profile } = await requireUserProfile("/app/community");
  const client = await createClient();
  const repo = new SupabaseCreatorPlatformRepository(client);
  const moderationRepo = new SupabaseModerationRepository(client);
  const { data: post } = await client.from("community_posts").select("creator_id").eq("id", postId).maybeSingle();
  if (!post) {
    redirect("/app/community?error=Post+not+found");
  }
  await repo.reportCommunityPost({
    postId,
    reporterId: profile.id,
    reason,
    details: details || null,
  });
  await moderationRepo.createReport({
    subjectType: "community_post",
    subjectId: postId,
    ownerId: post.creator_id,
    reporterId: profile.id,
    reason,
    details: details || null,
  });
  revalidatePath("/app/community");
}

export async function lockCommunityRepliesAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const { profile } = await requireUserProfile("/app/community");
  if (!postId) redirect("/app/community?error=Invalid+post");
  const repo = new SupabaseModerationRepository(await createClient());
  await repo.lockReplies({ ownerId: profile.id, subjectType: "community_post", subjectId: postId });
  revalidatePath("/app/community");
}

export async function unlockCommunityRepliesAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const { profile } = await requireUserProfile("/app/community");
  if (!postId) redirect("/app/community?error=Invalid+post");
  const repo = new SupabaseModerationRepository(await createClient());
  await repo.unlockReplies({ ownerId: profile.id, subjectType: "community_post", subjectId: postId });
  revalidatePath("/app/community");
}

export async function hideCommunityPostAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const { profile } = await requireUserProfile("/app/community");
  if (!postId) redirect("/app/community?error=Invalid+post");
  const repo = new SupabaseModerationRepository(await createClient());
  await repo.hideSubject({ ownerId: profile.id, subjectType: "community_post", subjectId: postId, reason: "Creator moderation" });
  revalidatePath("/app/community");
}

export async function unhideCommunityPostAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim();
  const { profile } = await requireUserProfile("/app/community");
  if (!postId) redirect("/app/community?error=Invalid+post");
  const repo = new SupabaseModerationRepository(await createClient());
  await repo.unhideSubject({ ownerId: profile.id, subjectType: "community_post", subjectId: postId, reason: "Creator moderation" });
  revalidatePath("/app/community");
}
