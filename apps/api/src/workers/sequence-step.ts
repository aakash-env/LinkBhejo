import { Worker, type Job } from "bullmq";
import type { Redis } from "ioredis";
import { prisma } from "@linkbhejo/db";
import { queueService } from "../services/queue";
import { logger } from "../logger";
import { QUEUES } from "../services/queue";
import type { SequenceStepJobPayload } from "@linkbhejo/types";

export function startSequenceStepWorker(redis: Redis) {
  const worker = new Worker<SequenceStepJobPayload>(
    QUEUES.SEQUENCE_STEP,
    async (job: Job<SequenceStepJobPayload>) => {
      const { enrollmentId, sequenceId, stepNumber, accountId, igUserId } = job.data;

      logger.info("Processing sequence step", {
        enrollmentId,
        stepNumber,
      });

      // Check enrollment is still active
      const enrollment = await prisma.sequenceEnrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (!enrollment || enrollment.status !== "ACTIVE") {
        logger.info("Sequence enrollment inactive — skipping step", {
          enrollmentId,
          status: enrollment?.status,
        });
        return;
      }

      // Get the step
      const step = await prisma.sequenceStep.findFirst({
        where: { sequenceId, stepNumber },
      });

      if (!step) {
        // No more steps — mark as completed
        await prisma.sequenceEnrollment.update({
          where: { id: enrollmentId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        return;
      }

      // Get automationId from sequence
      const sequence = await prisma.sequence.findUnique({
        where: { id: sequenceId },
        select: { automationId: true },
      });

      if (!sequence) return;

      // Send the DM
      await queueService.enqueueDmSend({
        automationId: sequence.automationId,
        accountId,
        igUserId,
        messageText: step.template,
        mediaUrl: step.mediaUrl ?? undefined,
        triggerType: "dm_keyword",
        triggeredAt: new Date().toISOString(),
      });

      // Update current step
      await prisma.sequenceEnrollment.update({
        where: { id: enrollmentId },
        data: { currentStep: stepNumber },
      });

      // Schedule next step (if exists)
      const nextStep = await prisma.sequenceStep.findFirst({
        where: { sequenceId, stepNumber: stepNumber + 1 },
      });

      if (nextStep) {
        const delayMs = nextStep.dayOffset * 24 * 60 * 60 * 1000;
        await queueService.enqueueSequenceStep(
          {
            enrollmentId,
            sequenceId,
            stepNumber: stepNumber + 1,
            accountId,
            igUserId,
          },
          delayMs
        );
        logger.info("Next sequence step scheduled", {
          step: stepNumber + 1,
          delayDays: nextStep.dayOffset,
        });
      } else {
        // Last step — complete
        await prisma.sequenceEnrollment.update({
          where: { id: enrollmentId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      }
    },
    { connection: redis, concurrency: 3 }
  );

  worker.on("failed", (job, err) => {
    logger.error("Sequence step job failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  logger.info("Sequence step worker started");
  return worker;
}
