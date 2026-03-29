import { AlertPreferences, CopyTrade, PortfolioSummary } from "@/domain/types";

export interface CreateCopyTradeInput {
  followerId: string;
  tradeId: string;
  requestedQuantity: number;
  requestedRiskPercent?: number | null;
  requestedCapitalInr?: number | null;
  idempotencyKey: string;
}

export interface CopyTradeRepository {
  createCopyTradeRequest(input: CreateCopyTradeInput): Promise<CopyTrade>;
  processExecutionUpdate(input: {
    copyTradeId: string;
    status: "submitted" | "executed" | "failed" | "skipped";
    executedQuantity?: number | null;
    executionPrice?: number | null;
    realizedPnl?: number | null;
    failureReason?: string | null;
  }): Promise<CopyTrade>;
  listFollowerCopyTrades(followerId: string, limit?: number): Promise<CopyTrade[]>;
  getFollowerPortfolioSummary(followerId: string): Promise<PortfolioSummary>;
  getAlertPreferences(userId: string): Promise<AlertPreferences>;
  updateAlertPreferences(userId: string, patch: Partial<Omit<AlertPreferences, "userId" | "updatedAt">>): Promise<AlertPreferences>;
}
