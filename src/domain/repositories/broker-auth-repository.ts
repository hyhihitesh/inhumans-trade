import { BrokerConnection, BrokerName } from "@/domain/types";

export interface StoreZerodhaConnectionInput {
  userId: string;
  brokerUserId: string | null;
  accountLabel: string | null;
  accessTokenCiphertext: string;
  refreshTokenCiphertext: string | null;
  tokenExpiresAt: string | null;
  scopes: string[];
  metadata?: Record<string, unknown>;
}

export interface StoredZerodhaSession {
  accessTokenCiphertext: string | null;
  refreshTokenCiphertext: string | null;
}

export interface BrokerAuthRepository {
  storeZerodhaConnection(input: StoreZerodhaConnectionInput): Promise<BrokerConnection>;
  markBrokerReconnectRequired(userId: string, lastError: string): Promise<BrokerConnection>;
  clearBrokerConnection(userId: string): Promise<BrokerConnection>;
  getStoredZerodhaSession(userId: string): Promise<StoredZerodhaSession | null>;
  getUserIdByBrokerUserId(brokerName: BrokerName, brokerUserId: string): Promise<string | null>;
}
