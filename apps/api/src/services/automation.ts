import { prisma } from "@linkbhejo/db";
import type {
  MetaChangeValue,
  MetaMessagingEvent,
  DmSendJobPayload,
} from "@linkbhejo/types";
import { queueService } from "./queue";
import { logger } from "../logger";

const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─────────────────────────────────────────
// Comment event processor
// ─────────────────────────────────────────
export async function processCommentEvent(
  igAccountId: string,
  event: MetaChangeValue
): Promise<void> {
  const commentText = event.text ?? "";
  const commenterId = event.from?.id;
  const commenterUsername = event.from?.username; 
  const mediaId = event.media?.id ?? event.id;

  if (!commenterId || !mediaId) {
    logger.warn("Comment event missing fields", { event });
    return;
  }

  // Find the Instagram account in our DB
  const account = await prisma.instagramAccount.findUnique({
    where: { igUserId: igAccountId },
  });
  if (!account) return;

  // Find matching active automations for this post or account
  const automations = await prisma.automation.findMany({
    where: {
      accountId: account.id,
      type: "COMMENT",
      status: "ACTIVE",
      deletedAt: null,
      OR: [
        { watchAllPosts: true },
        { postId: mediaId },
      ],
    },
    include: { rules: true },
  });

  for (const automation of automations) {
    // Check if any keyword matches
    const matched = matchesKeyword(commentText, automation.rules);
    if (!matched) continue;

    // Idempotency check — don't send duplicate DMs
    const existing = await prisma.dmLog.findUnique({
      where: {
        automationId_igUserId: {
          automationId: automation.id,
          igUserId: commenterId,
        },
      },
    });
    if (existing) {
      logger.debug("Duplicate DM skipped", {
        automationId: automation.id,
        igUserId: commenterId,
      });
      continue;
    }

    logger.info("Keyword matched — queueing DM", {
      automationId: automation.id,
      keyword: matched,
      commenterId,
    });

    // Queue DM send (with optional delay)
    const payload: DmSendJobPayload = {
      automationId: automation.id,
      accountId: account.id,
      igUserId: commenterId,
      igUsername: commenterUsername,
      messageText: automation.dmTemplate,
      triggerType: "comment",
      triggerPostId: mediaId,
      triggeredAt: new Date().toISOString(),
    };

    await queueService.enqueueDmSend(
      payload,
      automation.delaySeconds * 1000
    );

    // Queue public comment reply (if enabled)
    if (automation.commentReplyEnabled && automation.commentReplyTemplate) {
      await queueService.enqueueCommentReply({
        accountId: account.id,
        mediaId,
        commentId: event.comment_id ?? "",
        replyText: automation.commentReplyTemplate,
      });
    }
  }
}

// ─────────────────────────────────────────
// DM / messaging event processor
// ─────────────────────────────────────────
export async function processMessageEvent(
  igAccountId: string,
  event: MetaMessagingEvent
): Promise<void> {
  const senderId = event.sender.id;
  const messageText = event.message?.text ?? "";

  if (!messageText) return;

  const account = await prisma.instagramAccount.findUnique({
    where: { igUserId: igAccountId },
  });
  if (!account) return;

  // Find matching DM_REPLY automations
  const automations = await prisma.automation.findMany({
    where: {
      accountId: account.id,
      type: "DM_REPLY",
      status: "ACTIVE",
      deletedAt: null,
    },
    include: { rules: true },
  });

  for (const automation of automations) {
    const matched = matchesKeyword(messageText, automation.rules);
    if (!matched) continue;

    const existing = await prisma.dmLog.findUnique({
      where: {
        automationId_igUserId: {
          automationId: automation.id,
          igUserId: senderId,
        },
      },
    });
    if (existing) continue;

    await queueService.enqueueDmSend({
      automationId: automation.id,
      accountId: account.id,
      igUserId: senderId,
      messageText: automation.dmTemplate,
      triggerType: "dm_keyword",
      triggeredAt: new Date().toISOString(),
    });
  }
}

// ─────────────────────────────────────────
// Story reply processor
// ─────────────────────────────────────────
export async function processStoryReply(
  igAccountId: string,
  event: MetaMessagingEvent
): Promise<void> {
  const senderId = event.sender.id;
  const account = await prisma.instagramAccount.findUnique({
    where: { igUserId: igAccountId },
  });
  if (!account) return;

  const automations = await prisma.automation.findMany({
    where: {
      accountId: account.id,
      type: "STORY",
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  for (const automation of automations) {
    await queueService.enqueueDmSend({
      automationId: automation.id,
      accountId: account.id,
      igUserId: senderId,
      messageText: automation.dmTemplate,
      triggerType: "story_reply",
      triggeredAt: new Date().toISOString(),
    });
  }
}

// ─────────────────────────────────────────
// Live comment processor
// ─────────────────────────────────────────
export async function processLiveComment(
  igAccountId: string,
  event: MetaChangeValue
): Promise<void> {
  const commenterId = event.from?.id;
  const commentText = event.text ?? "";

  if (!commenterId) return;

  const account = await prisma.instagramAccount.findUnique({
    where: { igUserId: igAccountId },
  });
  if (!account) return;

  const automations = await prisma.automation.findMany({
    where: {
      accountId: account.id,
      type: "LIVE",
      status: "ACTIVE",
      deletedAt: null,
    },
    include: { rules: true },
  });

  for (const automation of automations) {
    const matched = matchesKeyword(commentText, automation.rules);
    if (!matched) continue;

    // Check cooldown (30 min) to avoid spamming during live
    const recentDm = await prisma.dmLog.findFirst({
      where: {
        automationId: automation.id,
        igUserId: commenterId,
        triggeredAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000),
        },
      },
    });
    if (recentDm) continue;

    await queueService.enqueueDmSend({
      automationId: automation.id,
      accountId: account.id,
      igUserId: commenterId,
      messageText: automation.dmTemplate,
      triggerType: "live_comment",
      triggeredAt: new Date().toISOString(),
    });
  }
}

// ─────────────────────────────────────────
// Keyword matching (exported for unit tests)
// ─────────────────────────────────────────
export function matchesKeyword(
  text: string,
  rules: Array<{ keyword: string; matchType: string; caseSensitive: boolean }>
): string | null {
  const normalizedText = text.toLowerCase();

  for (const rule of rules) {
    const keyword = rule.caseSensitive
      ? rule.keyword
      : rule.keyword.toLowerCase();
    const checkText = rule.caseSensitive ? text : normalizedText;

    switch (rule.matchType) {
      case "EXACT":
        if (checkText === keyword) return rule.keyword;
        break;
      case "CONTAINS":
        if (checkText.includes(keyword)) return rule.keyword;
        break;
      case "STARTS_WITH":
        if (checkText.startsWith(keyword)) return rule.keyword;
        break;
    }
  }
  return null;
}

export { MESSAGING_WINDOW_MS };
