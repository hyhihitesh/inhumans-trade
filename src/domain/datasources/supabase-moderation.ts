import { SupabaseClient } from "@supabase/supabase-js";
import { ModerationRepository } from "@/domain/repositories/moderation-repository";
import { CommunityReportReason, ModerationQueueItem, ModerationSubjectType } from "@/domain/types";

export class SupabaseModerationRepository implements ModerationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listOwnerModerationQueue(ownerId: string): Promise<ModerationQueueItem[]> {
    const { data, error } = await this.supabase.rpc("list_owner_moderation_queue", { p_owner_id: ownerId });
    if (error) throw error;
    return ((data ?? []) as Array<{
      id: string;
      subject_type: ModerationQueueItem["subjectType"];
      subject_id: string;
      owner_id: string;
      reporter_count: number;
      latest_reason: ModerationQueueItem["latestReason"];
      status: ModerationQueueItem["status"];
      created_at: string;
    }>).map((row) => ({
      id: row.id,
      subjectType: row.subject_type,
      subjectId: row.subject_id,
      ownerId: row.owner_id,
      reporterCount: Number(row.reporter_count ?? 0),
      latestReason: row.latest_reason,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async listAdminModerationQueue(): Promise<ModerationQueueItem[]> {
    const { data, error } = await this.supabase.rpc("list_admin_moderation_queue");
    if (error) throw error;
    return ((data ?? []) as Array<{
      id: string;
      subject_type: ModerationQueueItem["subjectType"];
      subject_id: string;
      owner_id: string;
      reporter_count: number;
      latest_reason: ModerationQueueItem["latestReason"];
      status: ModerationQueueItem["status"];
      created_at: string;
    }>).map((row) => ({
      id: row.id,
      subjectType: row.subject_type,
      subjectId: row.subject_id,
      ownerId: row.owner_id,
      reporterCount: Number(row.reporter_count ?? 0),
      latestReason: row.latest_reason,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async createReport(input: {
    subjectType: ModerationSubjectType;
    subjectId: string;
    ownerId: string;
    reporterId: string;
    reason: CommunityReportReason;
    details?: string | null;
  }): Promise<void> {
    const { error } = await this.supabase
      .from("moderation_reports")
      .insert({
        subject_type: input.subjectType,
        subject_id: input.subjectId,
        owner_id: input.ownerId,
        reporter_id: input.reporterId,
        reason: input.reason,
        details: input.details ?? null,
      });
    if (error) throw error;
  }

  async hideSubject(input: { ownerId: string; subjectType: ModerationSubjectType; subjectId: string; reason?: string | null }): Promise<void> {
    await this.updateSubjectVisibility(input.subjectType, input.subjectId, "hidden", true);
    await this.logOwnerAction(input.ownerId, input.subjectType, input.subjectId, "hide", input.reason ?? null);
  }

  async unhideSubject(input: { ownerId: string; subjectType: ModerationSubjectType; subjectId: string; reason?: string | null }): Promise<void> {
    await this.updateSubjectVisibility(input.subjectType, input.subjectId, "active", false);
    await this.logOwnerAction(input.ownerId, input.subjectType, input.subjectId, "unhide", input.reason ?? null);
  }

  async lockReplies(input: { ownerId: string; subjectType: "community_post" | "course_discussion"; subjectId: string }): Promise<void> {
    if (input.subjectType === "community_post") {
      const { error } = await this.supabase.from("community_posts").update({ comments_locked: true }).eq("id", input.subjectId);
      if (error) throw error;
    } else {
      const { error } = await this.supabase.from("course_lessons").update({ discussion_locked: true }).eq("id", input.subjectId);
      if (error) throw error;
    }
    await this.logOwnerAction(input.ownerId, input.subjectType, input.subjectId, "lock_replies", null);
  }

  async unlockReplies(input: { ownerId: string; subjectType: "community_post" | "course_discussion"; subjectId: string }): Promise<void> {
    if (input.subjectType === "community_post") {
      const { error } = await this.supabase.from("community_posts").update({ comments_locked: false }).eq("id", input.subjectId);
      if (error) throw error;
    } else {
      const { error } = await this.supabase.from("course_lessons").update({ discussion_locked: false }).eq("id", input.subjectId);
      if (error) throw error;
    }
    await this.logOwnerAction(input.ownerId, input.subjectType, input.subjectId, "unlock_replies", null);
  }

  async actionReportAsAdmin(input: {
    actorId: string;
    reportId: string;
    nextStatus: "reviewing" | "actioned" | "dismissed";
    reason?: string | null;
  }): Promise<void> {
    const { data, error } = await this.supabase
      .from("moderation_reports")
      .update({ status: input.nextStatus, updated_at: new Date().toISOString() })
      .eq("id", input.reportId)
      .select("subject_type, subject_id")
      .single();
    if (error) throw error;

    const { error: actionError } = await this.supabase.from("moderation_actions").insert({
      report_id: input.reportId,
      subject_type: data.subject_type,
      subject_id: data.subject_id,
      actor_id: input.actorId,
      action_type: input.nextStatus === "dismissed" ? "unhide" : "hide",
      reason: input.reason ?? null,
    });
    if (actionError) throw actionError;
  }

  private async updateSubjectVisibility(subjectType: ModerationSubjectType, subjectId: string, status: "active" | "hidden", reportFlag: boolean) {
    if (subjectType === "community_post") {
      const { error } = await this.supabase.from("community_posts").update({ status }).eq("id", subjectId);
      if (error) throw error;
      return;
    }
    if (subjectType === "community_comment") {
      const { error } = await this.supabase.from("community_comments").update({ status }).eq("id", subjectId);
      if (error) throw error;
      return;
    }
    if (subjectType === "live_message") {
      const { error } = await this.supabase
        .from("live_session_messages")
        .update({ status, reported: reportFlag })
        .eq("id", subjectId);
      if (error) throw error;
      return;
    }

    const { error } = await this.supabase
      .from("course_discussion_messages")
      .update({ status, reported: reportFlag })
      .eq("id", subjectId);
    if (error) throw error;
  }

  private async logOwnerAction(
    actorId: string,
    subjectType: ModerationSubjectType,
    subjectId: string,
    actionType: "hide" | "unhide" | "lock_replies" | "unlock_replies",
    reason: string | null
  ) {
    const { error } = await this.supabase.from("moderation_actions").insert({
      subject_type: subjectType,
      subject_id: subjectId,
      actor_id: actorId,
      action_type: actionType,
      reason,
    });
    if (error) throw error;
  }
}
