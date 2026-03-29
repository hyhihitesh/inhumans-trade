import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseCopyTradeRepository } from "@/domain/datasources/supabase-copy-trade";

type ExecutionCallbackBody = {
  copyTradeId?: string;
  status?: "submitted" | "executed" | "failed" | "skipped";
  executedQuantity?: number;
  executionPrice?: number;
  realizedPnl?: number;
  failureReason?: string;
};

function isValidStatus(status: unknown): status is "submitted" | "executed" | "failed" | "skipped" {
  return status === "submitted" || status === "executed" || status === "failed" || status === "skipped";
}

export async function POST(request: Request) {
  const expectedSecret = process.env.COPY_TRADE_WEBHOOK_SECRET?.trim();
  const providedSecret = request.headers.get("x-copy-trade-secret")?.trim();

  if (!expectedSecret) {
    return NextResponse.json({ error: "Copy trade callback secret not configured" }, { status: 500 });
  }
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized callback" }, { status: 401 });
  }

  let body: ExecutionCallbackBody;
  try {
    body = (await request.json()) as ExecutionCallbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const copyTradeId = String(body.copyTradeId ?? "").trim();
  if (!copyTradeId) return NextResponse.json({ error: "copyTradeId is required" }, { status: 400 });
  if (!isValidStatus(body.status)) {
    return NextResponse.json({ error: "status must be one of submitted/executed/failed/skipped" }, { status: 400 });
  }

  const repo = new SupabaseCopyTradeRepository(createAdminClient());
  try {
    const updated = await repo.processExecutionUpdate({
      copyTradeId,
      status: body.status,
      executedQuantity: body.executedQuantity ?? null,
      executionPrice: body.executionPrice ?? null,
      realizedPnl: body.realizedPnl ?? null,
      failureReason: body.failureReason ?? null,
    });

    return NextResponse.json({
      ok: true,
      copyTradeId: updated.id,
      status: updated.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unable to process callback" },
      { status: 502 }
    );
  }
}

