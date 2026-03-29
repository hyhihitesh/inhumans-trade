import { BrokerConnection, BrokerConnectionStatus, BrokerName, OnboardingState, Role, UserProfile } from "@/domain/types";

export interface AuthRepository {
  ensureProfile(userId: string, defaults?: { name?: string | null; role?: Role }): Promise<UserProfile>;
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(
    userId: string,
    patch: Partial<Pick<UserProfile, "name" | "handle" | "role">>
  ): Promise<UserProfile>;
}

export interface OnboardingRepository {
  getOnboardingState(userId: string): Promise<OnboardingState>;
  saveOnboardingState(userId: string, state: Partial<OnboardingState>): Promise<OnboardingState>;
}

export interface BrokerRepository {
  getBrokerConnection(userId: string, broker: BrokerName): Promise<BrokerConnection | null>;
  getAllBrokerConnections(userId: string): Promise<BrokerConnection[]>;
  setBrokerStatus(
    userId: string,
    broker: BrokerName,
    status: BrokerConnectionStatus,
    extra?: Partial<Pick<BrokerConnection, "scopes" | "connectedAt" | "lastSyncAt" | "lastSuccessfulTradeAt">>
  ): Promise<BrokerConnection>;
  upsertBrokerConnection(
    userId: string,
    broker: BrokerName,
    patch: Partial<BrokerConnection> & { status: BrokerConnectionStatus }
  ): Promise<BrokerConnection>;
  clearBrokerConnection(userId: string, broker: BrokerName): Promise<BrokerConnection>;
}
