import { Worker, type Job } from "bullmq";
import type { Redis } from "ioredis";
import type { CommentReplyJobPayload } from "@linkbhejo/types";
import { MetaClient } from "../services/meta";
import { logger } from "../logger";
import { QUEUES } from "../services/queue";

export function startCommentReplyWorker(redis: Redis) {
  const worker = new Worker<CommentReplyJobPayload>(
    QUEUES.COMMENT_REPLY,
    async (job: Job<CommentReplyJobPayload>) => {
      const { accountId, mediaId, commentId, replyText } = job.data;

      logger.info("Processing comment reply job", { jobId: job.id, mediaId, commentId });

      const metaClient = await MetaClient.fromAccountId(accountId, redis);
      await metaClient.replyToComment(mediaId, replyText);

      logger.info("Comment reply posted", { mediaId, commentId });
    },
    { connection: redis, concurrency: 5 }
  );

  worker.on("failed", (job, err) => {
    logger.error("Comment reply job failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  logger.info("Comment reply worker started");
  return worker;
}
