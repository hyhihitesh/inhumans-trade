import { SupabaseClient } from "@supabase/supabase-js";
import { LiveRepository } from "@/domain/repositories/live-repository";
import { LiveRoom, LiveSession, LiveSessionStatus, SubscriptionTierName, VideoProvider } from "@/domain/types";

type LiveRoomRow = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  access_mode: LiveRoom["accessMode"];
  visibility_tier: SubscriptionTierName | null;
  free_preview_minutes: number | null;
  provider: VideoProvider;
  active: boolean;
  created_at: string;
  profiles?: { handle: string | null; name: string | null }[] | { handle: string | null; name: string | null } | null;
};

type LiveSessionRow = {
  id: string;
  room_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  status: LiveSessionStatus;
  starts_at: string;
  ends_at: string | null;
  live_url: string | null;
  embed_url: string | null;
  replay_url: string | null;
  replay_embed_url: string | null;
  access_mode: LiveRoom["accessMode"];
  visibility_tier: SubscriptionTierName | null;
  free_preview_minutes: number | null;
  can_view: boolean;
  requires_upgrade: boolean;
  created_at: string;
};

function toLiveRoom(row: LiveRoomRow): LiveRoom {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    creatorId: row.creator_id,
    creatorHandle: profile?.handle ?? "creator",
    creatorName: profile?.name ?? profile?.handle ?? "Creator",
    title: row.title,
    description: row.description,
    accessMode: row.access_mode,
    visibilityTier: row.visibility_tier,
    freePreviewMinutes: row.free_preview_minutes,
    provider: row.provider,
    active: row.active,
    createdAt: row.created_at,
  };
}

function toLiveSession(row: LiveSessionRow): LiveSession {
  return {
    id: row.id,
    roomId: row.room_id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    liveUrl: row.live_url,
    embedUrl: row.embed_url,
    replayUrl: row.replay_url,
    replayEmbedUrl: row.replay_embed_url,
    accessMode: row.access_mode,
    visibilityTier: row.visibility_tier,
    freePreviewMinutes: row.free_preview_minutes,
    canView: row.can_view,
    requiresUpgrade: row.requires_upgrade,
    createdAt: row.created_at,
  };
}

export class SupabaseLiveRepository implements LiveRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listLiveRooms(): Promise<LiveRoom[]> {
    const { data, error } = await this.supabase
      .from("live_rooms")
      .select("id, creator_id, title, description, access_mode, visibility_tier, free_preview_minutes, provider, active, created_at, profiles:creator_id(handle, name)")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data as LiveRoomRow[]) ?? []).map(toLiveRoom);
  }

  async listLiveSessions(_viewerId: string, options?: { creatorId?: string; limit?: number }): Promise<LiveSession[]> {
    const { data, error } = await this.supabase.rpc("list_live_sessions_for_viewer", {
      p_limit: options?.limit ?? 20,
      p_creator_id: options?.creatorId ?? null,
    });

    if (error) throw error;
    return ((data as LiveSessionRow[]) ?? []).map(toLiveSession);
  }

  async createLiveRoom(input: {
    creatorId: string;
    title: string;
    description?: string | null;
    accessMode: "free" | "free_preview" | "tier_gated";
    visibilityTier?: SubscriptionTierName | null;
    freePreviewMinutes?: number | null;
  }): Promise<LiveRoom> {
    const { data, error } = await this.supabase
      .from("live_rooms")
      .insert({
        creator_id: input.creatorId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        access_mode: input.accessMode,
        visibility_tier: input.visibilityTier ?? null,
        free_preview_minutes: input.freePreviewMinutes ?? null,
        provider: "youtube",
      })
      .select("id, creator_id, title, description, access_mode, visibility_tier, free_preview_minutes, provider, active, created_at, profiles:creator_id(handle, name)")
      .single();

    if (error) throw error;
    return toLiveRoom(data as LiveRoomRow);
  }

  async scheduleLiveSession(input: {
    creatorId: string;
    roomId: string;
    title: string;
    description?: string | null;
    startsAt: string;
    liveUrl?: string | null;
    embedUrl?: string | null;
    replayUrl?: string | null;
    replayEmbedUrl?: string | null;
  }): Promise<LiveSession> {
    const { data: room, error: roomError } = await this.supabase
      .from("live_rooms")
      .select("access_mode, visibility_tier, free_preview_minutes")
      .eq("id", input.roomId)
      .eq("creator_id", input.creatorId)
      .single();

    if (roomError) throw roomError;

    const { data, error } = await this.supabase
      .from("live_sessions")
      .insert({
        room_id: input.roomId,
        creator_id: input.creatorId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        starts_at: input.startsAt,
        live_url: input.liveUrl ?? null,
        embed_url: input.embedUrl ?? null,
        replay_url: input.replayUrl ?? null,
        replay_embed_url: input.replayEmbedUrl ?? null,
        access_mode: room.access_mode,
        visibility_tier: room.visibility_tier,
        free_preview_minutes: room.free_preview_minutes,
      })
      .select("id, room_id, creator_id, title, description, status, starts_at, ends_at, live_url, embed_url, replay_url, replay_embed_url, access_mode, visibility_tier, free_preview_minutes, can_view, requires_upgrade, created_at")
      .single();

    if (error) throw error;
    return toLiveSession(data as LiveSessionRow);
  }

  async registerSessionAttendance(input: { sessionId: string; userId: string }): Promise<void> {
    const { error } = await this.supabase.rpc("register_live_session_attendance", {
      p_session_id: input.sessionId,
      p_user_id: input.userId,
    });

    if (error) throw error;
  }
}
