"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseOnboardingRepository } from "@/domain/datasources/supabase-onboarding";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const next = String(formData.get("next") ?? "/app");

  if (!email || !password) {
    redirect("/auth/sign-in?error=Missing+credentials");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect(next || "/app");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "follower") as "creator" | "follower";

  if (!email || !password) {
    redirect("/auth/sign-up?error=Missing+credentials");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, role } } });

  if (error) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    const repo = new SupabaseOnboardingRepository(supabase);
    await repo.ensureProfile(data.user.id, { name: name || null, role });
  }

  redirect("/app/onboarding");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(error?.message ?? "OAuth failed")}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

