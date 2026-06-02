export type AutomationType = "COMMENT" | "STORY" | "LIVE" | "DM_REPLY";
export type AutomationStatus = "ACTIVE" | "PAUSED" | "DRAFT";
export type DmStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "SKIPPED";
export type UserRole = "OWNER" | "AGENCY_ADMIN" | "STAFF" | "VIEWER";
export type SubscriptionPlan = "FREE" | "PRO" | "AGENCY";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
export type KeywordMatchType = "EXACT" | "CONTAINS" | "STARTS_WITH";
export type TriggerType = "comment" | "story_reply" | "story_reaction" | "live_comment" | "dm_keyword";
export interface PlanLimits {
    dmsPerMonth: number;
    maxAccounts: number;
    aiEnabled: boolean;
    sequencesEnabled: boolean;
    abTestingEnabled?: boolean;
    whitelabelEnabled?: boolean;
}
export declare const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits>;
export interface MetaWebhookBody {
    object: "instagram" | "page";
    entry: MetaWebhookEntry[];
}
export interface MetaWebhookEntry {
    id: string;
    time: number;
    changes?: MetaWebhookChange[];
    messaging?: MetaMessagingEvent[];
}
export interface MetaWebhookChange {
    value: MetaChangeValue;
    field: string;
}
export interface MetaChangeValue {
    from?: {
        id: string;
        username?: string;
    };
    media?: {
        id: string;
    };
    id?: string;
    text?: string;
    timestamp?: number;
    item?: string;
    verb?: string;
    comment_id?: string;
    parent_id?: string;
}
export interface MetaMessagingEvent {
    sender: {
        id: string;
    };
    recipient: {
        id: string;
    };
    timestamp: number;
    message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
            type: string;
            payload: {
                url: string;
            };
        }>;
    };
    reaction?: {
        action: "react" | "unreact";
        emoji?: string;
    };
}
export interface DmSendJobPayload {
    automationId: string;
    accountId: string;
    igUserId: string;
    igUsername?: string;
    messageText: string;
    mediaUrl?: string;
    triggerType: TriggerType;
    triggerPostId?: string;
    triggeredAt: string;
    abVariant?: "A" | "B";
}
export interface CommentReplyJobPayload {
    accountId: string;
    mediaId: string;
    commentId: string;
    replyText: string;
}
export interface SequenceStepJobPayload {
    enrollmentId: string;
    sequenceId: string;
    stepNumber: number;
    accountId: string;
    igUserId: string;
}
export interface RetriggerBatchJobPayload {
    automationId: string;
    accountId: string;
    postId: string;
    cursor?: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface AnalyticsOverview {
    dmsSent: number;
    dmsDelivered: number;
    dmsReplied: number;
    leadsCollected: number;
    conversionRate: number;
    activeAutomations: number;
    totalCommentTriggers: number;
}
export interface AnalyticsTimeline {
    date: string;
    dmsSent: number;
    dmsDelivered: number;
    dmsReplied: number;
}
export interface AutomationAnalytics {
    automationId: string;
    automationName: string;
    dmsSent: number;
    dmsDelivered: number;
    dmsReplied: number;
    replyRate: number;
}
export interface CreateAutomationInput {
    name: string;
    type: AutomationType;
    postId?: string;
    watchAllPosts?: boolean;
    dmTemplate: string;
    commentReplyEnabled?: boolean;
    commentReplyTemplate?: string;
    delaySeconds?: number;
    followGate?: boolean;
    followGateMessage?: string;
    aiEnabled?: boolean;
    aiSystemPrompt?: string;
    keywords: Array<{
        keyword: string;
        matchType: KeywordMatchType;
    }>;
}
export interface UpdateAutomationInput extends Partial<CreateAutomationInput> {
    status?: AutomationStatus;
}
//# sourceMappingURL=index.d.ts.map