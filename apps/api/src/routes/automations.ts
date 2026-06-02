import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@linkbhejo/db";
import { logger } from "../logger";
import { queueService } from "../services/queue";

const createAutomationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["COMMENT", "STORY", "LIVE", "DM_REPLY"]),
  postId: z.string().optional(),
  watchAllPosts: z.boolean().default(false),
  dmTemplate: z.string().min(1),
  commentReplyEnabled: z.boolean().default(true),
  commentReplyTemplate: z.string().optional(),
  delaySeconds: z.number().min(0).max(60).default(0),
  followGate: z.boolean().default(false),
  followGateMessage: z.string().optional(),
  aiEnabled: z.boolean().default(false),
  aiSystemPrompt: z.string().optional(),
  keywords: z.array(
    z.object({
      keyword: z.string().min(1),
      matchType: z.enum(["EXACT", "CONTAINS", "STARTS_WITH"]).default("CONTAINS"),
    })
  ).min(0),
});

export async function automationRoutes(app: FastifyInstance) {
  // GET /automations — list for current account
  app.get("/", async (req, reply) => {
    const { accountId } = (req as any).user;
    
    const automations = await prisma.automation.findMany({
      where: { accountId, deletedAt: null },
      include: {
        rules: true,
        _count: {
          select: { dmLogs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({ success: true, data: automations });
  });

  // GET /automations/:id — single automation with logs
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const { accountId } = (req as any).user;
    const { id } = req.params;

    const automation = await prisma.automation.findFirst({
      where: { id, accountId, deletedAt: null },
      include: {
        rules: true,
        abTests: true,
        sequences: { include: { steps: true } },
        dmLogs: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!automation) {
      return reply.status(404).send({ success: false, error: "Automation not found" });
    }

    return reply.send({ success: true, data: automation });
  });

  // POST /automations — create
  app.post("/", async (req, reply) => {
    const { accountId } = (req as any).user;
    const parsed = createAutomationSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { keywords, ...data } = parsed.data;

    const automation = await prisma.automation.create({
      data: {
        ...data,
        accountId,
        status: "DRAFT",
        rules: {
          create: keywords.map((k) => ({
            keyword: k.keyword.toLowerCase(),
            matchType: k.matchType,
            caseSensitive: false,
          })),
        },
      },
      include: { rules: true },
    });

    logger.info("Automation created", { automationId: automation.id, accountId });
    return reply.status(201).send({ success: true, data: automation });
  });

  // PATCH /automations/:id — update
  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const { accountId } = (req as any).user;
    const { id } = req.params;
    const body = req.body as any;

    const existing = await prisma.automation.findFirst({
      where: { id, accountId, deletedAt: null },
    });

    if (!existing) {
      return reply.status(404).send({ success: false, error: "Automation not found" });
    }

    const { keywords, ...updateData } = body;

    const automation = await prisma.automation.update({
      where: { id },
      data: {
        ...updateData,
        ...(keywords && {
          rules: {
            deleteMany: {},
            create: keywords.map((k: any) => ({
              keyword: k.keyword.toLowerCase(),
              matchType: k.matchType ?? "CONTAINS",
              caseSensitive: false,
            })),
          },
        }),
      },
      include: { rules: true },
    });

    return reply.send({ success: true, data: automation });
  });

  // DELETE /automations/:id — soft delete
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const { accountId } = (req as any).user;
    const { id } = req.params;

    const existing = await prisma.automation.findFirst({
      where: { id, accountId, deletedAt: null },
    });

    if (!existing) {
      return reply.status(404).send({ success: false, error: "Automation not found" });
    }

    await prisma.automation.update({
      where: { id },
      data: { deletedAt: new Date(), status: "PAUSED" },
    });

    logger.info("Automation soft-deleted", { automationId: id, accountId });
    return reply.send({ success: true, message: "Automation deleted" });
  });

  // POST /automations/:id/retrigger — re-run on old post
  app.post<{
    Params: { id: string };
    Body: { postId: string };
  }>("/:id/retrigger", async (req, reply) => {
    const { accountId } = (req as any).user;
    const { id } = req.params;
    const { postId } = req.body as { postId: string };

    if (!postId) {
      return reply.status(400).send({ success: false, error: "postId is required" });
    }

    const automation = await prisma.automation.findFirst({
      where: { id, accountId, deletedAt: null },
    });

    if (!automation) {
      return reply.status(404).send({ success: false, error: "Automation not found" });
    }

    await queueService.enqueueRetriggerBatch({
      automationId: id,
      accountId,
      postId,
    });

    logger.info("Retrigger batch enqueued", { automationId: id, postId });
    return reply.send({ success: true, message: "Retrigger batch started" });
  });

  // POST /automations/:id/toggle — pause/resume
  app.post<{ Params: { id: string } }>("/:id/toggle", async (req, reply) => {
    const { accountId } = (req as any).user;
    const { id } = req.params;

    const automation = await prisma.automation.findFirst({
      where: { id, accountId, deletedAt: null },
    });

    if (!automation) {
      return reply.status(404).send({ success: false, error: "Automation not found" });
    }

    const newStatus =
      automation.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

    await prisma.automation.update({
      where: { id },
      data: { status: newStatus },
    });

    return reply.send({ success: true, data: { status: newStatus } });
  });
}
