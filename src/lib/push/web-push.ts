import "server-only";

import webpush from "web-push";
import { requireWebPushEnv } from "@/lib/supabase/env";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const { publicKey, privateKey, subject } = requireWebPushEnv();
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function getWebPushPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

export async function sendWebPushNotification(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  payload: Record<string, unknown>;
}) {
  ensureConfigured();
  return webpush.sendNotification(
    {
      endpoint: input.endpoint,
      keys: {
        p256dh: input.p256dh,
        auth: input.auth,
      },
    },
    JSON.stringify(input.payload)
  );
}
