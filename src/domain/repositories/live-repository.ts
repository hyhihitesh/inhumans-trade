import { LiveRoom, LiveSession, SubscriptionTierName } from "@/domain/types";

export interface LiveRepository {
  listLiveRooms(viewerId: string): Promise<LiveRoom[]>;
  listLiveSessions(viewerId: string, options?: { creatorId?: string; limit?: number }): Promise<LiveSession[]>;
  createLiveRoom(input: {
    creatorId: string;
    title: string;
    description?: string | null;
    accessMode: "free" | "free_preview" | "tier_gated";
    visibilityTier?: SubscriptionTierName | null;
    freePreviewMinutes?: number | null;
  }): Promise<LiveRoom>;
  scheduleLiveSession(input: {
    creatorId: string;
    roomId: string;
    title: string;
    description?: string | null;
    startsAt: string;
    liveUrl?: string | null;
    embedUrl?: string | null;
    replayUrl?: string | null;
    replayEmbedUrl?: string | null;
  }): Promise<LiveSession>;
  registerSessionAttendance(input: {
    sessionId: string;
    userId: string;
  }): Promise<void>;
}
