import { SupabaseClient } from "@supabase/supabase-js";
import { CreatorAnalyticsSummary, CreatorPerformanceTier } from "@/domain/types";
import { CreatorBusinessRepository } from "@/domain/repositories/creator-business-repository";

type TierRow = {
  id: string;
  monthly_price_inr: number;
};

type SubscriptionRow = {
  tier_id: string;
  status: string;
};

type TradeStatsRow = {
  status: string;
  current_pnl: number | null;
  executed_at: string;
};

type CopyTradeStatsRow = {
  status: string;
};

type PublishResultRow = {
  community_post_id: string;
  feed_item_id: string;
};

export class SupabaseCreatorBusinessRepository implements CreatorBusinessRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getCreatorAnalyticsSummary(creatorId: string): Promise<CreatorAnalyticsSummary> {
    const [{ data: tiers, error: tiersError }, { data: subscriptions, error: subscriptionsError }, { data: trades, error: tradesError }, { data: copyTrades, error: copyTradesError }] =
      await Promise.all([
        this.supabase.from("creator_tiers").select("id, monthly_price_inr").eq("creator_id", creatorId).eq("active", true),
        this.supabase
          .from("creator_subscriptions")
          .select("tier_id, status")
          .eq("creator_id", creatorId)
          .eq("status", "active"),
        this.supabase
          .from("trades")
          .select("status, current_pnl, executed_at")
          .eq("creator_id", creatorId),
        this.supabase.from("copy_trades").select("status").eq("creator_id", creatorId),
      ]);

    if (tiersError) throw tiersError;
    if (subscriptionsError) throw subscriptionsError;
    if (tradesError) throw tradesError;
    if (copyTradesError) throw copyTradesError;

    const tierPriceMap = new Map((tiers as TierRow[]).map((row) => [row.id, Number(row.monthly_price_inr)]));
    const activeSubs = (subscriptions as SubscriptionRow[]) ?? [];
    const subscribers = activeSubs.length;
    const mrrInr = activeSubs.reduce((sum, sub) => sum + (tierPriceMap.get(sub.tier_id) ?? 0), 0);

    const tradeRows = (trades as TradeStatsRow[]) ?? [];
    const totalTrades = tradeRows.length;
    const closedTrades = tradeRows.filter((t) => t.status === "closed");
    const wins = closedTrades.filter((t) => Number(t.current_pnl ?? 0) > 0).length;
    const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const monthlyPnl = tradeRows
      .filter((t) => new Date(t.executed_at).getTime() >= thirtyDaysAgo)
      .reduce((sum, t) => sum + Number(t.current_pnl ?? 0), 0);

    const copyTradeRows = (copyTrades as CopyTradeStatsRow[]) ?? [];
    const totalCopyTrades = copyTradeRows.length;
    const executedCopyTrades = copyTradeRows.filter((c) => c.status === "executed").length;
    const copyRate = totalTrades > 0 ? Math.round((executedCopyTrades / totalTrades) * 100) : 0;

    const [{ data: tierResult }, { data: snapshot }] = await Promise.all([
      this.supabase.rpc("evaluate_creator_tier", { p_creator_id: creatorId }),
      this.supabase
        .from("creator_performance_snapshots")
        .select("*")
        .eq("creator_id", creatorId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    const currentTier = (tierResult as CreatorPerformanceTier) || "starter";
    
    // Calculate progress to next tier
    let nextTierProgress;
    const stats = snapshot || { history_days: 0, win_rate: 0, roi_30d: 0 };
    
    if (currentTier === "starter") {
      const historyLeft = Math.max(0, 30 - stats.history_days);
      const roiLeft = Math.max(0, 0.05 - stats.roi_30d);
      const winLeft = Math.max(0, 0.45 - stats.win_rate);
      
      const requirements = [];
      if (historyLeft > 0) requirements.push(`${historyLeft} more days of history`);
      if (roiLeft > 0) requirements.push(`${(roiLeft * 100).toFixed(1)}% more ROI`);
      if (winLeft > 0) requirements.push(`${(winLeft * 100).toFixed(0)}% more win rate`);
      
      nextTierProgress = {
        nextTierId: "rising" as const,
        percentComplete: Math.round(((30 - historyLeft) / 30) * 100),
        remainingRequirements: requirements
      };
    } else if (currentTier === "rising") {
      const historyLeft = Math.max(0, 90 - stats.history_days);
      const roiLeft = Math.max(0, 0.12 - stats.roi_30d);
      
      nextTierProgress = {
        nextTierId: "pro" as const,
        percentComplete: Math.round(((90 - historyLeft) / 90) * 100),
        remainingRequirements: [
          historyLeft > 0 ? `${historyLeft} more days of history` : null,
          roiLeft > 0 ? `${(roiLeft * 100).toFixed(1)}% more ROI` : null,
          stats.win_rate < 0.55 ? "55% Win Rate required" : null
        ].filter((r): r is string => r !== null)
      };
    }

    return {
      subscribers,
      mrrInr,
      totalTrades,
      winRate,
      copyRate,
      totalCopyTrades,
      executedCopyTrades,
      monthlyPnl,
      currentTier,
      nextTierProgress
    };
  }

  async publishCommunityPost(input: {
    creatorId: string;
    content: string;
    visibilityTier: "free" | "pro" | "premium";
  }): Promise<{ communityPostId: string; feedItemId: string }> {
    const { data, error } = await this.supabase.rpc("publish_creator_post", {
      p_creator_id: input.creatorId,
      p_content: input.content,
      p_visibility_tier: input.visibilityTier,
    });

    if (error) throw error;
    const row = (data as PublishResultRow[] | null)?.[0];
    if (!row) throw new Error("Failed to publish community post");
    return {
      communityPostId: row.community_post_id,
      feedItemId: row.feed_item_id,
    };
  }
}
