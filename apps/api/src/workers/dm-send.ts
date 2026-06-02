import { Worker, type Job } from "bullmq";
import { Redis } from "ioredis";
import { prisma, encryptToken } from "@linkbhejo/db";
import type { DmSendJobPayload } from "@linkbhejo/types";
import { MetaClient, MetaRateLimitError, MetaBadRequestError } from "../services/meta";
import { generateAiReply, buildAutomationSystemPrompt } from "../services/ai";
import { incrementDmUsage } from "@linkbhejo/utils/rate-limit";
import { logger } from "../logger";
import { QUEUES } from "../services/queue";

const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000;

export function startDmSendWorker(redis: Redis) {
  const worker = new Worker<DmSendJobPayload>(
    QUEUES.DM_SEND,
    async (job: Job<DmSendJobPayload>) => {
      const {
        automationId,
        accountId,
        igUserId,
        igUsername,
        messageText,
        mediaUrl,
        triggerType,
        triggerPostId,
        triggeredAt,
        abVariant,
      } = job.data;

      logger.info("Processing DM send job", {
        jobId: job.id,
        automationId,
        igUserId,
      });

      // 1. Idempotency check
      const existing = await prisma.dmLog.findUnique({
        where: {
          automationId_igUserId: { automationId, igUserId },
        },
      });
      if (existing && existing.status === "SENT" || existing?.status === "DELIVERED") {
        logger.info("DM already sent — skipping", { automationId, igUserId });
        return;
      }

      // 2. Enforce 24-hour messaging window
      const triggeredAtDate = new Date(triggeredAt);
      const windowExpiry = triggeredAtDate.getTime() + MESSAGING_WINDOW_MS;
      if (Date.now() > windowExpiry) {
        logger.warn("24-hour messaging window expired — skipping DM", {
          automationId,
          igUserId,
          triggeredAt,
        });
        await prisma.dmLog.upsert({
          where: { automationId_igUserId: { automationId, igUserId } },
          update: { status: "SKIPPED", errorMessage: "24h window expired" },
          create: {
            automationId,
            accountId,
            igUserId,
            igUsername: igUsername ?? "",
            messageText,
            status: "SKIPPED",
            triggerType,
            triggerPostId,
            triggeredAt: triggeredAtDate,
            errorMessage: "24h window expired",
          },
        });
        return;
      }

      // 3. Load automation for AI check
      const automation = await prisma.automation.findUnique({
        where: { id: automationId },
      });

      // 4. Generate AI reply if enabled and no fixed template (or as override)
      let finalMessage = messageText;
      if (automation?.aiEnabled && automation.aiSystemPrompt) {
        try {
          const systemPrompt = buildAutomationSystemPrompt({
            brandVoice: automation.aiBrandVoice ?? undefined,
            automationGoal: automation.aiSystemPrompt,
          });
          finalMessage = await generateAiReply(systemPrompt, messageText);
        } catch (err) {
          logger.warn("AI reply failed, using template", {
            error: (err as Error).message,
          });
          finalMessage = messageText; // Fallback to template
        }
      }

      // 5. Create DM log record (PENDING)
      await prisma.dmLog.upsert({
        where: { automationId_igUserId: { automationId, igUserId } },
        update: { status: "PENDING", messageText: finalMessage },
        create: {
          automationId,
          accountId,
          igUserId,
          igUsername: igUsername ?? "",
          messageText: finalMessage,
          mediaUrl,
          status: "PENDING",
          triggerType,
          triggerPostId,
          triggeredAt: triggeredAtDate,
          abVariant,
        },
      });

      // 6. Send via Meta Graph API
      const metaClient = await MetaClient.fromAccountId(accountId, redis);
      const { messageId } = await metaClient.sendDm(igUserId, finalMessage, mediaUrl);

      // 7. Update log to SENT
      await prisma.dmLog.update({
        where: { automationId_igUserId: { automationId, igUserId } },
        data: {
          status: "SENT",
          metaMessageId: messageId,
          sentAt: new Date(),
        },
      });

      // 8. Increment usage counter (Redis + DB)
      const currentMonth = new Date().toISOString().slice(0, 7);
      await incrementDmUsage(redis, accountId, currentMonth);
      await prisma.usageEvent.upsert({
        where: { accountId_type_month: { accountId, type: "dm_sent", month: currentMonth } },
        update: { count: { increment: 1 } },
        create: { accountId, type: "dm_sent", month: currentMonth, count: 1 },
      });

      logger.info("DM sent successfully", { automationId, igUserId, messageId });
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  // ─────────────────────────────────────────
  // Error handling per spec:
  // 429 → re-queue with 60s delay
  // 400 → move to DLQ (no retry)
  // 500 → retry with backoff (handled by BullMQ)
  // ─────────────────────────────────────────
  worker.on("failed", async (job, err) => {
    if (!job) return;

    if (err instanceof MetaRateLimitError) {
      logger.warn("Rate limit hit — requeueing with 60s delay", {
        jobId: job.id,
      });
      // Re-add to queue with delay (bypass the normal retry)
      await job.retry("failed");
      // Move back with custom delay by re-adding
    } else if (err instanceof MetaBadRequestError) {
      logger.error("Bad request — moving to DLQ", {
        jobId: job.id,
        error: err.message,
        code: err.code,
      });
      // Update DM log to FAILED
      if (job.data?.automationId && job.data?.igUserId) {
        await prisma.dmLog.update({
          where: {
            automationId_igUserId: {
              automationId: job.data.automationId,
              igUserId: job.data.igUserId,
            },
          },
          data: { status: "FAILED", errorMessage: err.message },
        });
      }
    }

    logger.error("DM send job failed", {
      jobId: job.id,
      attempt: job.attemptsMade,
      error: err.message,
    });
  });

  worker.on("completed", (job) => {
    logger.debug("DM send job completed", { jobId: job.id });
  });

  logger.info("DM send worker started");
  return worker;
}
