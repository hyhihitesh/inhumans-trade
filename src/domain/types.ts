export type Role = "creator" | "follower";
export type TradeSide = "BUY" | "SELL";
export type TradeStatus = "open" | "closed" | "pending";
export type FreshnessState = "hot" | "warm" | "cold";
export type FeedItemType = "trade" | "commentary" | "announcement";

export type BrokerName = "zerodha" | "dhan" | "angel_one" | "fyers";
export type BrokerConnectionStatus = "connected" | "reconnect_required" | "disconnected";
export type CommunityReactionType = "conviction" | "insightful";
export type CommunityReportReason = "spam" | "abuse" | "misleading" | "other";
export type NotificationType = "trade_alert" | "subscription_event" | "system" | "live_event" | "course_event" | "moderation_event";
export type LiveSessionStatus = "scheduled" | "live" | "ended" | "recording_available" | "canceled";
export type LiveAccessMode = "free" | "free_preview" | "tier_gated";
export type VideoProvider = "youtube";
export type CourseEnrollmentStatus = "pending" | "active" | "completed" | "canceled";
export type ModerationSubjectType = "community_post" | "community_comment" | "live_message" | "course_discussion";
export type ModerationStatus = "open" | "reviewing" | "actioned" | "dismissed";
export type ModerationActionType = "hide" | "unhide" | "lock_replies" | "unlock_replies" | "soft_remove";

export interface UserProfile {
  id: string;
  handle: string | null;
  name: string | null;
  role: Role;
}

export interface OnboardingState {
  userId: string;
  currentStep: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  payload: Record<string, unknown>;
}

export interface BrokerConnection {
  id: string;
  userId: string;
  brokerName: BrokerName;
  status: BrokerConnectionStatus;
  scopes: string[];
  brokerUserId?: string | null;
  accountLabel?: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastSuccessfulTradeAt: string | null;
  tokenExpiresAt?: string | null;
  lastError?: string | null;
  lastErrorAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface User {
  id: string;
  handle: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface Trade {
  id: string;
  creatorId: string;
  brokerName: BrokerName;
  brokerOrderId: string;
  source: string;
  instrument: string;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  currentPnl: number;
  status: TradeStatus;
  freshness: FreshnessState;
  createdAt: string;
  executedAt: string;
  updatedAt?: string;
  strategy: string;
  copyCount?: number;
  commentCount?: number;
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  creator: User;
  trade?: Trade;
  content?: string;
  ctaLabel?: string;
  visibilityTier?: SubscriptionTierName;
  isLocked?: boolean;
}

export type TradeWebhookSource = BrokerName | "api" | "manual" | "unknown";

export interface NormalizedTradeWebhookPayload {
  webhookId: string;
  source: TradeWebhookSource;
  brokerName: BrokerName;
  brokerOrderId: string;
  brokerTradeId: string | null;
  creatorId: string;
  creatorHandle: string | null;
  creatorName: string | null;
  instrument: string;
  symbol: string;
  side: TradeSide;
  status: TradeStatus;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  currentPnl: number;
  strategy: string;
  executedAt: string;
  receivedAt: string;
  rawPayload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  requestHeaders: Record<string, string>;
}

export type SubscriptionTierName = "free" | "pro" | "premium";
export type SubscriptionStatus = "pending" | "active" | "canceled" | "expired";
export type CopyTradeStatus = "pending" | "submitted" | "executed" | "failed" | "skipped";

export interface CreatorExploreCard {
  creatorId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  verificationStatus: "pending" | "verified" | "reconnect_required" | "disabled";
  subscribers: number;
  winRate: number;
  totalTrades: number;
  monthlyPnl: number;
  minTierPriceInr: number | null;
}

export interface CreatorTier {
  id: string;
  creatorId: string;
  tierName: SubscriptionTierName;
  label: string;
  monthlyPriceInr: number;
  features: string[];
  active: boolean;
}

export interface CreatorPublicProfile {
  creatorId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  verificationStatus: "pending" | "verified" | "reconnect_required" | "disabled";
  subscribers: number;
  winRate: number;
  totalTrades: number;
  monthlyPnl: number;
  tiers: CreatorTier[];
  recentTrades: ProfileTradeRow[];
  activeSubscriptionTier: SubscriptionTierName | null;
}

export interface ProfileTradeRow {
  id: string;
  creatorId: string;
  creatorHandle: string;
  instrument: string;
  symbol: string;
  side: TradeSide;
  status: TradeStatus;
  brokerName: BrokerName;
  brokerOrderId: string | null;
  entryPrice: number | null;
  quantity: number | null;
  currentPnl: number | null;
  executedAt: string;
  updatedAt: string;
  visibilityTier: SubscriptionTierName;
  isLocked: boolean;
  unlockTier: SubscriptionTierName | null;
}

export interface CreatorSubscription {
  id: string;
  creatorId: string;
  followerId: string;
  tierId: string;
  status: SubscriptionStatus;
  startedAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface CopyTrade {
  id: string;
  followerId: string;
  creatorId: string;
  tradeId: string;
  status: CopyTradeStatus;
  side: TradeSide;
  symbol: string;
  instrument: string;
  requestedQuantity: number;
  executedQuantity: number | null;
  requestedRiskPercent: number | null;
  requestedCapitalInr: number | null;
  executionPrice: number | null;
  realizedPnl: number | null;
  failureReason: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalCopyTrades: number;
  executedTrades: number;
  openTrades: number;
  failedTrades: number;
  totalRealizedPnl: number;
}

export interface AlertPreferences {
  userId: string;
  tradeAlertsEnabled: boolean;
  subscriptionAlertsEnabled: boolean;
  marketingAlertsEnabled: boolean;
  updatedAt: string;
}

export interface CreatorAnalyticsSummary {
  subscribers: number;
  mrrInr: number;
  totalTrades: number;
  winRate: number;
  copyRate: number;
  totalCopyTrades: number;
  executedCopyTrades: number;
  monthlyPnl: number;
}

export interface CommunityPost {
  id: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  content: string | null;
  visibilityTier: SubscriptionTierName;
  isLocked: boolean;
  createdAt: string;
  commentCount: number;
  reactionCount: number;
  viewerReaction: CommunityReactionType | null;
  commentsLocked?: boolean;
  status?: "active" | "hidden" | "reported";
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  authorName: string;
  content: string;
  createdAt: string;
  status?: "active" | "hidden" | "reported";
}

export interface LiveRoom {
  id: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  title: string;
  description: string | null;
  accessMode: LiveAccessMode;
  visibilityTier: SubscriptionTierName | null;
  freePreviewMinutes: number | null;
  provider: VideoProvider;
  active: boolean;
  createdAt: string;
}

export interface LiveSession {
  id: string;
  roomId: string;
  creatorId: string;
  title: string;
  description: string | null;
  status: LiveSessionStatus;
  startsAt: string;
  endsAt: string | null;
  liveUrl: string | null;
  embedUrl: string | null;
  replayUrl: string | null;
  replayEmbedUrl: string | null;
  accessMode: LiveAccessMode;
  visibilityTier: SubscriptionTierName | null;
  freePreviewMinutes: number | null;
  canView: boolean;
  requiresUpgrade: boolean;
  createdAt: string;
}

export interface LiveAccessPolicy {
  roomId: string;
  accessMode: LiveAccessMode;
  visibilityTier: SubscriptionTierName | null;
  freePreviewMinutes: number | null;
}

export interface LiveSessionAttendee {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: string;
  previewEndsAt: string | null;
}

export interface Course {
  id: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  priceInr: number;
  visibilityTier: SubscriptionTierName | null;
  status: "draft" | "published" | "archived";
  coverImageUrl: string | null;
  moduleCount: number;
  lessonCount: number;
  enrollmentCount: number;
  isEnrolled: boolean;
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  position: number;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  position: number;
  discussionLocked: boolean;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  status: CourseEnrollmentStatus;
  enrolledAt: string | null;
  progressPercent: number;
}

export interface Cohort {
  id: string;
  courseId: string;
  title: string;
  startsAt: string;
  seatLimit: number;
  waitlistEnabled: boolean;
  enrolledCount: number;
}

export interface CohortEnrollment {
  id: string;
  cohortId: string;
  userId: string;
  status: "active" | "waitlisted" | "canceled";
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  cohortId: string;
  userId: string;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  subjectType: ModerationSubjectType;
  subjectId: string;
  ownerId: string;
  reporterId: string;
  reason: CommunityReportReason;
  details: string | null;
  status: ModerationStatus;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  reportId: string | null;
  subjectType: ModerationSubjectType;
  subjectId: string;
  actorId: string;
  actionType: ModerationActionType;
  reason: string | null;
  createdAt: string;
}

export interface ModerationQueueItem {
  id: string;
  subjectType: ModerationSubjectType;
  subjectId: string;
  ownerId: string;
  reporterCount: number;
  latestReason: CommunityReportReason | null;
  status: ModerationStatus;
  createdAt: string;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDeliveryTarget {
  userId: string;
  notificationId: string;
  endpoint: string;
}
