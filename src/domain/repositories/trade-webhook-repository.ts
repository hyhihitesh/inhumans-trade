import { NormalizedTradeWebhookPayload } from "@/domain/types";

export interface PersistedTradeWebhookResult {
  auditId: string;
  tradeId: string;
  feedItemId: string;
}

export interface TradeWebhookRepository {
  persistTradeWebhook(payload: NormalizedTradeWebhookPayload): Promise<PersistedTradeWebhookResult>;
}

export class TradeWebhookRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TradeWebhookRepositoryError";
  }
}
