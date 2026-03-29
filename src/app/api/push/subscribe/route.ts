import { NextResponse } from "next/server";
import { SupabasePushRepository } from "@/domain/datasources/supabase-push";
import { requireAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { supabase, user } = await requireAuthenticatedSession("/app/settings/alerts");
  const payload = await request.json();
  const keys = payload?.keys ?? {};
  if (!payload?.endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid push subscription payload." }, { status: 400 });
  }

  const repo = new SupabasePushRepository(supabase);
  await repo.upsertPushSubscription({
    userId: user.id,
    endpoint: payload.endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  });

  return NextResponse.json({ ok: true });
}
