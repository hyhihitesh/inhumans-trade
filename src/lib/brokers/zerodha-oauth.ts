import "server-only";

import crypto from "node:crypto";
import { BrokerName } from "@/domain/types";

type BrokerOauthState = {
  broker: BrokerName;
  userId: string;
  nonce: string;
  issuedAt: number;
};

export type ZerodhaTokenExchange = {
  access_token: string;
  refresh_token?: string;
  public_token?: string;
  user_id?: string;
  user_shortname?: string;
  user_name?: string;
  email?: string;
  login_time?: string;
};

export type ZerodhaProfile = {
  user_id?: string;
  user_name?: string;
  user_shortname?: string;
  email?: string;
  exchanges?: string[];
  products?: string[];
  order_types?: string[];
  avatar_url?: string | null;
  meta?: Record<string, unknown>;
};

function signPayload(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createBrokerOauthState(secret: string, state: BrokerOauthState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const signature = signPayload(secret, payload);
  return `${payload}.${signature}`;
}

export function verifyBrokerOauthState(secret: string, rawState: string, maxAgeMs = 10 * 60 * 1000) {
  const [payload, signature] = rawState.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid broker OAuth state payload.");
  }

  const expected = signPayload(secret, payload);
  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    throw new Error("Invalid broker OAuth state signature.");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as BrokerOauthState;
  if (Date.now() - decoded.issuedAt > maxAgeMs) {
    throw new Error("Broker OAuth state expired.");
  }

  return decoded;
}

export function buildZerodhaConnectUrl(input: {
  apiKey: string;
  redirectParams?: Record<string, string>;
}) {
  const url = new URL("https://kite.zerodha.com/connect/login");
  url.searchParams.set("v", "3");
  url.searchParams.set("api_key", input.apiKey);
  if (input.redirectParams && Object.keys(input.redirectParams).length > 0) {
    url.searchParams.set("redirect_params", new URLSearchParams(input.redirectParams).toString());
  }
  return url.toString();
}

export function buildZerodhaChecksum(input: {
  apiKey: string;
  apiSecret: string;
  requestToken: string;
}) {
  return crypto
    .createHash("sha256")
    .update(`${input.apiKey}${input.requestToken}${input.apiSecret}`)
    .digest("hex");
}

export async function exchangeZerodhaRequestToken(input: {
  apiKey: string;
  apiSecret: string;
  requestToken: string;
}) {
  const checksum = buildZerodhaChecksum(input);
  const response = await fetch("https://api.kite.trade/session/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Kite-Version": "3",
    },
    body: new URLSearchParams({
      api_key: input.apiKey,
      request_token: input.requestToken,
      checksum,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: ZerodhaTokenExchange;
  };

  if (!response.ok || payload.status !== "success" || !payload.data?.access_token) {
    throw new Error(payload.message ?? "Unable to exchange Zerodha request token.");
  }

  return payload.data;
}

export async function invalidateZerodhaAccessToken(input: {
  apiKey: string;
  accessToken: string;
}) {
  const url = new URL("https://api.kite.trade/session/token");
  url.searchParams.set("api_key", input.apiKey);
  url.searchParams.set("access_token", input.accessToken);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-Kite-Version": "3",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: boolean;
  };

  if (!response.ok || payload.status !== "success") {
    throw new Error(payload.message ?? "Unable to invalidate Zerodha access token.");
  }

  return payload.data === true;
}

export async function fetchZerodhaUserProfile(input: {
  apiKey: string;
  accessToken: string;
}) {
  const response = await fetch("https://api.kite.trade/user/profile", {
    method: "GET",
    headers: {
      "X-Kite-Version": "3",
      Authorization: `token ${input.apiKey}:${input.accessToken}`,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: ZerodhaProfile;
  };

  if (!response.ok || payload.status !== "success" || !payload.data?.user_id) {
    throw new Error(payload.message ?? "Unable to verify Zerodha user profile.");
  }

  return payload.data;
}

export function getNextZerodhaSessionExpiry(loginTime?: string | null) {
  const now = loginTime ? new Date(loginTime) : new Date();
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const istNow = new Date(utcMillis + 5.5 * 60 * 60 * 1000);

  const expiryIst = new Date(istNow);
  expiryIst.setDate(expiryIst.getDate() + 1);
  expiryIst.setHours(6, 0, 0, 0);

  const expiryUtcMillis = expiryIst.getTime() - 5.5 * 60 * 60 * 1000;
  return new Date(expiryUtcMillis).toISOString();
}

export function isZerodhaSessionExpired(tokenExpiresAt?: string | null, now = new Date()) {
  if (!tokenExpiresAt) return false;
  const expiresAt = new Date(tokenExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return false;
  return expiresAt.getTime() <= now.getTime();
}

/**
 * Verifies the checksum of a Zerodha postback webhook.
 * Formula: SHA-256(order_id + order_timestamp + api_secret)
 */
export function verifyZerodhaPostbackChecksum(input: {
  apiSecret: string;
  orderId: string;
  orderTimestamp: string;
  checksum: string;
}): boolean {
  const expected = crypto
    .createHash("sha256")
    .update(`${input.orderId}${input.orderTimestamp}${input.apiSecret}`)
    .digest("hex");

  return input.checksum === expected;
}
