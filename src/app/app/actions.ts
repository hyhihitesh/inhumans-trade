"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SupabaseOnboardingRepository } from "@/domain/datasources/supabase-onboarding";
import { createSupabaseBrokerAuthRepository } from "@/domain/datasources/supabase-broker-auth";
import { Role } from "@/domain/types";
import { requireAuthenticatedSession } from "@/lib/auth/session";
import { invalidateZerodhaAccessToken } from "@/lib/brokers/zerodha-oauth";
import { decryptBrokerToken } from "@/lib/brokers/token-crypto";
import { requireZerodhaSessionEnv } from "@/lib/supabase/env";
import { captureServerEvent } from "@/lib/posthog";

function parseRole(value: string | null): Role | null {
  if (value === "creator" || value === "follower") return value;
  return null;
}

function parseStep(value: unknown): 1 | 2 | 3 | 4 | 5 {
  const numeric = Number(value ?? 1);
  if (Number.isNaN(numeric) || numeric < 1) return 1;
  if (numeric > 5) return 5;
  return numeric as 1 | 2 | 3 | 4 | 5;
}

export async function saveOnboardingAction(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedSession("/app/onboarding");
  const repo = new SupabaseOnboardingRepository(supabase);

  const existing = await repo.getOnboardingState(user.id);
  const payload = { ...existing.payload } as Record<string, unknown>;

  const name = String(formData.get("name") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim().toLowerCase();
  const role = parseRole(String(formData.get("role") ?? ""));
  const experienceLevel = String(formData.get("experienceLevel") ?? "").trim();
  const riskBand = String(formData.get("riskBand") ?? "").trim();
  const defaultBroker = String(formData.get("defaultBroker") ?? "").trim().toLowerCase();
  const acceptedDisclosure = formData.get("acceptedDisclosure") === "on";
  const acceptedRisk = formData.get("acceptedRisk") === "on";
  const acceptedNoGuarantee = formData.get("acceptedNoGuarantee") === "on";
  const intent = String(formData.get("intent") ?? "save");
  const currentStep = parseStep(formData.get("currentStep"));

  if (name) payload.name = name;
  if (handle) payload.handle = handle;
  if (role) payload.role = role;
  if (experienceLevel) payload.experienceLevel = experienceLevel;
  if (riskBand) payload.riskBand = riskBand;
  if (defaultBroker) payload.defaultBroker = defaultBroker;
  if (currentStep === 4 || intent === "complete") {
    payload.acceptedDisclosure = acceptedDisclosure;
    payload.acceptedRisk = acceptedRisk;
    payload.acceptedNoGuarantee = acceptedNoGuarantee;
  }

  if (name || handle || role) {
    await repo.updateProfile(user.id, {
      name: name || undefined,
      handle: handle || undefined,
      role: role ?? undefined,
    });
  }

  let nextStep = currentStep;
  let completed = existing.completed;

  if (intent === "continue") nextStep = parseStep(currentStep + 1);
  if (intent === "back") nextStep = parseStep(currentStep - 1);
  if (intent === "complete") {
    nextStep = 5;
    completed = true;
  }

  if (
    intent === "complete" &&
    (!acceptedDisclosure || !acceptedRisk || !acceptedNoGuarantee || !payload.handle || !payload.role)
  ) {
    redirect("/app/onboarding?error=Complete+all+required+fields+before+finishing");
  }

  await repo.saveOnboardingState(user.id, {
    currentStep: nextStep,
    completed,
    payload,
  });

  revalidatePath("/app/onboarding");
  revalidatePath("/app");

  if (completed) {
    await captureServerEvent(user.id, "onboarding_completed", {
      role: payload.role,
      experience: payload.experienceLevel,
      riskBand: payload.riskBand,
    });
    redirect("/app/settings/broker");
  }

  await captureServerEvent(user.id, "onboarding_step_saved", {
    step: nextStep,
    intent,
  });

  redirect(`/app/onboarding?step=${nextStep}`);
}
export async function disconnectZerodhaBrokerAction() {
  const { supabase, user } = await requireAuthenticatedSession("/app/settings/broker");
  const repo = createSupabaseBrokerAuthRepository(supabase);
  const session = await repo.getStoredZerodhaSession(user.id);

  try {
    const env = requireZerodhaSessionEnv();
    if (session?.accessTokenCiphertext) {
      const accessToken = decryptBrokerToken(env.tokenSecret, session.accessTokenCiphertext);
      await invalidateZerodhaAccessToken({
        apiKey: env.apiKey,
        accessToken,
      });
    }
  } catch (error) {
    redirect(`/app/settings/broker?error=${encodeURIComponent((error as Error).message)}`);
  }

  await repo.clearBrokerConnection(user.id);
  revalidatePath("/app/settings/broker");
  redirect("/app/settings/broker?success=Zerodha+disconnected");
}

