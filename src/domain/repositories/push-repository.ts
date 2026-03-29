import { PushSubscription } from "@/domain/types";

export interface PushRepository {
  listPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  upsertPushSubscription(input: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  }): Promise<PushSubscription>;
  disablePushSubscription(endpoint: string, userId?: string): Promise<void>;
}
