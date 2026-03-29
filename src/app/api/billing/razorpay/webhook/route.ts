import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";

type RazorpayWebhookPaymentEntity = {
  id?: string;
  order_id?: string;
  notes?: {
    subscription_id?: string;
  };
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayWebhookPaymentEntity;
    };
  };
};

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook secret/signature missing" }, { status: 401 });
  }

  const expected = crypto.createHmac("sha256", webhookSecret).update(bodyText).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(bodyText) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook JSON payload" }, { status: 400 });
  }

  const event = payload.event ?? "";
  const payment = payload.payload?.payment?.entity;
  const subscriptionId = payment?.notes?.subscription_id;

  if (!subscriptionId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "No subscription note found" });
  }

  const repo = new SupabaseCreatorPlatformRepository(createAdminClient());

  if (event === "payment.captured" || event === "order.paid") {
    await repo.activateSubscriptionWithPayment(subscriptionId, {
      razorpayOrderId: payment?.order_id ?? null,
      razorpayPaymentId: payment?.id ?? null,
      razorpaySignature: signature,
    });
  } else if (event === "payment.failed") {
    await repo.markSubscriptionCanceled(subscriptionId);
  }

  return NextResponse.json({ ok: true, event });
}

