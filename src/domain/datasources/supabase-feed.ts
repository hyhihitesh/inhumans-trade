import { SupabaseClient } from "@supabase/supabase-js";
import {
  FeedRepository,
  FeedRepositoryError,
  getFreshnessState,
  normalizeTradeStatus,
} from "@/domain/repositories/feed-repository";
import { FeedItem, Role, Trade, TradeSide } from "@/domain/types";

interface FeedItemRow {
  id: string;
  type: FeedItem["type"];
  creator_id: string;
  trade_id: string | null;
  content: string | null;
  cta_label: string | null;
  published_at: string;
  metadata: {
    visibilityTier?: string;
    communityPostId?: string;
  } | null;
  visibility_tier?: "free" | "pro" | "premium";
  is_locked?: boolean;
}

interface TradeRow {
  id: string;
  creator_id: string;
  broker_name: Trade["brokerName"];
  broker_order_id: string;
  source: string;
  instrument: string;
  symbol: string;
  side: TradeSide;
  status: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  current_pnl: number;
  strategy: string;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  handle: string | null;
  name: string | null;
  role: Role;
}

function toTradeDomain(row: TradeRow, copyCount = 0): Trade {
  const freshnessDate = row.updated_at || row.executed_at || row.created_at;
  return {
    id: row.id,
    creatorId: row.creator_id,
    brokerName: row.broker_name,
    brokerOrderId: row.broker_order_id,
    source: row.source,
    instrument: row.instrument,
    symbol: row.symbol,
    side: row.side,
    entryPrice: Number(row.entry_price),
    exitPrice: row.exit_price ? Number(row.exit_price) : null,
    quantity: Number(row.quantity),
    currentPnl: Number(row.current_pnl),
    status: normalizeTradeStatus(row.status),
    freshness: getFreshnessState(new Date(freshnessDate)),
    createdAt: row.created_at,
    executedAt: row.executed_at,
    updatedAt: row.updated_at,
    strategy: row.strategy,
    copyCount,
    commentCount: 0, // Placeholder until comments are implemented
  };
}

export class SupabaseFeedRepository implements FeedRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listFeedItems(limit = 30, viewerId?: string): Promise<FeedItem[]> {
    const { data: feedRows, error: feedError } = viewerId
      ? await this.supabase.rpc("list_feed_items_for_viewer", { p_limit: limit })
      : await this.supabase
          .from("feed_items")
          .select("id, type, creator_id, trade_id, content, cta_label, published_at, metadata")
          .order("published_at", { ascending: false })
          .limit(limit);

    if (feedError) throw new FeedRepositoryError(feedError.message);
    if (!feedRows || feedRows.length === 0) return [];

    const typedFeedRows = feedRows as unknown as FeedItemRow[];
    const creatorIds = Array.from(new Set(typedFeedRows.map((row) => row.creator_id)));
    const tradeIds = Array.from(
      new Set(typedFeedRows.map((row) => row.trade_id).filter((value): value is string => Boolean(value)))
    );

    const [
      { data: profileRows, error: profileError }, 
      { data: tradeRows, error: tradeError },
      { data: copyCounts, error: copyCountError }
    ] =
      await Promise.all([
        this.supabase.from("profiles").select("id, handle, name, role").in("id", creatorIds),
        tradeIds.length === 0
          ? Promise.resolve({ data: [] as TradeRow[], error: null })
          : this.supabase
              .from("trades")
              .select(
                "id, creator_id, broker_name, broker_order_id, source, instrument, symbol, side, status, entry_price, exit_price, quantity, current_pnl, strategy, executed_at, created_at, updated_at"
              )
              .in("id", tradeIds),
        tradeIds.length === 0
          ? Promise.resolve({ data: [], error: null })
          : this.supabase
              .from("copy_trades")
              .select("trade_id")
              .in("trade_id", tradeIds)
      ]);

    if (profileError) throw new FeedRepositoryError(profileError.message);
    if (tradeError) throw new FeedRepositoryError(tradeError.message);
    if (copyCountError) throw new FeedRepositoryError(copyCountError.message);

    // Group copy counts
    const countsMap = new Map<string, number>();
    (copyCounts as { trade_id: string }[]).forEach(row => {
      countsMap.set(row.trade_id, (countsMap.get(row.trade_id) || 0) + 1);
    });

    const profileMap = new Map((profileRows as ProfileRow[]).map((profile) => [profile.id, profile]));
    const tradeMap = new Map((tradeRows as TradeRow[]).map((trade) => [trade.id, toTradeDomain(trade, countsMap.get(trade.id) || 0)]));

    return typedFeedRows.map((row) => {
      const profile = profileMap.get(row.creator_id);
      const visibilityTier = (row.visibility_tier ?? row.metadata?.visibilityTier ?? "free") as
        | "free"
        | "pro"
        | "premium";
      const isLocked = Boolean(row.is_locked);

      return {
        id: row.id,
        type: row.type,
        createdAt: row.published_at,
        creator: {
          id: row.creator_id,
          handle: profile?.handle ?? "unknown_creator",
          name: profile?.name ?? "Unknown Creator",
          role: profile?.role ?? "creator",
        },
        trade: row.trade_id ? tradeMap.get(row.trade_id) : undefined,
        content: row.content ?? undefined,
        ctaLabel: row.cta_label ?? undefined,
        visibilityTier,
        isLocked,
      };
    });
  }

  async listCreatorTrades(creatorId: string, limit = 20): Promise<Trade[]> {
    const { data, error } = await this.supabase
      .from("trades")
      .select(
        "id, creator_id, broker_name, broker_order_id, source, instrument, symbol, side, status, entry_price, exit_price, quantity, current_pnl, strategy, executed_at, created_at, updated_at"
      )
      .eq("creator_id", creatorId)
      .order("executed_at", { ascending: false })
      .limit(limit);

    if (error) throw new FeedRepositoryError(error.message);
    
    // Fetch copy counts for these trades
    const tradeIds = (data as TradeRow[]).map(t => t.id);
    const { data: copyCounts } = await this.supabase
      .from("copy_trades")
      .select("trade_id")
      .in("trade_id", tradeIds);

    const countsMap = new Map<string, number>();
    (copyCounts as { trade_id: string }[] || []).forEach(row => {
      countsMap.set(row.trade_id, (countsMap.get(row.trade_id) || 0) + 1);
    });

    return (data as TradeRow[]).map(t => toTradeDomain(t, countsMap.get(t.id) || 0));
  }

  async getTradeById(tradeId: string): Promise<Trade | null> {
    const [{ data: trade, error }] = await Promise.all([
      this.supabase
        .from("trades")
        .select(
          "id, creator_id, broker_name, broker_order_id, source, instrument, symbol, side, status, entry_price, exit_price, quantity, current_pnl, strategy, executed_at, created_at, updated_at"
        )
        .eq("id", tradeId)
        .maybeSingle(),
      this.supabase
        .from("copy_trades")
        .select("id", { count: "exact", head: true })
        .eq("trade_id", tradeId)
    ]);

    if (error) throw new FeedRepositoryError(error.message);
    if (!trade) return null;
    
    // Using a separate count for maybeSingle or just fetching it
    const { count } = await this.supabase
      .from("copy_trades")
      .select("id", { count: "exact", head: true })
      .eq("trade_id", tradeId);

    return toTradeDomain(trade as TradeRow, count || 0);
  }
}

export function createSupabaseFeedRepository(supabase: SupabaseClient) {
  return new SupabaseFeedRepository(supabase);
}
