import { SupabaseClient } from "@supabase/supabase-js";
import { normalizeTradeStatus } from "@/domain/repositories/feed-repository";
import { CreatorPlatformRepository } from "@/domain/repositories/creator-platform-repository";
import {
  AppNotification,
  CommunityComment,
  CommunityPost,
  CommunityReactionType,
  CommunityReportReason,
  CreatorExploreCard,
  CreatorPublicProfile,
  CreatorSubscription,
  CreatorTier,
  ProfileTradeRow,
  SubscriptionTierName,
  Trade,
} from "@/domain/types";

type CreatorProfileRow = {
  user_id: string;
  handle: string | null;
  display_name: string | null;
  bio: string | null;
  verification_status: CreatorExploreCard["verificationStatus"];
};

type ProfileRow = {
  id: string;
  handle: string | null;
  name: string | null;
  role: string;
};

type TierRow = {
  id: string;
  creator_id: string;
  tier_name: "free" | "pro" | "premium";
  label: string;
  monthly_price_inr: number;
  features: string[] | null;
  active: boolean;
};

type SubscriptionRow = {
  id: string;
  creator_id: string;
  follower_id: string;
  tier_id: string;
  status: "pending" | "active" | "canceled" | "expired";
  started_at: string | null;
  ends_at: string | null;
  created_at: string;
};

type TradeRow = {
  id: string;
  creator_id: string;
  broker_name: Trade["brokerName"];
  broker_order_id: string;
  source: string;
  instrument: string;
  symbol: string;
  side: Trade["side"];
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  current_pnl: number;
  status: string;
  created_at: string;
  executed_at: string;
  updated_at: string;
  strategy: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  type: AppNotification["type"];
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

type ProfileTradeRowResult = {
  trade_id: string;
  creator_id: string;
  creator_handle: string;
  instrument: string;
  symbol: string;
  side: Trade["side"];
  status: string;
  broker_name: Trade["brokerName"];
  broker_order_id: string | null;
  entry_price: number | null;
  quantity: number | null;
  current_pnl: number | null;
  executed_at: string;
  updated_at: string;
  visibility_tier: SubscriptionTierName;
  is_locked: boolean;
};

type CommunityPostRow = {
  post_id: string;
  creator_id: string;
  creator_handle: string;
  creator_name: string | null;
  content: string | null;
  visibility_tier: SubscriptionTierName;
  is_locked: boolean;
  created_at: string;
  comment_count: number;
  reaction_count: number;
  viewer_reaction: CommunityReactionType | null;
  comments_locked?: boolean;
  status?: "active" | "hidden" | "reported";
};

type CommunityCommentRow = {
  comment_id: string;
  post_id: string;
  author_id: string;
  author_handle: string | null;
  author_name: string | null;
  content: string;
  created_at: string;
};

function toSubscription(row: SubscriptionRow): CreatorSubscription {
  return {
    id: row.id,
    creatorId: row.creator_id,
    followerId: row.follower_id,
    tierId: row.tier_id,
    status: row.status,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
  };
}

function toProfileTradeRow(row: ProfileTradeRowResult): ProfileTradeRow {
  return {
    id: row.trade_id,
    creatorId: row.creator_id,
    creatorHandle: row.creator_handle,
    instrument: row.instrument,
    symbol: row.symbol,
    side: row.side,
    status: normalizeTradeStatus(row.status),
    brokerName: row.broker_name,
    brokerOrderId: row.broker_order_id,
    entryPrice: row.entry_price === null ? null : Number(row.entry_price),
    quantity: row.quantity === null ? null : Number(row.quantity),
    currentPnl: row.current_pnl === null ? null : Number(row.current_pnl),
    executedAt: row.executed_at,
    updatedAt: row.updated_at,
    visibilityTier: row.visibility_tier,
    isLocked: row.is_locked,
    unlockTier: row.visibility_tier === "free" ? null : row.visibility_tier,
  };
}

function toCommunityPost(row: CommunityPostRow): CommunityPost {
  return {
    id: row.post_id,
    creatorId: row.creator_id,
    creatorHandle: row.creator_handle,
    creatorName: row.creator_name ?? row.creator_handle,
    content: row.content,
    visibilityTier: row.visibility_tier,
    isLocked: row.is_locked,
    createdAt: row.created_at,
    commentCount: Number(row.comment_count ?? 0),
    reactionCount: Number(row.reaction_count ?? 0),
    viewerReaction: row.viewer_reaction,
    commentsLocked: row.comments_locked ?? false,
    status: row.status ?? "active",
  };
}

function toCommunityComment(row: CommunityCommentRow): CommunityComment {
  return {
    id: row.comment_id,
    postId: row.post_id,
    authorId: row.author_id,
    authorHandle: row.author_handle ?? "member",
    authorName: row.author_name ?? "Member",
    content: row.content,
    createdAt: row.created_at,
  };
}

function aggregateStats(
  trades: Array<{
    status: string;
    currentPnl: number | null;
    executedAt: string;
  }>
) {
  const totalTrades = trades.length;
  const closedTrades = trades.filter((t) => normalizeTradeStatus(t.status) === "closed");
  const wins = closedTrades.filter((t) => Number(t.currentPnl ?? 0) > 0).length;
  const winRate = closedTrades.length ? Math.round((wins / closedTrades.length) * 100) : 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const monthlyPnl = trades
    .filter((t) => new Date(t.executedAt).getTime() >= thirtyDaysAgo)
    .reduce((acc, t) => acc + Number(t.currentPnl ?? 0), 0);
  return { totalTrades, winRate, monthlyPnl };
}

export class SupabaseCreatorPlatformRepository implements CreatorPlatformRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listExploreCreators(search?: string): Promise<CreatorExploreCard[]> {
    const profileQuery = this.supabase.from("profiles").select("id, handle, name, role").eq("role", "creator");
    const { data: profiles, error: profileError } = search
      ? await profileQuery.or(`handle.ilike.%${search}%,name.ilike.%${search}%`)
      : await profileQuery;
    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) return [];

    const creatorIds = profiles.map((p: ProfileRow) => p.id);
    const [
      { data: creatorProfiles, error: cpError },
      { data: trades, error: tradesError },
      { data: tiers, error: tiersError },
      { data: subs, error: subsError },
    ] = await Promise.all([
      this.supabase.from("creator_profiles").select("user_id, handle, display_name, bio, verification_status").in("user_id", creatorIds),
      this.supabase.from("trades").select("id, creator_id, broker_name, broker_order_id, source, instrument, symbol, side, entry_price, exit_price, quantity, current_pnl, status, created_at, executed_at, updated_at, strategy").in("creator_id", creatorIds),
      this.supabase.from("creator_tiers").select("id, creator_id, tier_name, label, monthly_price_inr, features, active").eq("active", true).in("creator_id", creatorIds),
      this.supabase.from("creator_subscriptions").select("id, creator_id, status").eq("status", "active").in("creator_id", creatorIds),
    ]);
    if (cpError) throw cpError;
    if (tradesError) throw tradesError;
    if (tiersError) throw tiersError;
    if (subsError) throw subsError;

    const cpMap = new Map((creatorProfiles as CreatorProfileRow[]).map((row) => [row.user_id, row]));
    const tradesByCreator = new Map<string, TradeRow[]>();
    (trades as TradeRow[]).forEach((trade) => {
      const arr = tradesByCreator.get(trade.creator_id) ?? [];
      arr.push(trade);
      tradesByCreator.set(trade.creator_id, arr);
    });
    const tiersByCreator = new Map<string, TierRow[]>();
    (tiers as TierRow[]).forEach((tier) => {
      const arr = tiersByCreator.get(tier.creator_id) ?? [];
      arr.push(tier);
      tiersByCreator.set(tier.creator_id, arr);
    });
    const subCount = new Map<string, number>();
    (subs as { creator_id: string }[]).forEach((s) => {
      subCount.set(s.creator_id, (subCount.get(s.creator_id) ?? 0) + 1);
    });

    return (profiles as ProfileRow[]).map((profile) => {
      const cp = cpMap.get(profile.id);
      const creatorTrades = tradesByCreator.get(profile.id) ?? [];
      const stats = aggregateStats(
        creatorTrades.map((trade) => ({
          status: trade.status,
          currentPnl: Number(trade.current_pnl),
          executedAt: trade.executed_at,
        }))
      );
      const creatorTiers = tiersByCreator.get(profile.id) ?? [];
      const minTierPriceInr = creatorTiers.length
        ? Math.min(...creatorTiers.map((t) => Number(t.monthly_price_inr)))
        : null;

      return {
        creatorId: profile.id,
        handle: cp?.handle ?? profile.handle ?? `creator_${profile.id.slice(0, 6)}`,
        displayName: cp?.display_name ?? profile.name ?? "Creator",
        bio: cp?.bio ?? null,
        verificationStatus: cp?.verification_status ?? "pending",
        subscribers: subCount.get(profile.id) ?? 0,
        winRate: stats.winRate,
        totalTrades: stats.totalTrades,
        monthlyPnl: stats.monthlyPnl,
        minTierPriceInr,
      };
    });
  }

  async listCreatorTiers(creatorId: string): Promise<CreatorTier[]> {
    const { data, error } = await this.supabase
      .from("creator_tiers")
      .select("id, creator_id, tier_name, label, monthly_price_inr, features, active")
      .eq("creator_id", creatorId)
      .eq("active", true)
      .order("monthly_price_inr", { ascending: true });
    if (error) throw error;
    return (data as TierRow[]).map((row) => ({
      id: row.id,
      creatorId: row.creator_id,
      tierName: row.tier_name,
      label: row.label,
      monthlyPriceInr: Number(row.monthly_price_inr),
      features: row.features ?? [],
      active: row.active,
    }));
  }

  async getActiveSubscription(creatorId: string, followerId: string): Promise<CreatorSubscription | null> {
    const { data, error } = await this.supabase
      .from("creator_subscriptions")
      .select("id, creator_id, follower_id, tier_id, status, started_at, ends_at, created_at")
      .eq("creator_id", creatorId)
      .eq("follower_id", followerId)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    return data ? toSubscription(data as SubscriptionRow) : null;
  }

  async getCreatorPublicProfile(handle: string, viewerId?: string): Promise<CreatorPublicProfile | null> {
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("id, handle, name, role")
      .eq("handle", handle)
      .eq("role", "creator")
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return null;

    const creatorId = (profile as ProfileRow).id;
    const [{ data: cp }, tiers, activeSubscriptionTier, { data: profileTradeRows, error: profileTradesError }] =
      await Promise.all([
        this.supabase
          .from("creator_profiles")
          .select("user_id, handle, display_name, bio, verification_status")
          .eq("user_id", creatorId)
          .maybeSingle(),
        this.listCreatorTiers(creatorId),
        viewerId ? this.getViewerTierForCreator(creatorId, viewerId) : Promise.resolve(null),
        this.supabase.rpc("list_profile_trades_for_viewer", { p_handle: handle, p_limit: 15 }),
      ]);

    if (profileTradesError) throw profileTradesError;

    const tradeRows = ((profileTradeRows as ProfileTradeRowResult[]) ?? []).map(toProfileTradeRow);
    const stats = aggregateStats(
      tradeRows.map((trade) => ({
        status: trade.status,
        currentPnl: trade.currentPnl,
        executedAt: trade.executedAt,
      }))
    );

    return {
      creatorId,
      handle: (cp as CreatorProfileRow | null)?.handle ?? (profile as ProfileRow).handle ?? handle,
      displayName: (cp as CreatorProfileRow | null)?.display_name ?? (profile as ProfileRow).name ?? "Creator",
      bio: (cp as CreatorProfileRow | null)?.bio ?? null,
      verificationStatus: (cp as CreatorProfileRow | null)?.verification_status ?? "pending",
      subscribers: await this.getSubscriberCount(creatorId),
      winRate: stats.winRate,
      totalTrades: stats.totalTrades,
      monthlyPnl: stats.monthlyPnl,
      tiers,
      recentTrades: tradeRows,
      activeSubscriptionTier,
    };
  }

  private async getSubscriberCount(creatorId: string) {
    const { count, error } = await this.supabase
      .from("creator_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .eq("status", "active");
    if (error) throw error;
    return count ?? 0;
  }

  async createPendingSubscription(creatorId: string, followerId: string, tierId: string): Promise<CreatorSubscription> {
    const { data, error } = await this.supabase
      .from("creator_subscriptions")
      .insert({
        creator_id: creatorId,
        follower_id: followerId,
        tier_id: tierId,
        status: "pending",
      })
      .select("id, creator_id, follower_id, tier_id, status, started_at, ends_at, created_at")
      .single();
    if (error) throw error;
    return toSubscription(data as SubscriptionRow);
  }

  async getTierById(tierId: string): Promise<CreatorTier | null> {
    const { data, error } = await this.supabase
      .from("creator_tiers")
      .select("id, creator_id, tier_name, label, monthly_price_inr, features, active")
      .eq("id", tierId)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const row = data as TierRow;
    return {
      id: row.id,
      creatorId: row.creator_id,
      tierName: row.tier_name,
      label: row.label,
      monthlyPriceInr: Number(row.monthly_price_inr),
      features: row.features ?? [],
      active: row.active,
    };
  }

  async activateSubscriptionWithPayment(
    subscriptionId: string,
    payment: {
      razorpayOrderId: string | null;
      razorpayPaymentId: string | null;
      razorpaySignature: string | null;
    }
  ): Promise<void> {
    const { error } = await this.supabase.rpc("activate_subscription_with_payment", {
      p_subscription_id: subscriptionId,
      p_order_id: payment.razorpayOrderId,
      p_payment_id: payment.razorpayPaymentId,
      p_signature: payment.razorpaySignature,
      p_activated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async markSubscriptionActive(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("creator_subscriptions")
      .update({
        status: "active",
        started_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);
    if (error) throw error;
  }

  async markSubscriptionCanceled(subscriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("creator_subscriptions")
      .update({
        status: "canceled",
        ends_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);
    if (error) throw error;
  }

  async listNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await this.supabase
      .from("notifications")
      .select("id, user_id, type, title, body, entity_type, entity_id, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return ((data as NotificationRow[]) ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      entityType: row.entity_type,
      entityId: row.entity_id,
      readAt: row.read_at,
      createdAt: row.created_at,
    }));
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async listCommunityPosts(_viewerId: string, options?: { creatorId?: string; limit?: number }): Promise<CommunityPost[]> {
    const { data, error } = await this.supabase.rpc("list_community_posts_for_viewer", {
      p_limit: options?.limit ?? 30,
      p_creator_id: options?.creatorId ?? null,
    });

    if (error) throw error;
    return ((data as CommunityPostRow[]) ?? []).map(toCommunityPost);
  }

  async listCommunityComments(postId: string): Promise<CommunityComment[]> {
    const { data, error } = await this.supabase.rpc("list_community_comments_for_viewer", {
      p_post_id: postId,
      p_limit: 50,
    });

    if (error) throw error;
    return ((data as CommunityCommentRow[]) ?? []).map(toCommunityComment);
  }

  async addCommunityComment(input: { postId: string; authorId: string; content: string }): Promise<CommunityComment> {
    const { data, error } = await this.supabase
      .from("community_comments")
      .insert({
        post_id: input.postId,
        author_id: input.authorId,
        content: input.content.trim(),
      })
      .select("id, post_id, author_id, content, created_at")
      .single();

    if (error) throw error;

    const { data: author, error: authorError } = await this.supabase
      .from("profiles")
      .select("handle, name")
      .eq("id", input.authorId)
      .single();

    if (authorError) throw authorError;

    return toCommunityComment({
      comment_id: data.id,
      post_id: data.post_id,
      author_id: data.author_id,
      author_handle: author.handle,
      author_name: author.name,
      content: data.content,
      created_at: data.created_at,
    });
  }

  async toggleCommunityReaction(input: {
    postId: string;
    userId: string;
    reactionType: CommunityReactionType;
  }): Promise<void> {
    const { data: existing, error: existingError } = await this.supabase
      .from("community_reactions")
      .select("id, reaction_type")
      .eq("post_id", input.postId)
      .eq("user_id", input.userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing && existing.reaction_type === input.reactionType) {
      const { error } = await this.supabase.from("community_reactions").delete().eq("id", existing.id);
      if (error) throw error;
      return;
    }

    const { error } = await this.supabase
      .from("community_reactions")
      .upsert(
        {
          post_id: input.postId,
          user_id: input.userId,
          reaction_type: input.reactionType,
        },
        { onConflict: "post_id,user_id" }
      );

    if (error) throw error;
  }

  async reportCommunityPost(input: {
    postId: string;
    reporterId: string;
    reason: CommunityReportReason;
    details?: string | null;
  }): Promise<void> {
    const { error } = await this.supabase
      .from("community_reports")
      .upsert(
        {
          post_id: input.postId,
          reporter_id: input.reporterId,
          reason: input.reason,
          details: input.details ?? null,
        },
        { onConflict: "post_id,reporter_id" }
      );

    if (error) throw error;
  }

  async getViewerTierForCreator(creatorId: string, viewerId: string): Promise<SubscriptionTierName | null> {
    if (creatorId === viewerId) return "premium";
    const active = await this.getActiveSubscription(creatorId, viewerId);
    if (!active) return null;
    const tier = await this.getTierById(active.tierId);
    return tier?.tierName ?? null;
  }
}
