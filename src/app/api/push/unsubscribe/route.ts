import { NextResponse } from "next/server";
import { SupabasePushRepository } from "@/domain/datasources/supabase-push";
import { requireAuthenticatedSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { supabase, user } = await requireAuthenticatedSession("/app/settings/alerts");
  const payload = await request.json();
  const endpoint = String(payload?.endpoint ?? "").trim();
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
  }

  const repo = new SupabasePushRepository(supabase);
  await repo.disablePushSubscription(endpoint, user.id);
  return NextResponse.json({ ok: true });
}
