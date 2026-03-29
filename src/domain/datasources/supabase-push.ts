import { SupabaseClient } from "@supabase/supabase-js";
import { PushRepository } from "@/domain/repositories/push-repository";
import { PushSubscription } from "@/domain/types";

export class SupabasePushRepository implements PushRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const { data, error } = await this.supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth, enabled, created_at, updated_at")
      .eq("user_id", userId)
      .eq("enabled", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async upsertPushSubscription(input: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  }): Promise<PushSubscription> {
    const { data, error } = await this.supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: input.userId,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          enabled: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      )
      .select("id, user_id, endpoint, p256dh, auth, enabled, created_at, updated_at")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      enabled: data.enabled,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async disablePushSubscription(endpoint: string, userId?: string): Promise<void> {
    let query = this.supabase.from("push_subscriptions").update({ enabled: false, updated_at: new Date().toISOString() }).eq("endpoint", endpoint);
    if (userId) query = query.eq("user_id", userId);
    const { error } = await query;
    if (error) throw error;
  }
}
