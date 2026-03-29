import { BrokerName, NormalizedTradeWebhookPayload, TradeSide, TradeStatus, TradeWebhookSource } from "@/domain/types";

export interface TradeWebhookValidationIssue {
  field: string;
  message: string;
}

export class TradeWebhookValidationError extends Error {
  issues: TradeWebhookValidationIssue[];

  constructor(message: string, issues: TradeWebhookValidationIssue[] = []) {
    super(message);
    this.name = "TradeWebhookValidationError";
    this.issues = issues;
  }
}

export interface RawTradeWebhookPayload {
  webhookId?: unknown;
  eventId?: unknown;
  id?: unknown;
  source?: unknown;
  broker?: unknown;
  brokerName?: unknown;
  creatorId?: unknown;
  creatorHandle?: unknown;
  creatorName?: unknown;
  brokerOrderId?: unknown;
  orderId?: unknown;
  brokerTradeId?: unknown;
  tradeId?: unknown;
  instrument?: unknown;
  symbol?: unknown;
  tradingSymbol?: unknown;
  side?: unknown;
  transactionType?: unknown;
  status?: unknown;
  orderStatus?: unknown;
  tradeStatus?: unknown;
  entryPrice?: unknown;
  averagePrice?: unknown;
  exitPrice?: unknown;
  quantity?: unknown;
  filledQuantity?: unknown;
  currentPnl?: unknown;
  pnl?: unknown;
  strategy?: unknown;
  executedAt?: unknown;
  timestamp?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  content?: unknown;
  ctaLabel?: unknown;
  metadata?: unknown;
  [key: string]: unknown;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, field: string, issues: TradeWebhookValidationIssue[], required = true): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!required) return null;
  issues.push({ field, message: "is required" });
  return null;
}

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(
  value: unknown,
  field: string,
  issues: TradeWebhookValidationIssue[],
  required = true
): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  if (!required) return null;
  issues.push({ field, message: "must be a valid number" });
  return null;
}

function readDateTime(value: unknown, field: string, issues: TradeWebhookValidationIssue[]): string | null {
  const candidate = readString(value, field, issues);
  if (!candidate) return null;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    issues.push({ field, message: "must be a valid ISO-8601 timestamp" });
    return null;
  }
  return parsed.toISOString();
}

function normalizeBrokerName(value: unknown, issues: TradeWebhookValidationIssue[]): BrokerName {
  const raw = readOptionalString(value)?.toLowerCase();
  if (raw === "zerodha" || raw === "dhan" || raw === "angel_one" || raw === "fyers") return raw;
  issues.push({ field: "brokerName", message: "must be one of zerodha, dhan, angel_one, fyers" });
  return "zerodha";
}

function normalizeSide(value: unknown, issues: TradeWebhookValidationIssue[]): TradeSide {
  const raw = readOptionalString(value)?.toUpperCase();
  if (raw === "BUY" || raw === "SELL") return raw;
  issues.push({ field: "side", message: "must be BUY or SELL" });
  return "BUY";
}

function normalizeStatus(value: unknown, issues: TradeWebhookValidationIssue[]): TradeStatus {
  const raw = readOptionalString(value)?.toLowerCase();
  if (raw === "open" || raw === "closed" || raw === "pending") return raw;
  issues.push({ field: "status", message: "must be open, closed, or pending" });
  return "open";
}

function normalizeSource(value: unknown, fallback: BrokerName): TradeWebhookSource {
  const raw = readOptionalString(value)?.toLowerCase();
  if (raw === "api" || raw === "manual" || raw === "unknown") return raw;
  if (raw === "zerodha" || raw === "dhan" || raw === "angel_one" || raw === "fyers") return raw;
  return fallback;
}

function asRecordMetadata(value: unknown): Record<string, unknown> {
  return isPlainRecord(value) ? value : {};
}

function firstDefined(...values: unknown[]): unknown {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function deriveWebhookId(input: RawTradeWebhookPayload, brokerOrderId: string, side: TradeSide, quantity: number): string {
  return (
    readOptionalString(firstDefined(input.webhookId, input.eventId, input.id)) ??
    `${brokerOrderId}:${side}:${quantity}`
  );
}

export function normalizeTradeWebhookPayload(
  input: unknown,
  receivedAt = new Date().toISOString()
): NormalizedTradeWebhookPayload {
  if (!isPlainRecord(input)) {
    throw new TradeWebhookValidationError("Webhook payload must be a JSON object.");
  }

  const payload = input as RawTradeWebhookPayload;
  const issues: TradeWebhookValidationIssue[] = [];

  const brokerName = normalizeBrokerName(firstDefined(payload.brokerName, payload.broker), issues);
  const brokerOrderId = readString(firstDefined(payload.brokerOrderId, payload.orderId), "brokerOrderId", issues);
  const creatorId = readString(payload.creatorId, "creatorId", issues);
  const instrument = readString(firstDefined(payload.instrument, payload.symbol, payload.tradingSymbol), "instrument", issues);
  const symbol = readString(firstDefined(payload.symbol, payload.tradingSymbol, payload.instrument), "symbol", issues);
  const side = normalizeSide(firstDefined(payload.side, payload.transactionType), issues);
  const status = normalizeStatus(firstDefined(payload.status, payload.orderStatus, payload.tradeStatus), issues);
  const entryPrice = readNumber(firstDefined(payload.entryPrice, payload.averagePrice), "entryPrice", issues);
  const quantity = readNumber(firstDefined(payload.quantity, payload.filledQuantity), "quantity", issues);
  const currentPnl = readNumber(firstDefined(payload.currentPnl, payload.pnl), "currentPnl", issues, false) ?? 0;
  const executedAt = readDateTime(firstDefined(payload.executedAt, payload.timestamp, payload.createdAt, payload.updatedAt), "executedAt", issues);
  const exitPrice = readNumber(payload.exitPrice, "exitPrice", issues, false);
  const creatorHandle = readOptionalString(payload.creatorHandle);
  const creatorName = readOptionalString(payload.creatorName);
  const strategy = readOptionalString(payload.strategy) ?? "discretionary";

  if (
    issues.length > 0 ||
    !brokerOrderId ||
    !creatorId ||
    !instrument ||
    !symbol ||
    entryPrice === null ||
    quantity === null ||
    !executedAt
  ) {
    throw new TradeWebhookValidationError("Invalid trade webhook payload.", issues);
  }

  const rawPayload = asRecordMetadata(input);
  const metadata = asRecordMetadata(payload.metadata);
  const source = normalizeSource(payload.source, brokerName);
  const webhookId = deriveWebhookId(payload, brokerOrderId, side, quantity);

  return {
    webhookId,
    source,
    brokerName,
    brokerOrderId,
    brokerTradeId: readOptionalString(firstDefined(payload.brokerTradeId, payload.tradeId)),
    creatorId,
    creatorHandle,
    creatorName,
    instrument,
    symbol,
    side,
    status,
    entryPrice,
    exitPrice: exitPrice ?? null,
    quantity,
    currentPnl,
    strategy,
    executedAt,
    receivedAt,
    rawPayload,
    metadata,
    requestHeaders: {},
  };
}
