import { Worker, type Job } from "bullmq";
import type { Redis } from "ioredis";
import type { RetriggerBatchJobPayload } from "@linkbhejo/types";
import { prisma } from "@linkbhejo/db";
import { MetaClient } from "../services/meta";
import { queueService } from "../services/queue";
import { logger } from "../logger";
import { QUEUES } from "../services/queue";

/**
 * Re-trigger worker: fetches all commenters from a historical post,
 * skips anyone already DM'd, and enqueues DM jobs with rate limiting.
 */
export function startRetriggerBatchWorker(redis: Redis) {
  const worker = new Worker<RetriggerBatchJobPayload>(
    QUEUES.RETRIGGER_BATCH,
    async (job: Job<RetriggerBatchJobPayload>) => {
      const { automationId, accountId, postId, cursor } = job.data;

      logger.info("Processing retrigger batch", {
        jobId: job.id,
        automationId,
        postId,
        cursor,
      });

      const metaClient = await MetaClient.fromAccountId(accountId, redis);

      // Fetch page of commenters
      const { commenters, nextCursor } = await metaClient.getCommenters(
        postId,
        cursor
      );

      // Get already-DM'd users for this automation
      const existingLogs = await prisma.dmLog.findMany({
        where: { automationId, igUserId: { in: commenters.map((c) => c.id) } },
        select: { igUserId: true },
      });
      const alreadySent = new Set(existingLogs.map((l) => l.igUserId));

      // Get automation DM template
      const automation = await prisma.automation.findUnique({
        where: { id: automationId },
      });
      if (!automation) return;

      let enqueued = 0;
      for (const commenter of commenters) {
        if (alreadySent.has(commenter.id)) continue;

        // Enqueue DM with spreading delay to avoid rate limits (1s apart)
        await queueService.enqueueDmSend(
          {
            automationId,
            accountId,
            igUserId: commenter.id,
            igUsername: commenter.username,
            messageText: automation.dmTemplate,
            triggerType: "comment",
            triggerPostId: postId,
            triggeredAt: new Date().toISOString(),
          },
          enqueued * 1000 // spread 1 second apart
        );
        enqueued++;
      }

      logger.info("Retrigger batch page processed", {
        total: commenters.length,
        enqueued,
        hasMore: !!nextCursor,
      });

      // If there are more pages, enqueue the next batch
      if (nextCursor) {
        await queueService.enqueueRetriggerBatch({
          automationId,
          accountId,
          postId,
          cursor: nextCursor,
        });
      }
    },
    { connection: redis as any, concurrency: 2 } // Lower concurrency for batch
  );

  worker.on("failed", (job, err) => {
    logger.error("Retrigger batch job failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  logger.info("Retrigger batch worker started");
  return worker;
}
