import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorBusinessRepository } from "@/domain/datasources/supabase-creator-business";

type Body = {
  content?: string;
  visibilityTier?: "free" | "pro" | "premium";
};

function normalizeTier(value: unknown): "free" | "pro" | "premium" {
  return value === "pro" || value === "premium" ? value : "free";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = String(body.content ?? "").trim();
  const visibilityTier = normalizeTier(body.visibilityTier);

  if (content.length < 10) {
    return NextResponse.json({ error: "Post content must be at least 10 characters" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Post content must be at most 2000 characters" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (profileError) return NextResponse.json({ error: "Unable to resolve profile" }, { status: 400 });
  if (profile.role !== "creator") {
    return NextResponse.json({ error: "Only creator accounts can publish posts" }, { status: 403 });
  }

  const repo = new SupabaseCreatorBusinessRepository(supabase);
  try {
    const result = await repo.publishCommunityPost({
      creatorId: profile.id,
      content,
      visibilityTier,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Unable to publish post" }, { status: 502 });
  }
}

