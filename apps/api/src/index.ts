import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import * as Sentry from "@sentry/node";
import { Redis } from "ioredis";
import { logger } from "./logger";
import { webhookRoutes } from "./routes/webhooks";
import { automationRoutes } from "./routes/automations";
import { accountRoutes } from "./routes/accounts";
import { leadRoutes } from "./routes/leads";
import { analyticsRoutes } from "./routes/analytics";
import { billingRoutes } from "./routes/billing";
import { authMiddleware } from "./middleware/auth";

// ─────────────────────────────────────────
// Sentry init
// ─────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
  });
}

// ─────────────────────────────────────────
// Redis client (shared)
// ─────────────────────────────────────────
export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null, // Required for BullMQ
});

redis.on("error", (err) => {
  logger.error("Redis connection error", { error: err.message });
});

// ─────────────────────────────────────────
// Fastify instance
// ─────────────────────────────────────────
const app = Fastify({
  logger: false, // We use Winston
  trustProxy: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB
});

// ─────────────────────────────────────────
// Boot
// ─────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? "3001", 10);

async function bootstrap() {
  try {
    await app.register(cors, {
      origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });

    await app.register(helmet, {
      contentSecurityPolicy: false, // handled by Next.js
    });

    await app.register(rateLimit, {
      redis,
      max: 100,
      timeWindow: "1 minute",
      keyGenerator: (req) => {
        return (req.headers["x-forwarded-for"] as string) ?? req.ip;
      },
    });

    await app.register(multipart, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file uploads
    });

    // Webhooks — no auth (Meta signs the request)
    await app.register(webhookRoutes, { prefix: "/webhooks" });

    // Protected routes — require JWT
    await app.register(async (protectedApp) => {
      protectedApp.addHook("preHandler", authMiddleware);
      await protectedApp.register(automationRoutes, { prefix: "/automations" });
      await protectedApp.register(accountRoutes, { prefix: "/accounts" });
      await protectedApp.register(leadRoutes, { prefix: "/leads" });
      await protectedApp.register(analyticsRoutes, { prefix: "/analytics" });
      await protectedApp.register(billingRoutes, { prefix: "/billing" });
    });

    await app.listen({ port: PORT, host: "0.0.0.0" });
    logger.info(`🚀 LinkBhejo API running on port ${PORT}`);
  } catch (err) {
    logger.error("Failed to start server", { error: err });
    process.exit(1);
  }
}

bootstrap();

// ─────────────────────────────────────────
// Graceful shutdown
// ─────────────────────────────────────────
const shutdown = async () => {
  logger.info("Shutting down gracefully...");
  await app.close();
  await redis.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
