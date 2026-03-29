import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseBrokerAuthRepository } from "@/domain/datasources/supabase-broker-auth";
import { createTradeWebhookRepository } from "@/domain/datasources/supabase-trade-webhook";
import { requireZerodhaBrokerEnv } from "@/lib/supabase/env";
import { verifyZerodhaPostbackChecksum } from "@/lib/brokers/zerodha-oauth";
import { captureServerEvent } from "@/lib/posthog";

export async function POST(request: Request) {
  try {
    const { apiSecret } = requireZerodhaBrokerEnv();
    const payload = await request.json();

    // 1. Basic Validation
    if (!payload.order_id || !payload.order_timestamp || !payload.checksum || !payload.user_id) {
      return NextResponse.json({ error: "Missing required Zerodha postback fields." }, { status: 400 });
    }

    // 2. Checksum Verification
    const isValid = verifyZerodhaPostbackChecksum({
      apiSecret,
      orderId: payload.order_id,
      orderTimestamp: payload.order_timestamp,
      checksum: payload.checksum,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid postback checksum." }, { status: 401 });
    }

    // 3. User Mapping (Admin client needed to check other users' connections)
    const admin = createAdminClient();
    const authRepo = createSupabaseBrokerAuthRepository(admin);
    const userId = await authRepo.getUserIdByBrokerUserId("zerodha", payload.user_id);

    if (!userId) {
      // Log this but return 200 to acknowledge the webhook from Zerodha's perspective
      console.warn(`[Zerodha Webhook] No system user found for Zerodha user_id: ${payload.user_id}`);
      return NextResponse.json({ ok: false, message: "User not recognized." }, { status: 200 });
    }

    // 4. Status Filtering
    if (payload.status !== "COMPLETE") {
      return NextResponse.json({ ok: true, message: `Ignored status: ${payload.status}` }, { status: 200 });
    }

    // 5. Normalization & Ingestion
    const tradeRepo = createTradeWebhookRepository();
    const result = await tradeRepo.persistTradeWebhook({
      webhookId: `zerodha:${payload.order_id}`,
      source: "zerodha",
      brokerName: "zerodha",
      brokerOrderId: payload.order_id,
      brokerTradeId: payload.exchange_order_id || null,
      creatorId: userId,
      creatorHandle: null, // Will be filled by DB logic if needed
      creatorName: null,
      instrument: payload.tradingsymbol,
      symbol: payload.tradingsymbol,
      side: payload.transaction_type as "BUY" | "SELL",
      status: "closed", // COMPLETE orders are considered closed trades in this context
      entryPrice: payload.average_price,
      exitPrice: null,
      quantity: payload.filled_quantity,
      currentPnl: 0,
      strategy: "discretionary",
      executedAt: new Date(payload.order_timestamp).toISOString(),
      receivedAt: new Date().toISOString(),
      rawPayload: payload,
      metadata: {},
      requestHeaders: {},
    });

    // 6. Impact Tracking
    await captureServerEvent(userId, "trade_captured", {
      broker: "zerodha",
      symbol: payload.tradingsymbol,
      side: payload.transaction_type,
      status: "closed",
      source: "zerodha",
      order_id: payload.order_id,
    });

    return NextResponse.json({
      ok: true,
      tradeId: result.tradeId,
      feedItemId: result.feedItemId,
    }, { status: 201 });

  } catch (error) {
    console.error("[Zerodha Webhook Error]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
