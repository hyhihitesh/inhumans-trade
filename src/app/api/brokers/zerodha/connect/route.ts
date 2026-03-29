import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireZerodhaBrokerEnv } from "@/lib/supabase/env";
import { buildZerodhaConnectUrl, createBrokerOauthState } from "@/lib/brokers/zerodha-oauth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in?next=/app/settings/broker", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "creator") {
    return NextResponse.redirect(new URL("/app/settings/broker?error=Only+creator+accounts+can+connect+a+broker", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  let env;
  try {
    env = requireZerodhaBrokerEnv();
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/app/settings/broker?error=${encodeURIComponent((error as Error).message)}`,
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      )
    );
  }

  const state = createBrokerOauthState(env.stateSecret, {
    broker: "zerodha",
    userId: user.id,
    nonce: crypto.randomUUID(),
    issuedAt: Date.now(),
  });

  return NextResponse.redirect(buildZerodhaConnectUrl({
    apiKey: env.apiKey,
    redirectParams: {
      broker_state: state,
    },
  }));
}
