import { SupabaseClient } from "@supabase/supabase-js";
import { AlertPreferences, CopyTrade, CopyTradeStatus, PortfolioSummary, TradeSide } from "@/domain/types";
import { CopyTradeRepository, CreateCopyTradeInput } from "@/domain/repositories/copy-trade-repository";

type CopyTradeRow = {
  id: string;
  follower_id: string;
  creator_id: string;
  trade_id: string;
  status: CopyTradeStatus;
  side: TradeSide;
  symbol: string;
  instrument: string;
  requested_quantity: number;
  executed_quantity: number | null;
  requested_risk_percent: number | null;
  requested_capital_inr: number | null;
  execution_price: number | null;
  realized_pnl: number | null;
  failure_reason: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
};

type AlertPreferenceRow = {
  user_id: string;
  trade_alerts_enabled: boolean;
  subscription_alerts_enabled: boolean;
  marketing_alerts_enabled: boolean;
  updated_at: string;
};

function toCopyTrade(row: CopyTradeRow): CopyTrade {
  return {
    id: row.id,
    followerId: row.follower_id,
    creatorId: row.creator_id,
    tradeId: row.trade_id,
    status: row.status,
    side: row.side,
    symbol: row.symbol,
    instrument: row.instrument,
    requestedQuantity: Number(row.requested_quantity),
    executedQuantity: row.executed_quantity === null ? null : Number(row.executed_quantity),
    requestedRiskPercent: row.requested_risk_percent === null ? null : Number(row.requested_risk_percent),
    requestedCapitalInr: row.requested_capital_inr === null ? null : Number(row.requested_capital_inr),
    executionPrice: row.execution_price === null ? null : Number(row.execution_price),
    realizedPnl: row.realized_pnl === null ? null : Number(row.realized_pnl),
    failureReason: row.failure_reason,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAlertPreferences(row: AlertPreferenceRow): AlertPreferences {
  return {
    userId: row.user_id,
    tradeAlertsEnabled: row.trade_alerts_enabled,
    subscriptionAlertsEnabled: row.subscription_alerts_enabled,
    marketingAlertsEnabled: row.marketing_alerts_enabled,
    updatedAt: row.updated_at,
  };
}

export class SupabaseCopyTradeRepository implements CopyTradeRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createCopyTradeRequest(input: CreateCopyTradeInput): Promise<CopyTrade> {
    const { data, error } = await this.supabase.rpc("create_copy_trade_request", {
      p_follower_id: input.followerId,
      p_trade_id: input.tradeId,
      p_requested_quantity: input.requestedQuantity,
      p_requested_risk_percent: input.requestedRiskPercent ?? null,
      p_requested_capital_inr: input.requestedCapitalInr ?? null,
      p_idempotency_key: input.idempotencyKey,
    });

    if (error) throw error;
    const row = (data as CopyTradeRow[] | null)?.[0];
    if (!row) throw new Error("Failed to create copy trade request");
    return toCopyTrade(row);
  }

  async listFollowerCopyTrades(followerId: string, limit = 50): Promise<CopyTrade[]> {
    const { data, error } = await this.supabase
      .from("copy_trades")
      .select(
        "id, follower_id, creator_id, trade_id, status, side, symbol, instrument, requested_quantity, executed_quantity, requested_risk_percent, requested_capital_inr, execution_price, realized_pnl, failure_reason, idempotency_key, created_at, updated_at"
      )
      .eq("follower_id", followerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data as CopyTradeRow[]) ?? []).map(toCopyTrade);
  }

  async processExecutionUpdate(input: {
    copyTradeId: string;
    status: "submitted" | "executed" | "failed" | "skipped";
    executedQuantity?: number | null;
    executionPrice?: number | null;
    realizedPnl?: number | null;
    failureReason?: string | null;
  }): Promise<CopyTrade> {
    const { data, error } = await this.supabase.rpc("process_copy_trade_execution", {
      p_copy_trade_id: input.copyTradeId,
      p_status: input.status,
      p_executed_quantity: input.executedQuantity ?? null,
      p_execution_price: input.executionPrice ?? null,
      p_realized_pnl: input.realizedPnl ?? null,
      p_failure_reason: input.failureReason ?? null,
    });

    if (error) throw error;
    const row = (data as CopyTradeRow[] | null)?.[0];
    if (!row) throw new Error("Failed to process copy trade execution update");
    return toCopyTrade(row);
  }

  async getFollowerPortfolioSummary(followerId: string): Promise<PortfolioSummary> {
    const { data, error } = await this.supabase
      .from("copy_trades")
      .select("status, realized_pnl")
      .eq("follower_id", followerId);

    if (error) throw error;

    const rows = (data as { status: CopyTradeStatus; realized_pnl: number | null }[]) ?? [];
    let executedTrades = 0;
    let openTrades = 0;
    let failedTrades = 0;
    let totalRealizedPnl = 0;

    for (const row of rows) {
      if (row.status === "executed") {
        executedTrades += 1;
      } else if (row.status === "submitted" || row.status === "pending") {
        openTrades += 1;
      } else if (row.status === "failed" || row.status === "skipped") {
        failedTrades += 1;
      }
      totalRealizedPnl += Number(row.realized_pnl ?? 0);
    }

    return {
      totalCopyTrades: rows.length,
      executedTrades,
      openTrades,
      failedTrades,
      totalRealizedPnl,
    };
  }

  async getAlertPreferences(userId: string): Promise<AlertPreferences> {
    const { data, error } = await this.supabase
      .from("user_alert_preferences")
      .select("user_id, trade_alerts_enabled, subscription_alerts_enabled, marketing_alerts_enabled, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (data) return toAlertPreferences(data as AlertPreferenceRow);

    const { data: inserted, error: insertError } = await this.supabase
      .from("user_alert_preferences")
      .insert({ user_id: userId })
      .select("user_id, trade_alerts_enabled, subscription_alerts_enabled, marketing_alerts_enabled, updated_at")
      .single();

    if (insertError) throw insertError;
    return toAlertPreferences(inserted as AlertPreferenceRow);
  }

  async updateAlertPreferences(
    userId: string,
    patch: Partial<Omit<AlertPreferences, "userId" | "updatedAt">>
  ): Promise<AlertPreferences> {
    const payload = {
      trade_alerts_enabled: patch.tradeAlertsEnabled,
      subscription_alerts_enabled: patch.subscriptionAlertsEnabled,
      marketing_alerts_enabled: patch.marketingAlertsEnabled,
    };

    const { data, error } = await this.supabase
      .from("user_alert_preferences")
      .upsert({ user_id: userId, ...payload }, { onConflict: "user_id" })
      .select("user_id, trade_alerts_enabled, subscription_alerts_enabled, marketing_alerts_enabled, updated_at")
      .single();

    if (error) throw error;
    return toAlertPreferences(data as AlertPreferenceRow);
  }
}
