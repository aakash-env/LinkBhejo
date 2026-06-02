import { Worker, type Job } from "bullmq";
import { Redis } from "ioredis";
import { logger } from "../logger";
import { QUEUES } from "../services/queue";
import {
  processCommentEvent,
  processMessageEvent,
  processStoryReply,
  processLiveComment,
} from "../services/automation";

/**
 * Webhook events worker — processes all incoming webhook events from Meta.
 * Events are enqueued by the webhook route handler and processed here asynchronously.
 */
export function startWebhookEventsWorker(redis: Redis) {
  const worker = new Worker<{
    type: string;
    igAccountId: string;
    payload: any;
  }>(
    QUEUES.WEBHOOK_EVENTS,
    async (job: Job) => {
      const { type, igAccountId, payload } = job.data;

      switch (type) {
        case "comment":
          await processCommentEvent(igAccountId, payload);
          break;
        case "message":
          await processMessageEvent(igAccountId, payload);
          break;
        case "story_reply":
          await processStoryReply(igAccountId, payload);
          break;
        case "story_reaction":
          await processStoryReply(igAccountId, payload); // same handler
          break;
        case "live_comment":
          await processLiveComment(igAccountId, payload);
          break;
        default:
          logger.warn("Unknown webhook event type", { type });
      }
    },
    { connection: redis, concurrency: 10 }
  );

  worker.on("failed", (job, err) => {
    logger.error("Webhook event processing failed", {
      jobId: job?.id,
      type: job?.data?.type,
      error: err.message,
    });
  });

  logger.info("Webhook events worker started");
  return worker;
}

// ─────────────────────────────────────────
// Worker entrypoint — starts all workers
// ─────────────────────────────────────────
import { startDmSendWorker } from "./dm-send";
import { startCommentReplyWorker } from "./comment-reply";
import { startSequenceStepWorker } from "./sequence-step";
import { startRetriggerBatchWorker } from "./retrigger-batch";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

logger.info("🔧 Starting LinkBhejo workers...");

startDmSendWorker(redis);
startCommentReplyWorker(redis);
startSequenceStepWorker(redis);
startRetriggerBatchWorker(redis);
startWebhookEventsWorker(redis);

logger.info("✅ All workers running");

process.on("SIGTERM", async () => {
  logger.info("Workers shutting down...");
  await redis.quit();
  process.exit(0);
});
