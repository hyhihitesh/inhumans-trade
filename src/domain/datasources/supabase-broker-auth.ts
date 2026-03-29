import { SupabaseClient } from "@supabase/supabase-js";
import { BrokerConnection, BrokerName } from "@/domain/types";
import {
  BrokerAuthRepository,
  StoreZerodhaConnectionInput,
  StoredZerodhaSession,
} from "@/domain/repositories/broker-auth-repository";

type BrokerConnectionRow = {
  id: string;
  user_id: string;
  broker_name: "zerodha";
  status: BrokerConnection["status"];
  scopes: string[] | null;
  broker_user_id: string | null;
  account_label: string | null;
  connected_at: string | null;
  last_sync_at: string | null;
  last_successful_trade_at: string | null;
  token_expires_at: string | null;
  last_error: string | null;
  last_error_at: string | null;
  metadata: Record<string, unknown> | null;
};

type BrokerTokenRow = {
  access_token_ciphertext: string | null;
  refresh_token_ciphertext: string | null;
};

function toBrokerConnection(row: BrokerConnectionRow): BrokerConnection {
  return {
    id: row.id,
    userId: row.user_id,
    brokerName: row.broker_name,
    status: row.status,
    scopes: row.scopes ?? [],
    brokerUserId: row.broker_user_id,
    accountLabel: row.account_label,
    connectedAt: row.connected_at,
    lastSyncAt: row.last_sync_at,
    lastSuccessfulTradeAt: row.last_successful_trade_at,
    tokenExpiresAt: row.token_expires_at,
    lastError: row.last_error,
    lastErrorAt: row.last_error_at,
    metadata: row.metadata ?? {},
  };
}

export class SupabaseBrokerAuthRepository implements BrokerAuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async storeZerodhaConnection(input: StoreZerodhaConnectionInput): Promise<BrokerConnection> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("broker_connections")
      .upsert(
        {
          user_id: input.userId,
          broker_name: "zerodha",
          status: "connected",
          scopes: input.scopes,
          broker_user_id: input.brokerUserId,
          account_label: input.accountLabel,
          connected_at: now,
          last_sync_at: now,
          last_successful_trade_at: now,
          token_expires_at: input.tokenExpiresAt,
          last_error: null,
          last_error_at: null,
          access_token_ciphertext: input.accessTokenCiphertext,
          refresh_token_ciphertext: input.refreshTokenCiphertext,
          metadata: input.metadata ?? {},
        },
        { onConflict: "user_id,broker_name" }
      )
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .single();

    if (error) throw error;
    return toBrokerConnection(data as BrokerConnectionRow);
  }

  async markBrokerReconnectRequired(userId: string, lastError: string): Promise<BrokerConnection> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("broker_connections")
      .upsert(
        {
          user_id: userId,
          broker_name: "zerodha",
          status: "reconnect_required",
          last_error: lastError,
          last_error_at: now,
        },
        { onConflict: "user_id,broker_name" }
      )
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .single();

    if (error) throw error;
    return toBrokerConnection(data as BrokerConnectionRow);
  }

  async clearBrokerConnection(userId: string): Promise<BrokerConnection> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .upsert(
        {
          user_id: userId,
          broker_name: "zerodha",
          status: "disconnected",
          scopes: [],
          broker_user_id: null,
          account_label: null,
          connected_at: null,
          last_sync_at: null,
          last_successful_trade_at: null,
          token_expires_at: null,
          last_error: null,
          last_error_at: null,
          access_token_ciphertext: null,
          refresh_token_ciphertext: null,
          metadata: {},
        },
        { onConflict: "user_id,broker_name" }
      )
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .single();

    if (error) throw error;
    return toBrokerConnection(data as BrokerConnectionRow);
  }

  async getStoredZerodhaSession(userId: string): Promise<StoredZerodhaSession | null> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .select("access_token_ciphertext, refresh_token_ciphertext")
      .eq("user_id", userId)
      .eq("broker_name", "zerodha")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as BrokerTokenRow;
    return {
      accessTokenCiphertext: row.access_token_ciphertext,
      refreshTokenCiphertext: row.refresh_token_ciphertext,
    };
  }

  async getUserIdByBrokerUserId(brokerName: BrokerName, brokerUserId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .select("user_id")
      .eq("broker_name", brokerName)
      .eq("broker_user_id", brokerUserId)
      .maybeSingle();

    if (error) throw error;
    return data ? (data.user_id as string) : null;
  }
}

export function createSupabaseBrokerAuthRepository(supabase: SupabaseClient) {
  return new SupabaseBrokerAuthRepository(supabase);
}
