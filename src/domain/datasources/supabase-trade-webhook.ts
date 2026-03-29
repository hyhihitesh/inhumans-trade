import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { NormalizedTradeWebhookPayload } from "@/domain/types";
import {
  PersistedTradeWebhookResult,
  TradeWebhookRepository,
  TradeWebhookRepositoryError,
} from "@/domain/repositories/trade-webhook-repository";

interface PersistTradeWebhookRow {
  audit_id: string;
  trade_record_id: string | null;
  feed_record_id: string | null;
}

export class SupabaseTradeWebhookRepository implements TradeWebhookRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async persistTradeWebhook(payload: NormalizedTradeWebhookPayload): Promise<PersistedTradeWebhookResult> {
    const { data, error } = await this.supabase.rpc("ingest_trade_webhook", {
      p_webhook_id: payload.webhookId,
      p_source: payload.source,
      p_broker_name: payload.brokerName,
      p_broker_order_id: payload.brokerOrderId,
      p_broker_trade_id: payload.brokerTradeId,
      p_creator_id: payload.creatorId,
      p_creator_handle: payload.creatorHandle,
      p_creator_name: payload.creatorName,
      p_instrument: payload.instrument,
      p_symbol: payload.symbol,
      p_side: payload.side,
      p_status: payload.status,
      p_entry_price: payload.entryPrice,
      p_exit_price: payload.exitPrice,
      p_quantity: payload.quantity,
      p_current_pnl: payload.currentPnl,
      p_strategy: payload.strategy,
      p_executed_at: payload.executedAt,
      p_received_at: payload.receivedAt,
      p_raw_payload: payload.rawPayload,
      p_metadata: payload.metadata,
      p_request_headers: payload.requestHeaders,
    });

    if (error) throw new TradeWebhookRepositoryError(error.message);
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new TradeWebhookRepositoryError("Webhook ingest returned no result.");
    }

    const result = data[0] as PersistTradeWebhookRow;
    if (!result.trade_record_id || !result.feed_record_id) {
      throw new TradeWebhookRepositoryError("Webhook ingest failed before trade/feed persistence.");
    }
    return { auditId: result.audit_id, tradeId: result.trade_record_id, feedItemId: result.feed_record_id };
  }
}

export function createTradeWebhookRepository() {
  return new SupabaseTradeWebhookRepository(createAdminClient());
}
