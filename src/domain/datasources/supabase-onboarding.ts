import { SupabaseClient } from "@supabase/supabase-js";
import {
  BrokerConnection,
  BrokerConnectionStatus,
  BrokerName,
  OnboardingState,
  Role,
  UserProfile,
} from "@/domain/types";
import { AuthRepository, BrokerRepository, OnboardingRepository } from "@/domain/repositories/onboarding-repository";
import { isZerodhaSessionExpired } from "@/lib/brokers/zerodha-oauth";

interface OnboardingRow {
  user_id: string;
  current_step: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  payload: Record<string, unknown> | null;
}

interface BrokerRow {
  id: string;
  user_id: string;
  broker_name: BrokerName;
  status: BrokerConnectionStatus;
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
}

function normalizeOnboardingRow(row: OnboardingRow): OnboardingState {
  return {
    userId: row.user_id,
    currentStep: row.current_step,
    completed: row.completed,
    payload: row.payload ?? {},
  };
}

function normalizeBrokerRow(row: BrokerRow): BrokerConnection {
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

function getExpiredBrokerErrorMessage(tokenExpiresAt: string | null) {
  if (!tokenExpiresAt) return "Zerodha session expired. Reconnect required.";
  return `Zerodha session expired at ${new Date(tokenExpiresAt).toLocaleString()}. Reconnect required.`;
}

export class SupabaseOnboardingRepository implements AuthRepository, OnboardingRepository, BrokerRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async ensureProfile(userId: string, defaults?: { name?: string | null; role?: Role }): Promise<UserProfile> {
    const role = defaults?.role ?? "follower";
    const name = defaults?.name ?? null;

    const { error: upsertError } = await this.supabase.from("profiles").upsert(
      {
        id: userId,
        name,
        role,
      },
      { onConflict: "id" }
    );

    if (upsertError) throw upsertError;

    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Unable to resolve user profile after upsert.");
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, handle, name, role")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      handle: data.handle,
      name: data.name,
      role: data.role,
    };
  }

  async updateProfile(
    userId: string,
    patch: Partial<Pick<UserProfile, "name" | "handle" | "role">>
  ): Promise<UserProfile> {
    const payload: Record<string, unknown> = { id: userId };
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.handle !== undefined) payload.handle = patch.handle;
    if (patch.role !== undefined) payload.role = patch.role;

    const { data, error } = await this.supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("id, handle, name, role")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      handle: data.handle,
      name: data.name,
      role: data.role,
    };
  }

  async getOnboardingState(userId: string): Promise<OnboardingState> {
    const { data, error } = await this.supabase
      .from("onboarding_states")
      .select("user_id, current_step, completed, payload")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: inserted, error: insertError } = await this.supabase
        .from("onboarding_states")
        .insert({ user_id: userId, current_step: 1, completed: false, payload: {} })
        .select("user_id, current_step, completed, payload")
        .single();

      if (insertError) throw insertError;
      return normalizeOnboardingRow(inserted as OnboardingRow);
    }

    return normalizeOnboardingRow(data as OnboardingRow);
  }

  async saveOnboardingState(userId: string, state: Partial<OnboardingState>): Promise<OnboardingState> {
    const patch = {
      user_id: userId,
      current_step: state.currentStep,
      completed: state.completed,
      payload: state.payload,
    };

    const { data, error } = await this.supabase
      .from("onboarding_states")
      .upsert(patch, { onConflict: "user_id" })
      .select("user_id, current_step, completed, payload")
      .single();

    if (error) throw error;
    return normalizeOnboardingRow(data as OnboardingRow);
  }

  async getBrokerConnection(userId: string, broker: BrokerName): Promise<BrokerConnection | null> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .eq("user_id", userId)
      .eq("broker_name", broker)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.normalizeAndRefreshBroker(userId, normalizeBrokerRow(data as BrokerRow));
  }

  async getAllBrokerConnections(userId: string): Promise<BrokerConnection[]> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .eq("user_id", userId)
      .order("broker_name", { ascending: true });

    if (error) throw error;
    return Promise.all(
      ((data as BrokerRow[]) ?? []).map((row) => this.normalizeAndRefreshBroker(userId, normalizeBrokerRow(row)))
    );
  }

  async setBrokerStatus(
    userId: string,
    broker: BrokerName,
    status: BrokerConnectionStatus,
    extra?: Partial<Pick<BrokerConnection, "scopes" | "connectedAt" | "lastSyncAt" | "lastSuccessfulTradeAt">>
  ): Promise<BrokerConnection> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .upsert(
        {
          user_id: userId,
          broker_name: broker,
          status,
          scopes: extra?.scopes ?? [],
          connected_at: extra?.connectedAt ?? null,
          last_sync_at: extra?.lastSyncAt ?? null,
          last_successful_trade_at: extra?.lastSuccessfulTradeAt ?? null,
        },
        { onConflict: "user_id,broker_name" }
      )
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .single();

    if (error) throw error;
    return normalizeBrokerRow(data as BrokerRow);
  }

  async upsertBrokerConnection(
    userId: string,
    broker: BrokerName,
    patch: Partial<BrokerConnection> & { status: BrokerConnectionStatus }
  ): Promise<BrokerConnection> {
    const { data, error } = await this.supabase
      .from("broker_connections")
      .upsert(
        {
          user_id: userId,
          broker_name: broker,
          status: patch.status,
          scopes: patch.scopes ?? [],
          broker_user_id: patch.brokerUserId ?? null,
          account_label: patch.accountLabel ?? null,
          connected_at: patch.connectedAt ?? null,
          last_sync_at: patch.lastSyncAt ?? null,
          last_successful_trade_at: patch.lastSuccessfulTradeAt ?? null,
          token_expires_at: patch.tokenExpiresAt ?? null,
          last_error: patch.lastError ?? null,
          last_error_at: patch.lastErrorAt ?? null,
          metadata: patch.metadata ?? {},
        },
        { onConflict: "user_id,broker_name" }
      )
      .select(
        "id, user_id, broker_name, status, scopes, broker_user_id, account_label, connected_at, last_sync_at, last_successful_trade_at, token_expires_at, last_error, last_error_at, metadata"
      )
      .single();

    if (error) throw error;
    return normalizeBrokerRow(data as BrokerRow);
  }

  async clearBrokerConnection(userId: string, broker: BrokerName): Promise<BrokerConnection> {
    return this.upsertBrokerConnection(userId, broker, {
      status: "disconnected",
      scopes: [],
      brokerUserId: null,
      accountLabel: null,
      connectedAt: null,
      lastSyncAt: null,
      lastSuccessfulTradeAt: null,
      tokenExpiresAt: null,
      lastError: null,
      lastErrorAt: null,
      metadata: {
        accessTokenCiphertext: null,
        refreshTokenCiphertext: null,
      },
    });
  }

  private async normalizeAndRefreshBroker(userId: string, connection: BrokerConnection): Promise<BrokerConnection> {
    if (
      connection.brokerName === "zerodha" &&
      connection.status === "connected" &&
      isZerodhaSessionExpired(connection.tokenExpiresAt)
    ) {
      return this.upsertBrokerConnection(userId, connection.brokerName, {
        ...connection,
        status: "reconnect_required",
        lastError: getExpiredBrokerErrorMessage(connection.tokenExpiresAt ?? null),
        lastErrorAt: new Date().toISOString(),
      });
    }

    return connection;
  }
}

