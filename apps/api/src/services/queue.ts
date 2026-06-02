import { Queue } from "bullmq";
import type { Redis } from "ioredis";
import type {
  DmSendJobPayload,
  CommentReplyJobPayload,
  SequenceStepJobPayload,
  RetriggerBatchJobPayload,
} from "@linkbhejo/types";
import { logger } from "../logger";

// ─────────────────────────────────────────
// Queue names
// ─────────────────────────────────────────
export const QUEUES = {
  DM_SEND: "dm-send",
  COMMENT_REPLY: "comment-reply",
  LEAD_CAPTURE: "lead-capture",
  SEQUENCE_STEP: "sequence-step",
  RETRIGGER_BATCH: "retrigger-batch",
  WEBHOOK_EVENTS: "webhook-events",
} as const;

// ─────────────────────────────────────────
// Queue instances (lazy init)
// ─────────────────────────────────────────
let dmSendQueue: Queue;
let commentReplyQueue: Queue;
let sequenceStepQueue: Queue;
let retriggerBatchQueue: Queue;
let webhookEventsQueue: Queue;

function getQueueOptions(redis: Redis) {
  return {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential" as const,
        delay: 1000,
      },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    },
  };
}

class QueueService {
  private redis!: Redis;

  init(redis: Redis) {
    this.redis = redis;
    const opts = getQueueOptions(redis);
    dmSendQueue = new Queue(QUEUES.DM_SEND, opts);
    commentReplyQueue = new Queue(QUEUES.COMMENT_REPLY, opts);
    sequenceStepQueue = new Queue(QUEUES.SEQUENCE_STEP, opts);
    retriggerBatchQueue = new Queue(QUEUES.RETRIGGER_BATCH, opts);
    webhookEventsQueue = new Queue(QUEUES.WEBHOOK_EVENTS, opts);
    logger.info("BullMQ queues initialized");
  }

  // ─────────────────────────────────────────
  // Producers
  // ─────────────────────────────────────────

  async enqueueDmSend(payload: DmSendJobPayload, delayMs?: number): Promise<void> {
    const jobId = `dm:${payload.automationId}:${payload.igUserId}`;
    await dmSendQueue.add(jobId, payload, {
      jobId,
      delay: delayMs,
    });
    logger.debug("DM send job enqueued", { jobId, delayMs });
  }

  async enqueueCommentReply(payload: CommentReplyJobPayload): Promise<void> {
    await commentReplyQueue.add(
      `reply:${payload.mediaId}:${payload.commentId}`,
      payload
    );
  }

  async enqueueSequenceStep(
    payload: SequenceStepJobPayload,
    delayMs?: number
  ): Promise<void> {
    await sequenceStepQueue.add(
      `seq:${payload.enrollmentId}:step${payload.stepNumber}`,
      payload,
      { delay: delayMs }
    );
  }

  async enqueueRetriggerBatch(payload: RetriggerBatchJobPayload): Promise<void> {
    await retriggerBatchQueue.add(
      `retrigger:${payload.automationId}:${payload.postId}`,
      payload
    );
  }

  async enqueueWebhookEvent(payload: {
    type: string;
    igAccountId: string;
    payload: any;
  }): Promise<void> {
    await webhookEventsQueue.add(`webhook:${payload.type}:${Date.now()}`, payload);
  }

  getQueues() {
    return {
      dmSendQueue,
      commentReplyQueue,
      sequenceStepQueue,
      retriggerBatchQueue,
      webhookEventsQueue,
    };
  }
}

export const queueService = new QueueService();
