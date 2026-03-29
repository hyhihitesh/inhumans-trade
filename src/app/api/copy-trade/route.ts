import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCopyTradeRepository } from "@/domain/datasources/supabase-copy-trade";

type CopyTradeRequestBody = {
  tradeId?: string;
  requestedQuantity?: number;
  requestedRiskPercent?: number;
  requestedCapitalInr?: number;
  idempotencyKey?: string;
};

function normalizeIdempotencyKey(input?: string) {
  if (typeof input === "string" && input.trim().length >= 8) {
    return input.trim();
  }
  return crypto.randomUUID();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: CopyTradeRequestBody;
  try {
    body = (await request.json()) as CopyTradeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tradeId = String(body.tradeId ?? "").trim();
  const requestedQuantity = Number(body.requestedQuantity ?? 0);
  const requestedRiskPercent = body.requestedRiskPercent === undefined ? null : Number(body.requestedRiskPercent);
  const requestedCapitalInr = body.requestedCapitalInr === undefined ? null : Number(body.requestedCapitalInr);
  const idempotencyKey = normalizeIdempotencyKey(body.idempotencyKey);

  if (!tradeId) {
    return NextResponse.json({ error: "tradeId is required" }, { status: 400 });
  }
  if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 1_000_000) {
    return NextResponse.json({ error: "requestedQuantity must be between 1 and 1,000,000" }, { status: 400 });
  }
  if (requestedRiskPercent !== null && (!Number.isFinite(requestedRiskPercent) || requestedRiskPercent <= 0 || requestedRiskPercent > 100)) {
    return NextResponse.json({ error: "requestedRiskPercent must be > 0 and <= 100" }, { status: 400 });
  }
  if (requestedCapitalInr !== null && (!Number.isFinite(requestedCapitalInr) || requestedCapitalInr <= 0)) {
    return NextResponse.json({ error: "requestedCapitalInr must be > 0" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: "Unable to resolve user profile" }, { status: 400 });
  }
  if (profile.role !== "follower") {
    return NextResponse.json({ error: "Only follower accounts can copy trades" }, { status: 403 });
  }

  const repo = new SupabaseCopyTradeRepository(supabase);
  try {
    const copyTrade = await repo.createCopyTradeRequest({
      followerId: profile.id,
      tradeId,
      requestedQuantity,
      requestedRiskPercent,
      requestedCapitalInr,
      idempotencyKey,
    });

    return NextResponse.json({
      ok: true,
      copyTradeId: copyTrade.id,
      status: copyTrade.status,
      idempotencyKey: copyTrade.idempotencyKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create copy trade request" },
      { status: 502 }
    );
  }
}
