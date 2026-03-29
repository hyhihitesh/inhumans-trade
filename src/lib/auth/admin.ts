import { redirect } from "next/navigation";
import { requireAuthenticatedSession, requireUserProfile } from "@/lib/auth/session";
import { getAdminEmails } from "@/lib/supabase/env";

export async function requireAdminUser(nextPath = "/app/admin/moderation") {
  const { supabase, user } = await requireAuthenticatedSession(nextPath);
  const { profile, onboarding } = await requireUserProfile(nextPath);
  const admins = getAdminEmails();
  const email = user.email?.toLowerCase() ?? "";

  if (!admins.includes(email)) {
    redirect("/app?error=admin_access_required");
  }

  return { supabase, user, profile, onboarding };
}
