import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWebPushNotification } from "@/lib/push/web-push";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.PUSH_DISPATCH_SECRET?.trim();
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: notifications, error: notifError } = await admin
    .from("notifications")
    .select("id, user_id, title, body, type, entity_type")
    .order("created_at", { ascending: false })
    .limit(25);

  if (notifError) {
    return NextResponse.json({ error: notifError.message }, { status: 500 });
  }

  let sent = 0;

  for (const notification of notifications ?? []) {
    const { data: subscriptions, error: subsError } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", notification.user_id)
      .eq("enabled", true);

    if (subsError) continue;

    for (const sub of subscriptions ?? []) {
      try {
        await sendWebPushNotification({
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
          payload: {
            title: notification.title,
            body: notification.body,
            tag: notification.id,
            data: {
              notificationId: notification.id,
              entityType: notification.entity_type,
              type: notification.type,
            },
          },
        });

        await admin.from("push_delivery_logs").insert({
          notification_id: notification.id,
          user_id: notification.user_id,
          endpoint: sub.endpoint,
          status: "sent",
        });
        sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Push delivery failed.";
        await admin.from("push_delivery_logs").insert({
          notification_id: notification.id,
          user_id: notification.user_id,
          endpoint: sub.endpoint,
          status: "failed",
          error_message: message,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
