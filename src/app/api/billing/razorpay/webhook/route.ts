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

  const supabase = createAdminClient();
  const repo = new SupabaseCreatorPlatformRepository(supabase);

  // Handle Account KYC Webhooks
  if (event.startsWith("account.")) {
    const account = (payload.payload as any)?.account;
    if (!account?.id) return NextResponse.json({ error: "No account ID in payload" }, { status: 400 });

    let kycStatus = "pending";
    if (event === "account.activated") kycStatus = "active";
    if (event === "account.rejected") kycStatus = "rejected";
    if (event === "account.updated") {
       // Logic for status check if needed
    }

    await supabase
      .from("creator_profiles")
      .update({ kyc_status: kycStatus })
      .eq("razorpay_account_id", account.id);

    return NextResponse.json({ ok: true, event });
  }

  // Handle Payment Webhooks
  if (!subscriptionId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "No subscription note found" });
  }

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

