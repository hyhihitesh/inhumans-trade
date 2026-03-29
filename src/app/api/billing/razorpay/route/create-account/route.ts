import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLinkedAccount } from "@/lib/billing/razorpay";

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { creatorId, pan, phone } = await req.json();

    const { data: profile, error: profileError } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("id", creatorId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const account = await createLinkedAccount({
      email: profile.email || "",
      name: profile.display_name || profile.full_name || "Creator",
      pan,
      phone,
    });

    const { error: updateError } = await supabase
      .from("creator_profiles")
      .update({
        razorpay_account_id: account.id,
        kyc_status: "pending",
      })
      .eq("id", creatorId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, accountId: account.id });
  } catch (error: any) {
    console.error("[RAZORPAY_ACCOUNT_CREATE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
