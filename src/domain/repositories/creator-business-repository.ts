import { CreatorAnalyticsSummary } from "@/domain/types";

export interface CreatorBusinessRepository {
  getCreatorAnalyticsSummary(creatorId: string): Promise<CreatorAnalyticsSummary>;
  publishCommunityPost(input: {
    creatorId: string;
    content: string;
    visibilityTier: "free" | "pro" | "premium";
  }): Promise<{ communityPostId: string; feedItemId: string }>;
}
