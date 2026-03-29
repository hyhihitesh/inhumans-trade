import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseOnboardingRepository } from "@/domain/datasources/supabase-onboarding";
import { OnboardingState, Role, UserProfile } from "@/domain/types";

function normalizeRole(raw: unknown): Role {
  return raw === "creator" ? "creator" : "follower";
}

export async function requireAuthenticatedSession(nextPath = "/app") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}

export async function requireUserProfile(nextPath = "/app"): Promise<{
  profile: UserProfile;
  onboarding: OnboardingState;
}> {
  const { supabase, user } = await requireAuthenticatedSession(nextPath);
  const repo = new SupabaseOnboardingRepository(supabase);

  const metadata = user.user_metadata ?? {};
  const role = normalizeRole(metadata.role);
  const name =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  const profile = (await repo.getProfile(user.id)) ?? (await repo.ensureProfile(user.id, { name, role }));
  const onboarding = await repo.getOnboardingState(user.id);

  return { profile, onboarding };
}

