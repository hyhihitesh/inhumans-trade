import { describe, expect, it } from "vitest";
import { normalizeTradeWebhookPayload, TradeWebhookValidationError } from "@/domain/trade-webhook";

describe("normalizeTradeWebhookPayload", () => {
  it("normalizes a valid broker payload", () => {
    const normalized = normalizeTradeWebhookPayload(
      {
        eventId: "evt_001",
        brokerName: "Zerodha",
        source: "kite",
        creatorId: "11111111-1111-1111-1111-111111111111",
        creatorHandle: "arjun",
        creatorName: "Arjun Rao",
        orderId: "order_001",
        tradeId: "trade_001",
        instrument: "NIFTY 50 FUT",
        symbol: "NIFTYFUT",
        transactionType: "buy",
        orderStatus: "open",
        averagePrice: "24123.5",
        quantity: "25",
        pnl: "1250.75",
        executedAt: "2026-03-28T10:00:00.000Z",
      },
      "2026-03-28T10:00:01.000Z"
    );

    expect(normalized.webhookId).toBe("evt_001");
    expect(normalized.brokerName).toBe("zerodha");
    expect(normalized.side).toBe("BUY");
    expect(normalized.status).toBe("open");
    expect(normalized.entryPrice).toBe(24123.5);
    expect(normalized.quantity).toBe(25);
    expect(normalized.currentPnl).toBe(1250.75);
    expect(normalized.receivedAt).toBe("2026-03-28T10:00:01.000Z");
  });

  it("throws validation errors on missing required fields", () => {
    expect(() =>
      normalizeTradeWebhookPayload({
        brokerName: "zerodha",
      })
    ).toThrowError(TradeWebhookValidationError);
  });
});
