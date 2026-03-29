import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireZerodhaBrokerEnv } from "@/lib/supabase/env";
import { encryptBrokerToken } from "@/lib/brokers/token-crypto";
import {
  exchangeZerodhaRequestToken,
  fetchZerodhaUserProfile,
  getNextZerodhaSessionExpiry,
  verifyBrokerOauthState,
} from "@/lib/brokers/zerodha-oauth";
import { createSupabaseBrokerAuthRepository } from "@/domain/datasources/supabase-broker-auth";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("broker_state") ?? url.searchParams.get("state");
  const requestToken = url.searchParams.get("request_token");

  if (!state || !requestToken) {
    return NextResponse.redirect(new URL("/app/settings/broker?error=Broker+authorization+did+not+complete", appUrl()));
  }

  let env;
  try {
    env = requireZerodhaBrokerEnv();
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/app/settings/broker?error=${encodeURIComponent((error as Error).message)}`, appUrl())
    );
  }

  let parsedState;
  try {
    parsedState = verifyBrokerOauthState(env.stateSecret, state);
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/app/settings/broker?error=${encodeURIComponent((error as Error).message)}`, appUrl())
    );
  }

  const repo = createSupabaseBrokerAuthRepository(createAdminClient());

  try {
    const tokenData = await exchangeZerodhaRequestToken({
      apiKey: env.apiKey,
      apiSecret: env.apiSecret,
      requestToken,
    });
    const profileData = await fetchZerodhaUserProfile({
      apiKey: env.apiKey,
      accessToken: tokenData.access_token,
    });

    await repo.storeZerodhaConnection({
      userId: parsedState.userId,
      brokerUserId: profileData.user_id ?? tokenData.user_id ?? null,
      accountLabel:
        profileData.user_name ??
        profileData.user_shortname ??
        profileData.email ??
        tokenData.user_name ??
        tokenData.user_shortname ??
        tokenData.email ??
        null,
      accessTokenCiphertext: encryptBrokerToken(env.tokenSecret, tokenData.access_token),
      refreshTokenCiphertext: tokenData.refresh_token
        ? encryptBrokerToken(env.tokenSecret, tokenData.refresh_token)
        : null,
      tokenExpiresAt: getNextZerodhaSessionExpiry(tokenData.login_time ?? null),
      scopes: ["orders.read", "positions.read", "executions.read"],
      metadata: {
        provider: "zerodha",
        publicToken: tokenData.public_token ?? null,
        email: profileData.email ?? tokenData.email ?? null,
        loginTime: tokenData.login_time ?? null,
        profileVerifiedAt: new Date().toISOString(),
        exchanges: profileData.exchanges ?? [],
        products: profileData.products ?? [],
        orderTypes: profileData.order_types ?? [],
        avatarUrl: profileData.avatar_url ?? null,
        profileMeta: profileData.meta ?? {},
      },
    });

    return NextResponse.redirect(new URL("/app/settings/broker?success=Zerodha+connected", appUrl()));
  } catch (error) {
    await repo.markBrokerReconnectRequired(parsedState.userId, (error as Error).message);
    return NextResponse.redirect(
      new URL(`/app/settings/broker?error=${encodeURIComponent((error as Error).message)}`, appUrl())
    );
  }
}
