import { NextResponse } from "next/server";
import { createTradeWebhookRepository } from "@/domain/datasources/supabase-trade-webhook";
import { TradeWebhookRepositoryError } from "@/domain/repositories/trade-webhook-repository";
import {
  normalizeTradeWebhookPayload,
  TradeWebhookValidationError,
} from "@/domain/trade-webhook";
import type { NormalizedTradeWebhookPayload } from "@/domain/types";

function getProvidedSecret(headers: Headers): string | null {
  const direct = headers.get("x-broker-webhook-secret") ?? headers.get("x-webhook-secret");
  if (direct?.trim()) return direct.trim();

  const authorization = headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    if (token) return token;
  }

  return null;
}

function safeHeaders(headers: Headers): Record<string, string> {
  const redacted = new Set(["x-broker-webhook-secret", "x-webhook-secret", "authorization"]);
  const snapshot: Record<string, string> = {};

  headers.forEach((value, key) => {
    if (!redacted.has(key.toLowerCase())) {
      snapshot[key] = value;
    }
  });

  return snapshot;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.BROKER_WEBHOOK_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const providedSecret = getProvidedSecret(request.headers);
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Webhook payload must be valid JSON." }, { status: 400 });
  }

  let normalized: NormalizedTradeWebhookPayload;
  try {
    normalized = normalizeTradeWebhookPayload(rawBody);
  } catch (error) {
    if (error instanceof TradeWebhookValidationError) {
      return NextResponse.json(
        { error: error.message, issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const repo = createTradeWebhookRepository();

  try {
    const result = await repo.persistTradeWebhook({
      ...normalized,
      requestHeaders: safeHeaders(request.headers),
    });

    return NextResponse.json(
      {
        ok: true,
        tradeId: result.tradeId,
        feedItemId: result.feedItemId,
        auditId: result.auditId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof TradeWebhookRepositoryError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: "Failed to persist trade webhook." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
