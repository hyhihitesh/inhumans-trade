import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseOnboardingRepository } from "@/domain/datasources/supabase-onboarding";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app/onboarding";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const role = (data.user.user_metadata?.role as "creator" | "follower" | undefined) ?? "follower";
      const name = (data.user.user_metadata?.full_name as string | undefined) ?? (data.user.user_metadata?.name as string | undefined) ?? null;
      const repo = new SupabaseOnboardingRepository(supabase);
      await repo.ensureProfile(data.user.id, { name, role });
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/sign-in?error=Unable+to+authenticate", url.origin));
}

