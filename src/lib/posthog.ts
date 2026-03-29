import { PostHog } from "posthog-node";

export function getPostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

/**
 * Capture a server-side event and immediately shutdown the client to ensure delivery.
 * Use this in Server Actions or API routes where the process might terminate.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogClient();
  client.capture({
    distinctId,
    event,
    properties,
  });
  await client.shutdown();
}
