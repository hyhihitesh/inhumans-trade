import { FreshnessState, FeedItem, Trade, TradeStatus } from "@/domain/types";

export interface FeedRepository {
  listFeedItems(limit?: number, viewerId?: string): Promise<FeedItem[]>;
  listCreatorTrades(creatorId: string, limit?: number, viewerId?: string): Promise<Trade[]>;
  getTradeById(tradeId: string, viewerId?: string): Promise<Trade | null>;
}

export class FeedRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedRepositoryError";
  }
}

export function getFreshnessState(updatedAt: Date, now = new Date()): FreshnessState {
  const ageMinutes = (now.getTime() - updatedAt.getTime()) / 60000;
  if (ageMinutes < 5) return "hot";
  if (ageMinutes <= 30) return "warm";
  return "cold";
}

export function normalizeTradeStatus(status: string): TradeStatus {
  if (status === "pending") return "pending";
  if (status === "closed") return "closed";
  return "open";
}
