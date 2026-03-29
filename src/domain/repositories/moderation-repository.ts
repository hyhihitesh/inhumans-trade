import { CommunityReportReason, ModerationQueueItem, ModerationSubjectType } from "@/domain/types";

export interface ModerationRepository {
  listOwnerModerationQueue(ownerId: string): Promise<ModerationQueueItem[]>;
  listAdminModerationQueue(): Promise<ModerationQueueItem[]>;
  createReport(input: {
    subjectType: ModerationSubjectType;
    subjectId: string;
    ownerId: string;
    reporterId: string;
    reason: CommunityReportReason;
    details?: string | null;
  }): Promise<void>;
  hideSubject(input: { ownerId: string; subjectType: ModerationSubjectType; subjectId: string; reason?: string | null }): Promise<void>;
  unhideSubject(input: { ownerId: string; subjectType: ModerationSubjectType; subjectId: string; reason?: string | null }): Promise<void>;
  lockReplies(input: { ownerId: string; subjectType: "community_post" | "course_discussion"; subjectId: string }): Promise<void>;
  unlockReplies(input: { ownerId: string; subjectType: "community_post" | "course_discussion"; subjectId: string }): Promise<void>;
  actionReportAsAdmin(input: {
    actorId: string;
    reportId: string;
    nextStatus: "reviewing" | "actioned" | "dismissed";
    reason?: string | null;
  }): Promise<void>;
}
