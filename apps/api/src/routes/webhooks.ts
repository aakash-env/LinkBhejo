import type { FastifyInstance } from "fastify";
import { verifyWebhookSignature } from "@linkbhejo/utils/meta-signature";
import type { MetaWebhookBody } from "@linkbhejo/types";
import { logger } from "../logger";
import { queueService } from "../services/queue";

/**
 * CRITICAL: Webhook endpoint must respond in <200ms.
 * ALL processing is pushed to BullMQ immediately.
 * NO database writes or API calls happen here.
 */
export async function webhookRoutes(app: FastifyInstance) {
  // ─────────────────────────────────────────
  // GET /webhooks/instagram — Meta verification
  // ─────────────────────────────────────────
  app.get<{
    Querystring: {
      "hub.mode": string;
      "hub.verify_token": string;
      "hub.challenge": string;
    };
  }>("/instagram", async (req, reply) => {
    const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;

    if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
      logger.info("Meta webhook verified successfully");
      return reply.status(200).send(challenge);
    }

    logger.warn("Meta webhook verification failed", { mode, token });
    return reply.status(403).send("Verification failed");
  });

  // ─────────────────────────────────────────
  // POST /webhooks/instagram — receive events
  // ─────────────────────────────────────────
  app.post("/instagram", {
    config: { rawBody: true },
  }, async (req, reply) => {
    const startTime = Date.now();

    // 1. Validate signature FIRST — reject bad requests immediately
    const signature = req.headers["x-hub-signature-256"] as string;
    const rawBody = (req as any).rawBody as Buffer;

    if (!rawBody) {
      logger.warn("Webhook received without raw body");
      return reply.status(400).send("Bad request");
    }

    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      process.env.META_WEBHOOK_SECRET ?? ""
    );

    if (!isValid) {
      logger.warn("Webhook signature validation failed", { signature });
      return reply.status(403).send("Invalid signature");
    }

    // 2. Return 200 IMMEDIATELY — Meta requires response within 200ms
    reply.status(200).send("EVENT_RECEIVED");

    // 3. Process events AFTER response (fire-and-forget)
    const body = req.body as MetaWebhookBody;

    try {
      for (const entry of body.entry ?? []) {
        // Handle messaging events (DMs, story replies)
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message) {
              await queueService.enqueueWebhookEvent({
                type: "message",
                igAccountId: entry.id,
                payload: event,
              });
            } else if (event.reaction) {
              await queueService.enqueueWebhookEvent({
                type: "story_reaction",
                igAccountId: entry.id,
                payload: event,
              });
            }
          }
        }

        // Handle change events (comments, live comments)
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === "comments") {
              await queueService.enqueueWebhookEvent({
                type: "comment",
                igAccountId: entry.id,
                payload: change.value,
              });
            } else if (change.field === "live_comments") {
              await queueService.enqueueWebhookEvent({
                type: "live_comment",
                igAccountId: entry.id,
                payload: change.value,
              });
            } else if (change.field === "story_insights") {
              await queueService.enqueueWebhookEvent({
                type: "story_reply",
                igAccountId: entry.id,
                payload: change.value,
              });
            }
          }
        }
      }

      const elapsed = Date.now() - startTime;
      logger.info("Webhook processed", {
        elapsed,
        entries: body.entry?.length ?? 0,
      });
    } catch (err) {
      logger.error("Error processing webhook event", {
        error: (err as Error).message,
      });
    }
  });
}
