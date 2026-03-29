import {
  AppNotification,
  CommunityComment,
  CommunityPost,
  CreatorExploreCard,
  CreatorPublicProfile,
  CreatorSubscription,
  CreatorTier,
  CommunityReactionType,
  CommunityReportReason,
  SubscriptionTierName,
} from "@/domain/types";

export interface CreatorPlatformRepository {
  listExploreCreators(search?: string): Promise<CreatorExploreCard[]>;
  getCreatorPublicProfile(handle: string, viewerId?: string): Promise<CreatorPublicProfile | null>;
  listCreatorTiers(creatorId: string): Promise<CreatorTier[]>;
  getActiveSubscription(creatorId: string, followerId: string): Promise<CreatorSubscription | null>;
  createPendingSubscription(creatorId: string, followerId: string, tierId: string): Promise<CreatorSubscription>;
  getTierById(tierId: string): Promise<CreatorTier | null>;
  activateSubscriptionWithPayment(
    subscriptionId: string,
    payment: {
      razorpayOrderId: string | null;
      razorpayPaymentId: string | null;
      razorpaySignature: string | null;
    }
  ): Promise<void>;
  markSubscriptionActive(subscriptionId: string): Promise<void>;
  markSubscriptionCanceled(subscriptionId: string): Promise<void>;
  listNotifications(userId: string): Promise<AppNotification[]>;
  markNotificationRead(notificationId: string, userId: string): Promise<void>;
  listCommunityPosts(viewerId: string, options?: { creatorId?: string; limit?: number }): Promise<CommunityPost[]>;
  listCommunityComments(postId: string): Promise<CommunityComment[]>;
  addCommunityComment(input: { postId: string; authorId: string; content: string }): Promise<CommunityComment>;
  toggleCommunityReaction(input: {
    postId: string;
    userId: string;
    reactionType: CommunityReactionType;
  }): Promise<void>;
  reportCommunityPost(input: {
    postId: string;
    reporterId: string;
    reason: CommunityReportReason;
    details?: string | null;
  }): Promise<void>;
  getViewerTierForCreator(creatorId: string, viewerId: string): Promise<SubscriptionTierName | null>;
}

